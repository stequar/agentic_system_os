import { CompanyState, CompanyTransition } from "./types.js";

export class CompanyStateMachine {
  private currentState: CompanyState;
  private transitions: CompanyTransition[] = [];

  constructor(initialState: CompanyState = "STANDUP") {
    this.currentState = initialState;
    this.initDefaultTransitions();
  }

  public getState(): CompanyState {
    return this.currentState;
  }

  private initDefaultTransitions(): void {
    this.transitions = [
      {
        from: "STANDUP",
        to: "SPECIFY",
        guard: () => true,
        description: "Il CEO autorizza la partenza dello sprint.",
      },
      {
        from: "SPECIFY",
        to: "DELEGATE",
        guard: () => true,
        description: "I contratti tipizzati Zod sono validati e pronti.",
      },
      {
        from: "DELEGATE",
        to: "IMPLEMENT",
        guard: () => true,
        description: "I task sono assegnati ai Leaf Developers.",
      },
      {
        from: "IMPLEMENT",
        to: "GATEKEEPER",
        guard: () => true,
        description: "Il codice è scritto e sottomesso per i test.",
      },
      {
        from: "GATEKEEPER",
        to: "CODE_REVIEW",
        guard: () => true,
        description: "Typecheck e test unitari superati con successo.",
      },
      {
        from: "CODE_REVIEW",
        to: "MERGE_RELEASE",
        guard: () => true,
        description: "Il Manager approva la PR secondo le linee guida architetturali.",
      },
    ];
  }

  public async transitionTo(nextState: CompanyState): Promise<boolean> {
    const validTransition = this.transitions.find(
      (t) => t.from === this.currentState && t.to === nextState
    );

    if (!validTransition) {
      throw new Error(
        `Transizione non valida: impossibile passare da ${this.currentState} a ${nextState}`
      );
    }

    const canProceed = await validTransition.guard();
    if (!canProceed) {
      return false;
    }

    this.currentState = nextState;
    return true;
  }
}
