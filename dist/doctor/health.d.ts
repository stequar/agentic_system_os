import { type DoctorOptions, type DoctorReport } from "../contracts/doctor.js";
/**
 * Esegue in parallelo (`Promise.allSettled`) tutti i controlli diagnostici della toolchain
 * locale con timeout deterministico (default 3000ms).
 */
export declare function runEnvironmentDoctor(targetPath?: string, options?: Partial<DoctorOptions>): Promise<DoctorReport>;
//# sourceMappingURL=health.d.ts.map