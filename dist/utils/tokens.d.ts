/**
 * Stima deterministica del numero di token da una stringa (euristica ~3.8 char/token).
 * Vive in `utils/` (layer neutro) così che `core/` non debba importare da `generator/`.
 */
export declare function estimateTokenCount(text: string): number;
//# sourceMappingURL=tokens.d.ts.map