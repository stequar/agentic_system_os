import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { DoctorCheckResultSchema, DoctorOptionsSchema, DoctorReportSchema, } from "../contracts/doctor.js";
/**
 * Esegue un binario nativo tramite `execFile` (senza shell intermedia) con timeout deterministico
 * e `AbortSignal.timeout(timeoutMs)`.
 */
function execBinaryProbe(binary, args, timeoutMs, cwd) {
    return new Promise((resolve) => {
        const signal = AbortSignal.timeout(timeoutMs);
        execFile(binary, args, {
            cwd,
            timeout: timeoutMs,
            signal,
            maxBuffer: 1024 * 512,
        }, (err, stdout, stderr) => {
            if (err) {
                const isTimeout = err.killed === true ||
                    err.name === "AbortError" ||
                    err.code === "ABORT_ERR" ||
                    err.code === "ETIMEDOUT" ||
                    /timed out|aborted/i.test(err.message);
                resolve({
                    ok: false,
                    stdout: String(stdout ?? "").trim(),
                    stderr: String(stderr ?? "").trim(),
                    timedOut: isTimeout,
                    errorMessage: err.message,
                });
                return;
            }
            resolve({
                ok: true,
                stdout: String(stdout ?? "").trim(),
                stderr: String(stderr ?? "").trim(),
                timedOut: false,
            });
        });
    });
}
async function checkGit(timeoutMs) {
    const res = await execBinaryProbe("git", ["--version"], timeoutMs);
    if (res.ok) {
        const combined = `${res.stdout} ${res.stderr}`;
        const match = combined.match(/git version\s+([^\s]+)/i);
        const version = match?.[1] ?? (res.stdout || "unknown");
        return DoctorCheckResultSchema.parse({
            checkName: "git",
            category: "vcs",
            status: "ok",
            version,
            message: `Git VCS attivo (${version})`,
        });
    }
    return DoctorCheckResultSchema.parse({
        checkName: "git",
        category: "vcs",
        status: "error",
        message: res.timedOut
            ? `Verifica git scaduta dopo ${timeoutMs}ms`
            : `Git non rilevato o non funzionante: ${res.errorMessage ?? "errore sconosciuto"}`,
        fixSuggested: "xcode-select --install || brew install git",
    });
}
async function checkPython3(timeoutMs) {
    const res = await execBinaryProbe("python3", ["--version"], timeoutMs);
    if (res.ok) {
        const combined = `${res.stdout} ${res.stderr}`;
        const match = combined.match(/Python\s+([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
        const version = match?.[1] ?? (res.stdout || "unknown");
        return DoctorCheckResultSchema.parse({
            checkName: "python3",
            category: "runtime",
            status: "ok",
            version,
            message: `Python 3 runtime operativo (${version})`,
        });
    }
    return DoctorCheckResultSchema.parse({
        checkName: "python3",
        category: "runtime",
        status: "error",
        message: res.timedOut
            ? `Verifica python3 scaduta dopo ${timeoutMs}ms`
            : `Interprete python3 non trovato: ${res.errorMessage ?? "non installato"}`,
        fixSuggested: "brew install python@3.11",
    });
}
async function checkTargetVenv(targetPath, timeoutMs) {
    const venvPython = path.join(targetPath, ".venv", "bin", "python");
    try {
        await fs.access(venvPython);
    }
    catch {
        return DoctorCheckResultSchema.parse({
            checkName: "venv",
            category: "workspace",
            status: "skipped",
            message: "Nessun virtualenv locale (.venv/bin/python) rilevato nel workspace target",
            fixSuggested: "python3 -m venv .venv && source .venv/bin/activate",
        });
    }
    const res = await execBinaryProbe(venvPython, ["--version"], timeoutMs, targetPath);
    if (res.ok) {
        const combined = `${res.stdout} ${res.stderr}`;
        const match = combined.match(/Python\s+([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
        const version = match?.[1] ?? (res.stdout || "unknown");
        return DoctorCheckResultSchema.parse({
            checkName: "venv",
            category: "workspace",
            status: "ok",
            version,
            message: `Virtualenv locale (.venv) attivo e verificato (${version})`,
        });
    }
    return DoctorCheckResultSchema.parse({
        checkName: "venv",
        category: "workspace",
        status: "warn",
        message: `Il binario .venv/bin/python esiste ma non risponde: ${res.errorMessage ?? "errore"}`,
        fixSuggested: "rm -rf .venv && python3 -m venv .venv",
    });
}
async function checkSwiftc(timeoutMs) {
    const res = await execBinaryProbe("swiftc", ["--version"], timeoutMs);
    if (res.ok) {
        const combined = `${res.stdout} ${res.stderr}`;
        const match = combined.match(/Swift version\s+([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
        const version = match?.[1] ?? "unknown";
        return DoctorCheckResultSchema.parse({
            checkName: "swiftc",
            category: "compiler",
            status: "ok",
            version,
            message: `Compilatore Swift attivo (${version})`,
        });
    }
    return DoctorCheckResultSchema.parse({
        checkName: "swiftc",
        category: "compiler",
        status: "warn",
        message: res.timedOut
            ? `Verifica swiftc scaduta dopo ${timeoutMs}ms`
            : `Compilatore swiftc non disponibile: ${res.errorMessage ?? "non trovato"}`,
        fixSuggested: "xcode-select --install",
    });
}
async function checkDocker(timeoutMs) {
    const res = await execBinaryProbe("docker", ["info", "--format", "{{.ServerVersion}}"], timeoutMs);
    const rawVersion = res.stdout.replace(/^['"]|['"]$/g, "").trim();
    if (res.ok && rawVersion.length > 0) {
        return DoctorCheckResultSchema.parse({
            checkName: "docker",
            category: "daemon",
            status: "ok",
            version: rawVersion,
            message: `Docker daemon attivo (ServerVersion ${rawVersion})`,
        });
    }
    return DoctorCheckResultSchema.parse({
        checkName: "docker",
        category: "daemon",
        status: "warn",
        ...(rawVersion ? { version: rawVersion } : {}),
        message: res.timedOut
            ? `Docker daemon non ha risposto entro ${timeoutMs}ms (warning non bloccante)`
            : "Docker daemon non attivo o non raggiungibile (warning non bloccante per sviluppo locale)",
        fixSuggested: "open -a Docker",
    });
}
/**
 * Esegue in parallelo (`Promise.allSettled`) tutti i controlli diagnostici della toolchain
 * locale con timeout deterministico (default 3000ms).
 */
export async function runEnvironmentDoctor(targetPath = process.cwd(), options) {
    const startTime = performance.now();
    const resolvedPath = path.resolve(targetPath);
    const parsedOpts = DoctorOptionsSchema.parse(options ?? {});
    const timeoutMs = parsedOpts.timeoutMs;
    const probeTasks = [
        { name: "git", category: "vcs", promise: checkGit(timeoutMs) },
        { name: "python3", category: "runtime", promise: checkPython3(timeoutMs) },
        {
            name: "venv",
            category: "workspace",
            promise: checkTargetVenv(resolvedPath, timeoutMs),
        },
        { name: "swiftc", category: "compiler", promise: checkSwiftc(timeoutMs) },
        { name: "docker", category: "daemon", promise: checkDocker(timeoutMs) },
    ];
    const settled = await Promise.allSettled(probeTasks.map((t) => t.promise));
    const checks = settled.map((item, idx) => {
        const meta = probeTasks[idx];
        if (item.status === "fulfilled") {
            return item.value;
        }
        return DoctorCheckResultSchema.parse({
            checkName: meta.name,
            category: meta.category,
            status: meta.name === "docker" || meta.name === "swiftc" ? "warn" : "error",
            message: `Eccezione inattesa durante il controllo '${meta.name}': ${item.reason instanceof Error ? item.reason.message : String(item.reason)}`,
        });
    });
    const hasError = checks.some((c) => c.status === "error");
    const hasWarn = checks.some((c) => c.status === "warn");
    const overallStatus = hasError
        ? "error"
        : hasWarn
            ? "warn"
            : "ok";
    const durationMs = Math.max(0, Math.round(performance.now() - startTime));
    return DoctorReportSchema.parse({
        targetPath: resolvedPath,
        overallStatus,
        checks,
        checkedAt: new Date().toISOString(),
        durationMs,
    });
}
//# sourceMappingURL=health.js.map