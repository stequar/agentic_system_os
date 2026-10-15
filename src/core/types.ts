export type CompanyState = 
  | "STANDUP"
  | "SPECIFY"
  | "DELEGATE"
  | "IMPLEMENT"
  | "GATEKEEPER"
  | "CODE_REVIEW"
  | "MERGE_RELEASE";

export interface CompanyTransition {
  from: CompanyState;
  to: CompanyState;
  guard: () => Promise<boolean> | boolean;
  description: string;
}
