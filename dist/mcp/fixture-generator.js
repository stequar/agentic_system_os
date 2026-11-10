import { z } from "zod";
import { DynamicMcpToolSchema, } from "../contracts/frontiers.js";
import { verifyDynamicToolAst, runDynamicToolInSandbox, } from "./sandbox-runner.js";
/**
 * Categorie obbligatorie di fixture sintetiche per il Pre-Flight Verification Gate (TCK-19.4).
 */
export const FixtureCategorySchema = z.enum([
    "HAPPY_PATH",
    "BOUNDARY_EDGE",
    "NEGATIVE_MALFORMED",
]);
/**
 * Singola fixture sintetica generata a partire dal JSON Schema del tool.
 */
export const SyntheticFixtureSchema = z.object({
    category: FixtureCategorySchema,
    name: z.string(),
    description: z.string(),
    input: z.record(z.unknown()),
    expectGracefulRejectionOrSuccess: z.boolean().default(false),
});
/**
 * Esito dell'esecuzione di una singola fixture in sandbox.
 */
export const FixtureExecutionReportSchema = z.object({
    category: FixtureCategorySchema,
    name: z.string(),
    input: z.record(z.unknown()),
    passed: z.boolean(),
    executionTimeMs: z.number().nonnegative(),
    output: z.unknown().optional(),
    error: z.string().optional(),
});
function parseInputSchema(inputSchemaJson) {
    try {
        const parsed = JSON.parse(inputSchemaJson);
        if (parsed && typeof parsed === "object") {
            return parsed;
        }
    }
    catch {
        // Fallback su schema base in caso di JSON non parsabile
    }
    return {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
    };
}
function sampleHappyValue(type, key = "field") {
    switch (type) {
        case "number":
        case "integer":
            return 42;
        case "boolean":
            return true;
        case "array":
            return [`sample_${key}_item`];
        case "object":
            return { key: `sample_${key}` };
        case "string":
        default:
            return `nominal_${key}_value`;
    }
}
function sampleBoundaryValue(type) {
    switch (type) {
        case "number":
        case "integer":
            return 0;
        case "boolean":
            return false;
        case "array":
            return [];
        case "object":
            return {};
        case "string":
        default:
            return "";
    }
}
function sampleMalformedValue(type) {
    switch (type) {
        case "number":
        case "integer":
            return "NOT_A_NUMBER_MALFORMED";
        case "boolean":
            return "NOT_A_BOOLEAN_MALFORMED";
        case "array":
            return "NOT_AN_ARRAY_MALFORMED";
        case "object":
            return "NOT_AN_OBJECT_MALFORMED";
        case "string":
        default:
            return { __invalidTypeForString: 9999 };
    }
}
/**
 * Genera automaticamente le 3 categorie di fixture sintetiche (`HAPPY_PATH`,
 * `BOUNDARY_EDGE`, `NEGATIVE_MALFORMED`) a partire da `tool.inputSchemaJson`.
 */
