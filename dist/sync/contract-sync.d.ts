import type { ApiContract } from "../contracts/engineering.js";
import { type ContractSyncOptions, type ContractSyncResult, type CrossDomainContract } from "../contracts/sync.js";
/**
 * Converte deterministicamente un identificatore `snake_case` in `camelCase`.
 */
export declare function snakeToCamel(snake: string): string;
/**
 * Genera i modelli Python Pydantic v2 idiomatici a partire dal contratto unificato.
 * Include `ConfigDict(populate_by_name=True, from_attributes=True)` e `Field(..., alias="camelCase")`.
 */
export declare function generatePydanticV2Models(contract: CrossDomainContract | ApiContract): string;
/**
 * Genera le struct Swift 6 `Codable, Sendable, Hashable` (e `Identifiable` se presente `id`)
 * con proprietà `camelCase` ed enum `nonisolated private enum CodingKeys: String, CodingKey`.
 */
export declare function generateSwiftCodableModels(contract: CrossDomainContract | ApiContract): string;
/**
 * Sincronizza in modo deterministico un contratto cross-domain generando il codice
 * Python Pydantic v2 e Swift 6 Codable/Sendable e, se `targetDir` è specificato e `!dryRun`,
 * salvandoli su disco tramite `atomicWriteFile` con backup `.bak`.
 */
export declare function syncCrossDomainContracts(contract: CrossDomainContract | ApiContract, options?: ContractSyncOptions): Promise<ContractSyncResult>;
//# sourceMappingURL=contract-sync.d.ts.map