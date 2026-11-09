import {
  TelegraphicMessageSchema,
  type TelegraphicMessage,
} from "../contracts/ceremonies.js";

/**
 * Regex per l'individuazione e rimozione dei convenevoli e preamboli conversazionali (fluff).
 */
const FLUFF_PATTERNS = [
  /^(Certamente|Sicuramente|Certamente!|Certamente,|Ecco il codice[:]?|Ecco la soluzione[:]?|Ecco qui[:]?)/im,
  /^(Ciao!|Salve!|Buongiorno|Buonasera|Hello!|Hi!|Sure!|Certainly!|Here is the code[:]?|Here you go[:]?)/im,
  /(Spero che questo aiuti|Fammi sapere se hai bisogno di altro|Resto a disposizione|Let me know if you need anything else|Hope this helps|Best regards|Cordiali saluti)[.!]?/gi,
  /(Grazie mille|Grazie!|Grazie per l'aggiornamento|Thank you very much|Thanks!)[.!]?/gi,
  /(Come posso aiutarti oggi\?|How can I help you today\?)/gi,
  /(Non esitare a chiedere|Feel free to ask)[.!]?/gi,
];

export interface FluffStrippingResult {
  cleanedText: string;
  removedFluffCount: number;
}

export interface PreservationCheckResult {
  preserved: boolean;
  missingArtifacts: string[];
}

export interface TokenSavingsSummary {
  originalTokens: number;
  compressedTokens: number;
  savingsTokens: number;
  savingsRatioPercent: number;
}

/**
 * Modulo Caveman-RPC Formatter & Zero-Fluff Enforcer.
 * Converte i passaggi di consegne inter-agente in comunicazioni telegrafiche a zero token bloat,
 * preservando in modo deterministico al 100% blocchi di codice, path dei file, comandi e hash.
 */
export class CavemanFormatter {
  /**
   * Crea un messaggio telegrafico strutturato conforme a TelegraphicMessageSchema.
   */
  public static createMessage(
    params: Omit<TelegraphicMessage, "zeroFluff" | "timestamp">
  ): TelegraphicMessage {
    return TelegraphicMessageSchema.parse({
      ...params,
      zeroFluff: true,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Rimuove determinismo e pattern conversazionali superflui dal testo in ingresso.
   */
  public static stripFluff(text: string): FluffStrippingResult {
    let cleaned = text;
    let count = 0;

    for (const pattern of FLUFF_PATTERNS) {
      const match = cleaned.match(pattern);
      if (match) {
        count += match.length;
        cleaned = cleaned.replace(pattern, "");
      }
    }

    // Normalizza linee vuote multiple lasciate dalla rimozione
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

    return {
      cleanedText: cleaned,
      removedFluffCount: count,
    };
  }

  /**
   * Serializza un TelegraphicMessage nel formato compatto Caveman-RPC.
   */
  public static format(msg: TelegraphicMessage): string {
    const validated = TelegraphicMessageSchema.parse(msg);
    const lines: string[] = [
      `[CAVEMAN-RPC]`,
      `FROM: ${validated.senderRole}`,
      `TO: ${validated.recipientRole}`,
      `ACTION: ${validated.actionCode}`,
      `TARGETS: ${JSON.stringify(validated.targetFiles)}`,
      `CONSTRAINTS: ${JSON.stringify(validated.constraints)}`,
      `PAYLOAD: ${JSON.stringify(validated.payload)}`,
      `TIMESTAMP: ${validated.timestamp}`,
      `[END-CAVEMAN-RPC]`,
    ];
    return lines.join("\n");
  }

  /**
   * Esegue il parsing di una stringa formattata Caveman-RPC in un TelegraphicMessage validato Zod.
   */
  public static parse(raw: string): TelegraphicMessage {
    const lines = raw.split("\n").map((l) => l.trim());
    if (!lines.some((l) => l.includes("[CAVEMAN-RPC]"))) {
      // Prova fallback su JSON standard se inviato come JSON puro
      try {
        const json = JSON.parse(raw);
        return TelegraphicMessageSchema.parse(json);
      } catch {
        throw new Error("Invalid Caveman-RPC envelope: missing [CAVEMAN-RPC] marker");
      }
    }

    let senderRole = "";
    let recipientRole = "";
    let actionCode = "";
    let targetFiles: string[] = [];
    let constraints: string[] = [];
    let payload: Record<string, any> = {};
    let timestamp = new Date().toISOString();

    for (const line of lines) {
      if (line.startsWith("FROM:")) {
        senderRole = line.replace("FROM:", "").trim();
      } else if (line.startsWith("TO:")) {
        recipientRole = line.replace("TO:", "").trim();
      } else if (line.startsWith("ACTION:")) {
        actionCode = line.replace("ACTION:", "").trim();
      } else if (line.startsWith("TARGETS:")) {
        try {
          targetFiles = JSON.parse(line.replace("TARGETS:", "").trim());
        } catch {
          targetFiles = [];
        }
      } else if (line.startsWith("CONSTRAINTS:")) {
        try {
          constraints = JSON.parse(line.replace("CONSTRAINTS:", "").trim());
        } catch {
          constraints = [];
        }
      } else if (line.startsWith("PAYLOAD:")) {
        try {
          payload = JSON.parse(line.replace("PAYLOAD:", "").trim());
        } catch {
          payload = {};
        }
      } else if (line.startsWith("TIMESTAMP:")) {
        timestamp = line.replace("TIMESTAMP:", "").trim();
      }
    }

    return TelegraphicMessageSchema.parse({
      senderRole,
      recipientRole,
      actionCode,
      targetFiles,
      constraints,
      payload,
      zeroFluff: true,
      timestamp,
    });
  }

  /**
   * Verifica che la versione telegrafica/compressa conservi al 100% tutti i frammenti critici:
   * blocchi di codice, percorsi di file, comandi di test e hash esadecimali.
   */
  public static verifyPreservation(originalText: string, telegraphicText: string): PreservationCheckResult {
    const missingArtifacts: string[] = [];

    // 1. Estrai blocchi di codice (```...```)
    const codeBlockRegex = /```[\s\S]*?```/g;
    const originalCodeBlocks = originalText.match(codeBlockRegex) || [];
    for (const block of originalCodeBlocks) {
      if (!telegraphicText.includes(block)) {
        missingArtifacts.push(`Code block missing: ${block.slice(0, 40).replace(/\n/g, " ")}...`);
      }
    }

    // 2. Estrai percorsi di file (es. src/..., tests/..., docs/..., package.json)
    const pathRegex = /(?:[a-zA-Z0-9_\-\.]+\/)+[a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+/g;
    const originalPaths = Array.from(new Set(originalText.match(pathRegex) || []));
    for (const filePath of originalPaths) {
      if (!telegraphicText.includes(filePath)) {
        missingArtifacts.push(`File path missing: ${filePath}`);
      }
    }

    // 3. Estrai hash SHA-256 o SHA-1 (stringhe esadecimali di almeno 40 caratteri)
    const hashRegex = /\b[0-9a-fA-F]{40,64}\b/g;
    const originalHashes = Array.from(new Set(originalText.match(hashRegex) || []));
    for (const hash of originalHashes) {
      if (!telegraphicText.includes(hash)) {
        missingArtifacts.push(`Cryptographic hash missing: ${hash}`);
      }
    }

    return {
      preserved: missingArtifacts.length === 0,
      missingArtifacts,
    };
  }

  /**
   * Calcola la stima dei token risparmiati tramite la formattazione telegrafica.
   * Euristica: ~4 caratteri per token.
   */
  public static calculateSavings(originalText: string, compressedText: string): TokenSavingsSummary {
    const originalTokens = Math.max(1, Math.ceil(originalText.length / 4));
    const compressedTokens = Math.max(1, Math.ceil(compressedText.length / 4));
    const savingsTokens = Math.max(0, originalTokens - compressedTokens);
    const savingsRatioPercent = Math.round((savingsTokens / originalTokens) * 100);

    return {
      originalTokens,
      compressedTokens,
      savingsTokens,
      savingsRatioPercent,
    };
  }
}
