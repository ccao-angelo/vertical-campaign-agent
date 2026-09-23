export type Severity = "pass" | "warn" | "fail" | "info";

export type Check = {
    id: string;
    label: string;
    severity: Severity;
    detail?: string;
};

// 100 = every check passed. Warnings count half. Info checks aren't scored.
export function scoreChecks(checks: Check[]): number | null {
    const scored = checks.filter((c) => c.severity !== "info");
    if (scored.length === 0) return null;
    const points = scored.reduce((sum, c) => sum + (c.severity === "pass" ? 1 : c.severity === "warn" ? 0.5 : 0), 0);
    return Math.round((100 * points) / scored.length);
}

export const hasFailure = (checks: Check[]) => checks.some((c) => c.severity === "fail")