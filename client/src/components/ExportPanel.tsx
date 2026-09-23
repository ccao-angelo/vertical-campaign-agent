import type { Channel } from "../../../shared/schema";
import type { Check } from "../../../shared/checks";
import { buildExportJson, buildMarkdown, download, hasUnapprovedAssets } from "../lib/export";
import type { Campaign } from "../types";
import CopyButton from "./CopyButton";

type Props = { campaign: Campaign; getChecks: (channel: Channel) => Check[] };

export default function ExportPanel({ campaign, getChecks }: Props) {
    const hasAssets = Object.keys(campaign.assets).length > 0;

    return (
        <section className="card">
            <h2>Export campaign package</h2>
            <p className="muted small">
                The package includes the brief, approved facts, every asset with its review status, tracking links and the measurement plan.
                {hasAssets && hasUnapprovedAssets(campaign) ? " Some assets are not approved yet, and the export says so." : ""}
            </p>
            <div className="toolbar">
                <button disabled={!hasAssets} onClick={() => download(`${campaign.id}.json`, JSON.stringify(buildExportJson(campaign, getChecks), null, 2), "application/json")}>
                    Download JSON
                </button>
                <button disabled={!hasAssets} onClick={() => download(`${campaign.id}.md`, buildMarkdown(campaign, getChecks), "text/markdown")}>
                    Download Markdown
                </button>
                {hasAssets && <CopyButton text={buildMarkdown(campaign, getChecks)} label="Copy Markdown" />}
            </div>
        </section>
    );
}