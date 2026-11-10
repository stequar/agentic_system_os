import http from "node:http";
import { CompanyEventBus } from "../core/event-bus.js";
import { SteeringEngine } from "../core/steering-engine.js";
export interface StudioServerHandle {
    server: http.Server;
    port: number;
    host: string;
    url: string;
    token: string;
    stop: () => Promise<void>;
}
export interface StartStudioOptions {
    port?: number;
    host?: string;
    targetPath?: string;
    steeringEngine?: SteeringEngine;
    eventBus?: CompanyEventBus;
}
/**
 * Avvia il server embedded per il Web Studio Dashboard su localhost:4321
 */
export declare function startStudioServer(options?: StartStudioOptions): Promise<StudioServerHandle>;
//# sourceMappingURL=server.d.ts.map