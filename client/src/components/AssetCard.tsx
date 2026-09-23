import { useState } from "react";
import type { AnyContent, Channel, RejectionReason, Status } from "../../../shared/schema";
import { REJECTION_REASONS } from "../../../shared/schema";
import { CHANNEL_LABELS, REASON_INSTRUCTIONS, REASON_LABELS, STATUS_LABELS } from "../../../shared/labels";
import type { TrackingLink } from "../../../shared/campaign";
import type { Check } from "../../../shared/checks";
import type { Asset } from "../types";
import { assetToText, fieldsFor, getIn, setIn } from "../lib/fields";
import CopyButton from "./CopyButton";
import ErrorBanner from "./ErrorBanner";
import EvalPanel from "./EvalPanel";

type Props = {
    channel: Channel;
    asset: Asset | undefined;
    links: TrackingLink[];
    checks: Check[];
    loading: boolean;
    error: string | null | undefined;
    onGenerate: (instruction?: string) => void;
    onEdit: (content: AnyContent) => void;
    onStatus: (to: Status, reason?: RejectionReason, note?: string) => void;
};

export default function AssetCard(props: Props) {
    const { channel, asset, links, checks, loading, error, onGenerate, onEdit, onStatus } = props;

    const [editing, setEditing] = useState(false);
    const [instruction, setInstruction] = useState("");
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState<RejectionReason>("too_generic");
    const [note, setNote] = useState("");

    const status = asset?.meta.status;
    const failed = checks.filter((c) => c.severity === "fail");
    const fields = asset ? fieldsFor(channel, asset.content) : [];

    function defaultInstruction(): string {
        if (!asset || asset.meta.status !== "rejected" || !asset.meta.rejectionReason) return "";
        return asset.meta.rejectionReason === "other"
            ? (asset.meta.reviewerNote ?? "")
            : REASON_INSTRUCTIONS[asset.meta.rejectionReason];
    }

    function regenerate(text?: string) {
        onGenerate((text ?? instruction).trim() || defaultInstruction() || undefined);
        setInstruction("");
        setEditing(false);
    }

    const fixInstruction = "Fix these problems and change nothing else: " +
        failed.map((c) => (c.detail ? `${c.label} (${c.detail})` : c.label)).join("; ");
    
    return (
        <section className="card asset">
            <header className="card-head">
                <h3>{CHANNEL_LABELS[channel]}</h3>
                {status && <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>}
            </header>

            {loading && <p className="muted" role="status">Generating...</p>}
            {error && !loading && <ErrorBanner message={error} onRetry={() => onGenerate()} />}
            {!asset && !loading && !error && <p className="muted">Not generated yet.</p>}

            {asset && (
                <>
                    <p className="muted small">
                        {status === "approved" ? "Approved by a reviewer." : "AI-generated draft. Not approved for publication."}
                        {asset.meta.edited ? " Edited by hand." : ""}
                    </p>
                    {status === "rejected" && asset.meta.rejectionReason && (
                        <p className="rejected-note">
                        Rejected: {REASON_LABELS[asset.meta.rejectionReason]}
                        {asset.meta.reviewerNote ? `. ${asset.meta.reviewerNote}` : ""}
                        </p>
                    )}

                    {editing && <p className="muted small">Editing sends this back to Draft.</p>}
                    <dl className="fields">
                        {fields.map((field) => {
                            const value = getIn(asset.content, field.path);
                            const key = field.path.join(".");
                            return (
                                <div key={key} className="field-row">
                                    <dt>{field.label}</dt>
                                    <dd>
                                        {editing ? (
                                        field.multiline ? (<textarea rows={3} value={value} onChange={(e) => onEdit(setIn(asset.content, field.path, e.target.value))} />
                                    ) : (<input value={value} onChange={(e) => onEdit(setIn(asset.content, field.path, e.target.value))} />)
                                    ) : (
                                        value || <span className="muted">None</span>
                                    )}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>

                    <EvalPanel checks={checks} />

                    <div className="asset-links">
                        <span className="muted small">Tracking links for this asset</span>
                        <ul className="links">
                            {links.map((link) => (
                                <li key={link.url}>
                                <strong>{link.label}</strong>
                                <code>{link.url}</code>
                                <CopyButton text={link.url} label="Copy link" />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="toolbar">
                        <button disabled={loading} onClick={() => setEditing(!editing)}>{editing ? "Done editing" : "Edit"}</button>
                        <CopyButton text={assetToText(channel, asset.content)} label="Copy text" />
                        
                        {status === "draft" && (
                            <button className="primary" disabled={loading} onClick={() => onStatus("needs_review")}>
                                Submit for review
                            </button>
                        )}
                        {status === "needs_review" && (
                            <>
                                <button className="primary" disabled={loading || failed.length > 0} title={failed.length > 0 ? "Resolved the failed checks before approving." : undefined} onClick={() => onStatus("approved")}>
                                    Approve
                                </button>
                                <button disabled={loading} onClick={() => setRejecting(true)}>Reject</button>
                                <button disabled={loading} onClick={() => onStatus("draft")}>Back to draft</button>
                            </>
                        )}
                        {(status === "approved" || status === "rejected") && (
                            <button disabled={loading} onClick={() => onStatus("draft")}>Return to draft</button>
                        )}
                    </div>

                    { rejecting && (
                        <div className="reject-box">
                            <label className="field">
                                <span className="field-label">Reason for rejection</span>
                                <select value={reason} onChange={(e) => setReason(e.target.value as RejectionReason)}>
                                {REJECTION_REASONS.map((r) => (
                                    <option key={r} value={r}>{REASON_LABELS[r]}</option>
                                ))}
                                </select>
                            </label>
                            <label className="field">
                                <span className="field-label">Note (optional)</span>
                                <input value={note} onChange={(e) => setNote(e.target.value)} />
                            </label>
                            <div className="toolbar">
                                <button className="primary" onClick={() => { onStatus("rejected", reason, note.trim() || undefined); setRejecting(false); setNote(""); }}>
                                    Confirm rejection
                                </button>
                                <button onClick={() => setRejecting(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="regen">
                        <input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Optional instruction, for example: make it shorter" disabled={loading} />
                        <button disabled={loading} onClick={() => regenerate()}>Regenerate</button>
                        {failed.length > 0 && (
                            <button disabled={loading} onClick={() => regenerate(fixInstruction)}>Regenerate to fix failed checks</button>
                        )}
                    </div>
                </>
            )}

        </section>
    );
}