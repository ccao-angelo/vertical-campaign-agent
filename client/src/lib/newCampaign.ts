import { makeCampaignId } from "../../../shared/campaign";
import { Brief, parseFacts } from "../../../shared/schema";
import { nextSequence } from "../state/storage";
import type { Campaign } from "../types";

export function newCampaign(brief: Brief): Campaign {
    const vertical = brief.vertical === "other" ? (brief.verticalOther ?? "other") : brief.vertical;
    return {
        id: makeCampaignId(vertical, brief.feature, nextSequence()),
        createdAt: new Date().toISOString(),
        brief,
        facts: parseFacts(brief.sourceInformation),
        assets: {},
    };
}