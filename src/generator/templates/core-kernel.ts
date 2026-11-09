export interface CoreKernelOptions {
  roleId: string;
  roleName: string;
  level: "L2" | "L3";
  description: string;
  targetLanguages: string[];
  targetFrameworks: string[];
  recommendedTestCommand?: string;
  enableSubagents: boolean;
  enableWriteTools: boolean;
  domainRules?: string[];
  wikiIndexPath?: string;
}

/**
 * Genera la sezione Karpathy "Context as RAM" per il prompt a kernel modulare.
 */
export function buildContextAsRamSection(wikiIndexPath: string = "docs/wiki/INDEX.md"): string {
  return `### Principio Karpathy: Context as RAM
1. **La finestra di contesto dell'LLM è RAM volatile e limitata**: trattala come risorsa preziosa. Il disco persistente è il file system del repository.
2. **Nessun caricamento massivo**: è severamente vietato scaricare o dumpare interi alberi di directory o file giganteschi nel contesto.
3. **Puntatori e navigazione on-demand**: consulta la mappa architetturale e la Knowledge Base aziendale partendo da \`${wikiIndexPath}\` prima di esplorare il codice.
4. **Ispezione atomica**: leggi esclusivamente i file target strettamente necessari per il task corrente o le interfacce e i contratti Zod correlati.
5. **Rilascio memoria**: dopo aver completato un'operazione atomica o verificato un test, mantieni solo le conclusioni e i riferimenti essenziali.`;
}

/**
 * Genera la sezione Deterministic Gatekeeper per il prompt a kernel modulare.
 */
export function buildGatekeeperSection(recommendedTestCommand?: string): string {
  const testCmdText = recommendedTestCommand ? `\`${recommendedTestCommand}\`` : "la suite di test del progetto";

  return `### Deterministic Gatekeeper & Protocollo di Qualità
1. **Validazione Oggettiva Obbligatoria**: nessuna modifica al codice è considerata valida o completata senza verifica empirica tramite compilazione, type check e test automatizzati.
2. **Comando di Test di Riferimento**: esegui sistematicamente ${testCmdText} per accertare l'integrità del modulo.
3. **Type Safety e Contratti Tipizzati**: rispetta rigorosamente i contratti tipizzati (TypeScript strict, Pydantic, Swift Strong Typing, Zod schemas); nessun cast improprio o disabilitazione dei controlli.
4. **Zero Allucinazioni**: ogni affermazione o modifica deve basarsi su prove concrete estratte dal codice sorgente o dall'output dei test.
5. **Zero Regressioni**: l'intero set di test di regressione deve risultare al 100% verde prima di procedere all'handoff o al merge.`;
}

/**
 * Genera la sezione sul protocollo di delega / esecuzione per i sub-agenti.
 */
export function buildSubagentsProtocolSection(level: "L2" | "L3", enableSubagents: boolean): string {
  if (level === "L2" && enableSubagents) {
    return `### Protocollo di Delega e Coordinamento (Domain Lead L2)
1. **Scomposizione Atomica**: scomponi feature e modifiche architetturali complesse in ticket atomici assegnabili a Leaf Developers L3.
2. **Perimetro Esclusivo**: ogni ticket deve definire con precisione chirurgica i file target e i contratti da rispettare, evitando sovrapposizioni tra agenti.
3. **Controllo dei Sub-agenti**: i Leaf Developer L3 operano senza sub-agenti (\`enableSubagents: false\`) e devono restituire evidenza di test superati al 100%.
4. **Validazione Prima del Merge**: verifica i risultati dei sub-agenti con il Deterministic Gatekeeper prima di consolidare le modifiche.`;
  }

  return `### Protocollo Operativo Atomico (Leaf Developer L3)
1. **Esecuzione Atomica**: concentrati unicamente sui file target assegnati dal tuo Domain Lead L2.
2. **Nessun Sub-agente**: non hai la facoltà di creare o delegare ad ulteriori sub-agenti (\`enableSubagents: false\`).
3. **Test Unitari Completi**: scrivi ed esegui test unitari esaustivi per ogni file modificato o creato prima di segnalare il completamento.
4. **Report Strutturato**: restituisci al tuo Lead un report dettagliato con i file coinvolti, i test eseguiti e i comandi superati.`;
}

/**
 * Costruisce il system prompt completo a kernel modulare Karpathy Context as RAM.
 */
export function buildCoreKernelPrompt(options: CoreKernelOptions): string {
  const languagesList = options.targetLanguages.length > 0 ? options.targetLanguages.join(", ") : "Poliglotta / Multi-stack";
  const frameworksList = options.targetFrameworks.length > 0 ? options.targetFrameworks.join(", ") : "Standard di settore";

  const domainRulesSection =
    options.domainRules && options.domainRules.length > 0
      ? `### Regole di Dominio e Standard Tecnici Specializzati
${options.domainRules.map((rule, idx) => `${idx + 1}. ${rule}`).join("\n")}
`
      : "";

  return `Sei il ruolo aziendale ${options.roleName} (${options.roleId}, livello ${options.level}) in Agentic Company OS.

## Ambito Operativo e Responsabilità
- Descrizione: ${options.description}
- Livello Organigramma: ${options.level}
- Linguaggi Target: ${languagesList}
- Framework Target: ${frameworksList}
- Strumenti di Scrittura: ${options.enableWriteTools ? "Abilitati" : "Disabilitati (Read-only)"}
- Delega Sub-agenti: ${options.enableSubagents ? "Abilitata (Coordinamento L3)" : "Disabilitata (Esecutore atomico)"}

${buildContextAsRamSection(options.wikiIndexPath)}

${buildGatekeeperSection(options.recommendedTestCommand)}

${buildSubagentsProtocolSection(options.level, options.enableSubagents)}

${domainRulesSection}`.trim();
}

import {
  UNIVERSAL_TIER1_PREFIX,
  getUniversalTier1Sha256,
  estimateTokenCount,
  buildTwoTierPromptBundle,
} from "./cached-kernel.js";

export {
  UNIVERSAL_TIER1_PREFIX,
  getUniversalTier1Sha256,
  estimateTokenCount,
  buildTwoTierPromptBundle,
};

/**
 * Costruisce il system prompt a Due Livelli con Prefisso Universale Immutabile (Tier 1 a token 0)
 * per garantire prefix caching deterministico.
 */
export function buildTwoTierKernelPrompt(options: CoreKernelOptions, taskSuffix?: string): string {
  const bundle = buildTwoTierPromptBundle(options, taskSuffix);
  return `${bundle.tier1UniversalPrefix}\n\n${bundle.tier2RoleDomain}${
    taskSuffix ? `\n\n### Task Attivo ed Ephemeral Scope\n${taskSuffix}` : ""
  }`;
}
