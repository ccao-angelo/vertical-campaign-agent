import { check } from "zod";
import { scoreChecks, type Check } from "../../../shared/checks";

const ORDER = {fail: 0, warn: 1, info: 2, pass: 3 } as const;
const TAG = { fail: "Failed", warn: "Warning", info: "Note", pass: "Passed" } as const;

export default function EvalPanel({ checks }: { checks: Check[] }) {
    if (checks.length === 0) {
        return <p className="muted small">Automated checks are not connected yet.</p>
    }

    const score = scoreChecks(checks);
    const sorted = [...checks].sort((a, b) => ORDER[a.severity]);

    return (
        <details className="eval" open={sorted.some((c) => c.severity === "fail")}>
            <summary>Automated checks: score {score ?? "n/a"} out of 100</summary>
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