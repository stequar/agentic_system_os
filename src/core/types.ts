export type CompanyState = 
  | "STANDUP"
  | "INVESTIGATE_RCA"
  | "RND_DISCOVERY"
  | "RND_ROUNDTABLE"
  | "RND_CONSENSUS"
  | "TECH_VALIDATION"
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
