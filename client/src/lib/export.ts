import { CHANNELS, type Channel } from "../../../shared/schema";
import { buildTracking } from "../../../shared/campaign";
import { buildMeasurementPlan } from "../../../shared/measurement";
import { scoreChecks, type Check } from "../../../shared/checks";
import { CHANNEL_LABELS, OBJECTIVE_LABELS, REASON_LABELS, STAGE_LABELS, STATUS_LABELS, VERTICAL_LABELS } from "../../../shared/labels";
import type { Campaign } from "../types";
import { assetToText } from "./fields";
import { channel } from "node:diagnostics_channel";
import { file } from "zod";

type GetChecks = (channel: Channel) => Check[];

const presentChannels = (campaign: Campaign) => CHANNELS.filter((channel) => campaign.assets[channel]);

export const hasUnapprovedAssets = (campaign: Campaign) =>
    presentChannels(campaign).some((channel) => campaign.assets[channel]!.meta.status !== "approved");

export function buildExportJson(campaign: Campaign, getChecks: GetChecks) {
    const assets = Object.fromEntries(
        presentChannels(campaign).map((channel) => {
            const checks = getChecks(channel);
            return [channel, { ...campaign.assets[channel]!, evaluation: { score: scoreChecks(checks), checks } }];
        }),
    );
    return {
        exportedAt: new Date().toISOString(),
        containsUnapprovedAssets: hasUnapprovedAssets(campaign),
        campaign: { id: campaign.id, createdAt: campaign.createdAt, brief: campaign.brief, facts: campaign.facts },
        assets,
        tracking: buildTracking(campaign.brief, campaign.id),
        measurement: buildMeasurementPlan(campaign.brief),
    };
}

export function buildMarkdown(campaign: Campaign, getChecks: GetChecks): string {
    const { brief } = campaign;
    const plan = buildMeasurementPlan(brief);
    const lines: string[] = [];

    lines.push(`# ${brief.campaignName}`, "");
    if (hasUnapprovedAssets(campaign)) {
        lines.push("> This package contains assets that are NOT approved. Do not publish them before review.", "");
    }
    lines.push(
        "## Campaign summary",
        "",
        `- Campaign ID: ${campaign.id}`,
        `- Created: ${campaign.createdAt}`,
        `- Vertical: ${VERTICAL_LABELS[brief.vertical]}${brief.verticalOther ? ` (${brief.verticalOther})` : ""}`,
        `- Audience: ${brief.audience}`,
        `- Objective: ${OBJECTIVE_LABELS[brief.objective]}`,
        `- Funnel stage: ${STAGE_LABELS[brief.funnelStage]}`,
        `- Feature: ${brief.feature}`,
        `- Core message: ${brief.valueProposition}`,
        `- CTA: ${brief.cta}`,
        `- Tone: ${brief.tone}`,
        "",
        "## Approved facts",
        "",
        ...campaign.facts.map((fact) => `- ${fact.id}: ${fact.text}`),
        "",
        "## Assets",
        "",
    );

    for (const channel of presentChannels(campaign)) {
        const asset = campaign.assets[channel]!;
        const checks = getChecks(channel);
        const score = scoreChecks(checks);
        lines.push(`### ${CHANNEL_LABELS[channel]}`, "", `- Status: ${STATUS_LABELS[asset.meta.status]}`);
        if (asset.meta.rejectionReason) {
            lines.push(`- Rejection reason: ${REASON_LABELS[asset.meta.rejectionReason]}${asset.meta.reviewerNote ? ` (${asset.meta.reviewerNote})` : ""}`);
        }
        lines.push(
            `- Edited by hand: ${asset.meta.edited ? "yes" : "no"}`,
            `- Model: ${asset.meta.model}, prompt ${asset.meta.promptVersion}`,
            `- Automated check score: ${score ?? "not available"}`,
            "",
            "```text",
            assetToText(channel, asset.content),
            "```",
            "",
        );
    }

    lines.push("## Tracking links", "", "| Asset | URL |", "|---|---|");
    for (const link of buildTracking(brief, campaign.id)) lines.push(`| ${link.label} | ${link.url} |`);

    lines.push(
        "",
        "## Measurement plan",
        "",
        `- Primary KPI: ${plan.primaryKpi}`,
        `- Secondary KPIs: ${plan.secondaryKpis.join("; ")}`,
        `- Funnel stage: ${STAGE_LABELS[plan.funnelStage]}`,
        `- Conversion event: ${plan.conversionEvent}`,
        `- What success means: ${plan.successDefinition}`,
        "",
    );
    return lines.join("\n");
}

export function download(filename: string, text: string, mimeType: string) {
    const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
    const link = document.createElement("a");
    link.href= url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}