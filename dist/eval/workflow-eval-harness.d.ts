import { type WorkflowEvalScorecard } from "../contracts/workflow-eval.js";
/**
 * Esegue la valutazione comportamentale e strutturale completa del workflow sui 7 Assi (`W1..W7`)
 * sia su `agentic_company_os` (Self-Hosting) sia su qualsiasi repository target (`fitness_project`).
 */
export declare function runWorkflowBehavioralEval(targetPath: string): Promise<WorkflowEvalScorecard>;
//# sourceMappingURL=workflow-eval-harness.d.ts.map