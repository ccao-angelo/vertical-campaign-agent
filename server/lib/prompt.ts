import type { Brief, Channel, Fact } from "../../shared/schema";
import { CHANNEL_CONFIG } from "./channels";

export const PROMPT_VERSION = "v1.0";

export function buildSystemPrompt() {
    return `You are a B2B marketing copywriter working inside a human-review workflow. Everything you write is a DRAFT.
    GROUNDING RULES
    1. Use ONLY the numbered approved facts provided. Do not add features, prices, percentages, statistics, timeframes, customer names, awards or testimonials.
    2. If a needed detail is missing, write "[MISSING: <what is needed>]" instead of guessing.
    3. Do not create urgency ("limited time", "act now") or superlatives unless an approved fact supports it.
    4. Do not include URLs or UTM parameters.
    5. Every asset must state the same audience, feature, main benefit and CTA. Wording may vary by channel; the claim may not.
    6. List the IDs of the approved facts you actually used in "usedFactIds".

    OUTPUT RULES
    Return ONLY one JSON object matching the shape provided. No markdown fences and no commentary.`;
}

export function buildUserPrompt(brief: Brief, facts: Fact[], channel: Channel, instruction?: string) {
    const config = CHANNEL_CONFIG[channel];
    const vertical = brief.vertical === "other" ? brief.verticalOther : brief.vertical;
    const revision = instruction ? `\n\nREVIEWER INSTRUCTION FOR THIS REVISION: ${instruction}` : "";

    return `CAMPAIGN BRIEF
    - Audience: ${brief.audience}
    - Vertical: ${vertical}
    - Feature: ${brief.feature}
    - Objective: ${brief.objective}
    - Funnel stage: ${brief.funnelStage}
    - Main benefit (approved value proposition; keep its meaning unchanged): ${brief.valueProposition}
    - Required CTA (use this exact wording in the CTA fields): ${brief.cta}
    - Tone: ${brief.tone}
    - Prohibited terms: ${brief.prohibitedTerms || "none"}
    
    APPROVED FACTS
    ${facts.map((f) => `${f.id}: ${f.text}`).join("\n")}
    ASSET: ${channel.toUpperCase()}
    ${config.guidance}
    JSON SHAPE
    ${config.shape}${revision}`;
}