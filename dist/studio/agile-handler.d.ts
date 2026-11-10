import { type WarRoomIncident } from "../contracts/ceremonies.js";
import { type CeremoniesResponse, type WarRoomStatusResponse } from "../contracts/studio.js";
/**
 * Gestore backend dello Studio per le Cerimonie Agili e la Live War Room.
 */
export declare class StudioAgileHandler {
    /**
     * Legge tutte le cerimonie agili e le retrospettive registrate in .company-os/ceremonies/
     */
    static readCeremonies(targetPath: string): Promise<CeremoniesResponse>;
    /**
     * Legge lo stato della Live War Room e l'elenco degli incidenti.
     */
    static getWarRoomStatus(targetPath: string): Promise<WarRoomStatusResponse>;
    /**
     * Risolve un incidente e rilascia il write lock tramite WarRoomEngine.
     */
    static resolveWarRoomIncident(targetPath: string, incidentId: string, resolutionNotes: string): Promise<WarRoomIncident>;
}
//# sourceMappingURL=agile-handler.d.ts.map