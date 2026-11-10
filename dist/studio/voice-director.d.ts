import { z } from "zod";
import { SteeringEngine } from "../core/steering-engine.js";
export declare const ExecutiveVoiceIntentSchema: z.ZodEnum<["RUN_STANDUP", "READ_STATUS_BRIEFING", "TOGGLE_SPIKE_CHECKPOINT", "RUN_CHAOS_AUDIT", "PAUSE_SWARM", "RESUME_SWARM"]>;
export type ExecutiveVoiceIntent = z.infer<typeof ExecutiveVoiceIntentSchema>;
export declare const SpikeCheckpointModeSchema: z.ZodEnum<["HITL_SPIKE_REVIEW", "AUTONOMOUS_FAST_TRACK"]>;
export type SpikeCheckpointMode = z.infer<typeof SpikeCheckpointModeSchema>;
export declare const VoiceCommandResponseSchema: z.ZodObject<{
    transcript: z.ZodString;
    intent: z.ZodEnum<["RUN_STANDUP", "READ_STATUS_BRIEFING", "TOGGLE_SPIKE_CHECKPOINT", "RUN_CHAOS_AUDIT", "PAUSE_SWARM", "RESUME_SWARM"]>;
    confidenceScore: z.ZodNumber;
    actionExecuted: z.ZodString;
    spikeCheckpointMode: z.ZodOptional<z.ZodEnum<["HITL_SPIKE_REVIEW", "AUTONOMOUS_FAST_TRACK"]>>;
    spokenBriefingIt: z.ZodString;
    processedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    transcript: string;
    intent: "RUN_STANDUP" | "READ_STATUS_BRIEFING" | "TOGGLE_SPIKE_CHECKPOINT" | "RUN_CHAOS_AUDIT" | "PAUSE_SWARM" | "RESUME_SWARM";
    confidenceScore: number;
    actionExecuted: string;
    spokenBriefingIt: string;
    processedAt: string;
    spikeCheckpointMode?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
}, {
    transcript: string;
    intent: "RUN_STANDUP" | "READ_STATUS_BRIEFING" | "TOGGLE_SPIKE_CHECKPOINT" | "RUN_CHAOS_AUDIT" | "PAUSE_SWARM" | "RESUME_SWARM";
    confidenceScore: number;
    actionExecuted: string;
    spokenBriefingIt: string;
    processedAt: string;
    spikeCheckpointMode?: "HITL_SPIKE_REVIEW" | "AUTONOMOUS_FAST_TRACK" | undefined;
}>;
export type VoiceCommandResponse = z.infer<typeof VoiceCommandResponseSchema>;
/**
 * Classifica deterministicamente in <2ms (costo token $0) una frase vocale/testuale in italiano
 * del CEO nell'intento esecutivo corrispondente.
 */
export declare function classifyItalianVoiceIntent(transcript: string): {
    intent: ExecutiveVoiceIntent;
    confidenceScore: number;
    desiredSpikeMode?: SpikeCheckpointMode;
};
/**
 * Esegue il comando vocale esecutivo del CEO, aggiornando lo stato (incluso il toggle del checkpoint Spike)
 * e restituendo il briefing parlato sintetizzato in italiano.
 */
export declare function executeExecutiveVoiceCommand(params: {
    targetPath: string;
    transcript: string;
    steeringEngine?: SteeringEngine;
}): Promise<VoiceCommandResponse>;
//# sourceMappingURL=voice-director.d.ts.map