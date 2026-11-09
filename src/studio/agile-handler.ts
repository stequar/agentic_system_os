import fs from "node:fs/promises";
import path from "node:path";
import {
  AgileCeremonySchema,
  type AgileCeremony,
  WarRoomIncidentSchema,
  type WarRoomIncident,
  SprintRetrospectiveSchema,
  type SprintRetrospective,
} from "../contracts/ceremonies.js";
import {
  CeremoniesResponseSchema,
  type CeremoniesResponse,
  WarRoomStatusResponseSchema,
  type WarRoomStatusResponse,
} from "../contracts/studio.js";
import { WarRoomEngine } from "../gatekeeper/war-room.js";

/**
 * Gestore backend dello Studio per le Cerimonie Agili e la Live War Room.
 */
export class StudioAgileHandler {
  /**
   * Legge tutte le cerimonie agili e le retrospettive registrate in .company-os/ceremonies/
   */
  public static async readCeremonies(targetPath: string): Promise<CeremoniesResponse> {
    const ceremoniesDir = path.resolve(targetPath, ".company-os", "ceremonies");
    const ceremonies: AgileCeremony[] = [];
    const retrospectives: SprintRetrospective[] = [];

    try {
      const entries = await fs.readdir(ceremoniesDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".json")) {
          try {
            const raw = await fs.readFile(path.join(ceremoniesDir, entry.name), "utf-8");
            const parsed = AgileCeremonySchema.parse(JSON.parse(raw));
            ceremonies.push(parsed);
          } catch {
            // Ignora file non conformi
          }
        }
      }
    } catch {
      // Cartella non ancora esistente
    }

    const retroDir = path.resolve(ceremoniesDir, "retrospectives");
    try {
      const retroEntries = await fs.readdir(retroDir, { withFileTypes: true });
      for (const entry of retroEntries) {
        if (entry.isFile() && entry.name.endsWith(".json")) {
          try {
            const raw = await fs.readFile(path.join(retroDir, entry.name), "utf-8");
            const parsed = SprintRetrospectiveSchema.parse(JSON.parse(raw));
            retrospectives.push(parsed);
          } catch {
            // Ignora
          }
        }
      }
    } catch {
      // Cartella non ancora esistente
    }

    // Ordina per timestamp decrescente
    ceremonies.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return CeremoniesResponseSchema.parse({
      ceremonies,
      retrospectives,
      totalCount: ceremonies.length,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Legge lo stato della Live War Room e l'elenco degli incidenti.
   */
  public static async getWarRoomStatus(targetPath: string): Promise<WarRoomStatusResponse> {
    const isWriteLocked = WarRoomEngine.isWriteLocked();
    const incidentDir = path.resolve(targetPath, ".company-os", "ceremonies", "incidents");
    const allIncidents: WarRoomIncident[] = [];

    try {
      const entries = await fs.readdir(incidentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".json")) {
          try {
            const raw = await fs.readFile(path.join(incidentDir, entry.name), "utf-8");
            const parsed = WarRoomIncidentSchema.parse(JSON.parse(raw));
            allIncidents.push(parsed);
          } catch {
            // Ignora
          }
        }
      }
    } catch {
      // Nessun incidente registrato
    }

    allIncidents.sort((a, b) => new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime());

    const activeIncidents = allIncidents.filter(
      (inc) => isWriteLocked || !inc.containmentAction.includes("Resolved:")
    );
    const pastIncidents = allIncidents.filter(
      (inc) => !activeIncidents.some((act) => act.incidentId === inc.incidentId)
    );

    return WarRoomStatusResponseSchema.parse({
      isWriteLocked,
      activeIncidents,
      pastIncidents,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Risolve un incidente e rilascia il write lock tramite WarRoomEngine.
   */
  public static async resolveWarRoomIncident(
    targetPath: string,
    incidentId: string,
    resolutionNotes: string
  ): Promise<WarRoomIncident> {
    return WarRoomEngine.resolveIncident(targetPath, incidentId, resolutionNotes);
  }
}