export function generateSyntheticFixtures(tool) {
    const schema = parseInputSchema(tool.inputSchemaJson);
    const properties = schema.properties ?? { query: { type: "string" } };
    const propEntries = Object.entries(properties);
    const happyInput = {};
    const boundaryInput = {};
    const malformedInput = {};
    if (propEntries.length === 0) {
        happyInput.query = "nominal_query_value";
        boundaryInput.query = "";
        malformedInput.query = { __malformed: true };
    }
    else {
        for (const [key, propSpec] of propEntries) {
            happyInput[key] = sampleHappyValue(propSpec?.type, key);
            boundaryInput[key] = sampleBoundaryValue(propSpec?.type);
            malformedInput[key] = sampleMalformedValue(propSpec?.type);
        }
    }
    return [
        SyntheticFixtureSchema.parse({
            category: "HAPPY_PATH",
            name: `${tool.name}_happy_path`,
            description: "Input nominale conforme a tutte le proprietà di inputSchemaJson",
            input: happyInput,
            expectGracefulRejectionOrSuccess: false,
        }),
        SyntheticFixtureSchema.parse({
            category: "BOUNDARY_EDGE",
            name: `${tool.name}_boundary_edge`,
            description: "Input con valori limite (stringhe vuote, 0, array/oggetti vuoti)",
            input: boundaryInput,
            expectGracefulRejectionOrSuccess: false,
        }),
        SyntheticFixtureSchema.parse({
            category: "NEGATIVE_MALFORMED",
            name: `${tool.name}_negative_malformed`,
            description: "Input malformato con tipi errati per verificare il rifiuto controllato senza crash",
            input: malformedInput,
            expectGracefulRejectionOrSuccess: true,
        }),
    ];
}
/**
 * Esegue il Pre-Flight Verification Gate completo ("Zero Unverified Dynamic Code"):
 * 1. Analisi statica `verifyDynamicToolAst`
 * 2. Esecuzione in sandbox di tutte le fixture (`HAPPY_PATH`, `BOUNDARY_EDGE`, `NEGATIVE_MALFORMED`)
 * Restituisce il tool certificato con `status: "TEST_PASSED"` solo se il 100% delle verifiche passa;
 * altrimenti imposta `status: "QUARANTINED"`.
 */
export async function runPreFlightVerification(tool, code, customFixtures, timeoutMs = 3000) {
    const astCheck = verifyDynamicToolAst(code, tool.permissions);
    if (!astCheck.safe) {
        const quarantinedTool = DynamicMcpToolSchema.parse({
            ...tool,
            status: "QUARANTINED",
        });
        return {
            tool: quarantinedTool,
            passed: false,
            allPassed: false,
            status: "QUARANTINED",
            astCheck,
            fixtureResults: [],
            totalTests: 0,
            passedTests: 0,
            failedTests: 1,
        };
    }
    const fixtures = customFixtures && customFixtures.length > 0
        ? customFixtures
        : generateSyntheticFixtures(tool);
    const fixtureResults = [];
    for (const fixture of fixtures) {
        const execResult = await runDynamicToolInSandbox(tool, code, fixture.input, timeoutMs);
        let fixturePassed = false;
        if (fixture.category === "NEGATIVE_MALFORMED" || fixture.expectGracefulRejectionOrSuccess) {
            // Per la fixture negativa/malformata, il tool deve gestire o rifiutare l'input
            // senza andare in timeout, OOM, AST violation o crash non gestito (TypeError/ReferenceError/SyntaxError).
            const isUnhandledCrash = execResult.quarantined ||
                /Cannot read properties of|is not defined|SyntaxError|timed out|memory limit/i.test(execResult.error ?? "");
            fixturePassed = !isUnhandledCrash;
        }
        else {
            // Per HAPPY_PATH e BOUNDARY_EDGE, l'esecuzione deve avere successo pieno (success: true, !quarantined)
            fixturePassed = execResult.success && !execResult.quarantined;
        }
        fixtureResults.push(FixtureExecutionReportSchema.parse({
            category: fixture.category,
            name: fixture.name,
            input: fixture.input,
            passed: fixturePassed,
            executionTimeMs: execResult.executionTimeMs,
            output: execResult.output,
            error: execResult.error,
        }));
    }
    const passedTests = fixtureResults.filter((r) => r.passed).length;
    const totalTests = fixtureResults.length;
    const failedTests = totalTests - passedTests;
    const allPassed = totalTests > 0 && failedTests === 0;
    const finalStatus = allPassed
        ? "TEST_PASSED"
        : "QUARANTINED";
    const updatedTool = DynamicMcpToolSchema.parse({
        ...tool,
        status: finalStatus,
    });
    return {
        tool: updatedTool,
        passed: allPassed,
        allPassed,
        status: finalStatus,
        astCheck,
        fixtureResults,
        totalTests,
        passedTests,
        failedTests,
    };
}
//# sourceMappingURL=fixture-generator.js.map