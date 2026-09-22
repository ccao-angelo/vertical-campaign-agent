import { buildTracking } from "../../../shared/campaign";
import { buildMeasurementPlan } from "../../../shared/measurement";
import { OBJECTIVE_LABELS, STAGE_LABELS, VERTICAL_LABELS } from "../../../shared/labels";
import type { Campaign } from "../types";
import CopyButton from "./CopyButton";

export default function CampaignPlan({ campaign }: { campaign: Campaign }) {
    const { brief } = campaign;
    const tracking = buildTracking(brief, campaign.id);
    const plan = buildMeasurementPlan(brief);
    const vertical = brief.vertical === "other" ? (brief.verticalOther ?? "Other") : VERTICAL_LABELS[brief.vertical];

    return (
        <>
            <section className="card">
                <h2>Campaign summary</h2>
                <dl className="summary">
                <dt>Campaign name</dt><dd>{brief.campaignName}</dd>
                <dt>Campaign ID</dt><dd><code>{campaign.id}</code></dd>
                <dt>Audience</dt><dd>{brief.audience}</dd>
                <dt>Vertical</dt><dd>{vertical}</dd>
                <dt>Objective</dt><dd>{OBJECTIVE_LABELS[brief.objective]}</dd>
                <dt>Funnel stage</dt><dd>{STAGE_LABELS[brief.funnelStage]}</dd>
                <dt>Core message</dt><dd>{brief.valueProposition}</dd>
                <dt>Call to action</dt><dd>{brief.cta}</dd>
                <dt>Created</dt><dd>{new Date(campaign.createdAt).toLocaleString()}</dd>
                </dl>
            </section>

            <section className="card">
                <h2>Measurement plan</h2>
                <dl className="summary">
                <dt>Primary KPI</dt><dd>{plan.primaryKpi}</dd>
                <dt>Secondary KPIs</dt><dd>{plan.secondaryKpis.join("; ")}</dd>
                <dt>Funnel stage</dt><dd>{STAGE_LABELS[plan.funnelStage]}</dd>
                <dt>Conversion event</dt><dd><code>{plan.conversionEvent}</code></dd>
                <dt>What success means</dt><dd>{plan.successDefinition}</dd>
                </dl>
            </section>

            <section className="card">
                <h2>Tracking links</h2>
                <p className="muted small">One link per asset variant, so results can be attributed to the exact variant.</p>
                <ul className="links">
                {tracking.map((link) => (
                    <li key={link.url}>
                    <strong>{link.label}</strong>
                    <code>{link.url}</code>
                    <CopyButton text={link.url} label="Copy link" />
                    </li>
                ))}
                </ul>
            </section>
        </>
    );
}