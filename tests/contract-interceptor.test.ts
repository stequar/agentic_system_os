import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  ContractInterceptor,
  ContractViolationError,
} from "../src/core/contract-interceptor.js";
import { CompanyEventBus } from "../src/core/event-bus.js";
import { CompanyStateMachine } from "../src/core/state-machine.js";

const UserTaskSchema = z.object({
  taskId: z.string().min(1),
  assignedTo: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

describe("Runtime Contract Interceptor Middleware", () => {
  it("valida ed accetta payload conformi restituendo i dati tipizzati", () => {
    const validPayload = {
      taskId: "task-101",
      assignedTo: "leaf-dev-1",
      priority: "HIGH",
    };

    const validated = ContractInterceptor.enforce(UserTaskSchema, validPayload, {
      contractName: "UserTaskSchema",
      actionOrTransition: "TASK_ASSIGNMENT",
    });

    expect(validated.taskId).toBe("task-101");
    expect(validated.priority).toBe("HIGH");
  });

  it("blocca immediatamente con Fail Loudly (ContractViolationError) se mancano campi obbligatori", () => {
    const invalidPayload = {
      taskId: "task-102",
      // missing assignedTo and priority
    };

    expect(() =>
      ContractInterceptor.enforce(UserTaskSchema, invalidPayload, {
        contractName: "UserTaskSchema",
        actionOrTransition: "TASK_ASSIGNMENT",
      })
    ).toThrow(ContractViolationError);

    try {
      ContractInterceptor.enforce(UserTaskSchema, invalidPayload, {
        contractName: "UserTaskSchema",
      });
    } catch (err: any) {
      expect(err).toBeInstanceOf(ContractViolationError);
      expect(err.syntheticDiagnostic).toContain("UserTaskSchema");
      expect(err.violationEvent.violations.length).toBeGreaterThan(0);
    }
  });

  it("applica strict() per default rifiutando allucinazioni o campi non previsti dallo schema", () => {
    const payloadWithHallucinations = {
      taskId: "task-103",
      assignedTo: "leaf-dev-2",
      priority: "LOW",
      hallucinatedField: "infiltrated value",
    };

    expect(() =>
      ContractInterceptor.enforce(UserTaskSchema, payloadWithHallucinations, {
        contractName: "UserTaskSchema",
      })
    ).toThrow(ContractViolationError);
  });

  it("supporta strict: false quando esplicitamente configurato", () => {
    const payloadWithExtra = {
      taskId: "task-104",
      assignedTo: "leaf-dev-3",
      priority: "MEDIUM",
      extraMetadata: "allowed because strict=false",
    };

    const result = ContractInterceptor.enforce(UserTaskSchema, payloadWithExtra, {
      contractName: "UserTaskSchema",
      strict: false,
    });

    expect(result.taskId).toBe("task-104");
  });

  it("check() esegue la verifica soft senza sollevare eccezioni", () => {
    const invalidPayload = { taskId: 123 }; // taskId must be string
    const checkResult = ContractInterceptor.check(UserTaskSchema, invalidPayload);

    expect(checkResult.success).toBe(false);
    if (!checkResult.success) {
      expect(checkResult.violations.length).toBeGreaterThan(0);
      expect(checkResult.syntheticDiagnostic).toContain("Violazione contratto");
    }
  });

  it("notifica CompanyEventBus con evento CONTRACT_VIOLATION in caso di errore", () => {
    const bus = new CompanyEventBus();
    let eventReceived = false;

    bus.subscribe("CONTRACT_VIOLATION", (event) => {
      eventReceived = true;
      expect(event.level).toBe("error");
      expect(event.payload.contractName).toBe("UserTaskSchema");
    });

    try {
      ContractInterceptor.enforce(UserTaskSchema, { invalid: true }, {
        contractName: "UserTaskSchema",
        eventBus: bus,
      });
    } catch {
      // Ignora l'eccezione
    }

    expect(eventReceived).toBe(true);
  });

  it("integrazione protetta in CompanyStateMachine valida i payload di transizione", async () => {
    const sm = new CompanyStateMachine("STANDUP");

    const StandupPayloadSchema = z.object({
      sprintGoal: z.string(),
      leadApproved: z.boolean(),
    });

    sm.registerTransitionSchema("STANDUP", "SPECIFY", StandupPayloadSchema);

    // Tentativo con payload non valido: deve fallire e rimanere in STANDUP
    await expect(
      sm.transitionTo("SPECIFY", { sprintGoal: 123 }) // invalid type
    ).rejects.toThrow(ContractViolationError);

    expect(sm.getState()).toBe("STANDUP");

    // Tentativo con payload valido: passa a SPECIFY
    const success = await sm.transitionTo("SPECIFY", {
      sprintGoal: "Rilascio Sprint 9",
      leadApproved: true,
    });

    expect(success).toBe(true);
    expect(sm.getState()).toBe("SPECIFY");
  });
});
