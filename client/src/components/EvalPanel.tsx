import { scoreChecks, type Check } from "../../../shared/checks";

const ORDER = {fail: 0, warn: 1, info: 2, pass: 3 } as const;
const TAG = { fail: "Failed", warn: "Warning", info: "Note", pass: "Passed" } as const;

const RADIUS = 15;
const CIRCUMFENCE = 2 * Math.PI * RADIUS;

function tone(checks: Check[]): "ok" | "warn" | "fail" {
    if (checks.some((c) => c.severity === "fail")) return "fail";
    if (checks.some((c) => c.severity === "warn")) return "warn";
    return "ok";
}

function ScoreRing({ score, checks }: { score: number | null; checks: Check[] }) {
    const value = score ?? 0;
    const offset = CIRCUMFENCE * (1 - value / 100);
    return (
        <svg className="score-ring" width="36" height="36" viewBox="0 0" aria-hidden="true">
            <circle className="score-ring-track" cx="18" cy="18" r={RADIUS} strokeWidth="4" />
            <circle className={`score-ring-value tone-${tone(checks)}`} cx="18" cy="18" r={RADIUS} strokeWidth="4" strokeDasharray={CIRCUMFENCE} strokeDashoffset={offset} transform="rotate(-90 18 18)" />
        </svg>
    );
}

export default function EvalPanel({ checks }: { checks: Check[] }) {
    if (checks.length === 0) {
        return <p className="muted small">Automated checks are not connected yet.</p>
    }

    const score = scoreChecks(checks);
    const sorted = [...checks].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

    return (
        <details className="eval" open={sorted.some((c) => c.severity === "fail")}>
            <summary>
                <span className="score-ring-row">
                    <ScoreRing score={score} checks={checks} />
                    <span className="score-label">Automated checks: <strong>score {score ?? "n/a"}</strong> out of 100</span>
                </span>
            </summary>
            <ul>
                {sorted.map((check) => (
                    <li key={check.id} className={`check check-${check.severity}`}>
                        <strong>{TAG[check.severity]}:</strong> {check.label}
                        {check.detail && check.severity !== "pass" && <div className="detail">{check.detail}</div>}
                    </li>
                ))}
            </ul>
        </details>
    );
}