import { Command } from "commander";
import { type ExecutionContext } from "./context.js";
/**
 * Crea e configura l'applicazione CLI Commander disaccoppiata dall'ambiente di processo.
 * Consente l'iniezione di un ExecutionContext personalizzato per testing o runtime alternativi.
 */
export declare function createCliApp(ctx?: ExecutionContext): Command;
//# sourceMappingURL=dispatcher.d.ts.map