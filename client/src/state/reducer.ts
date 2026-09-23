import type { AnyContent, Channel, RejectionReason, Status } from "../../../shared/schema";
import { newAsset } from "../lib/newAsset";
import type { Campaign, GenerateResult } from "../types";

export type State = { campaign: Campaign | null };

export const ALLOWED: Record<Status, Status[]> = {
    draft: ["needs_review"],
    needs_review: ["approved", "rejected", "draft"],
    approved: ["draft"],
    rejected: ["draft"],
};

export type Action = 
    | { type: "CAMPAIGN_CREATED"; campaign: Campaign }
    | { type: "CAMPAIGN_RESET" }
    | { type: "ASSET_GENERATED"; channel: Channel; result: GenerateResult }
    | { type: "ASSET_EDITED"; channel: Channel; content: AnyContent }
    | { type: "STATUS_CHANGED"; channel: Channel; to: Status; reason?: RejectionReason; note?: string };

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "CAMPAIGN_CREATED":
            return { campaign: action.campaign };
        case "CAMPAIGN_RESET":
            return { campaign: null };
        case "ASSET_GENERATED": {
            const campaign = state.campaign;
            if (!campaign) return state;
            return {
                campaign: {
                    ...campaign,
                    assets: { ...campaign.assets, [action.channel]: newAsset(action.result) },
                },
            };
        }
        case "ASSET_EDITED": {
            const campaign = state.campaign;
            const asset = campaign?.assets[action.channel];
            if (!campaign || !asset) return state;
            return {
                campaign: {
                    ...campaign,
                    assets: {
                        ...campaign.assets,
                        [action.channel]: {
                            content: action.content,
                            meta: {
                                ...asset.meta,
                                status: "draft",
                                rejectionReason: null,
                                edited: true,
                                updatedAt: new Date().toISOString(),
                            },
                        },
                    },
                },
            };
        }
        case "STATUS_CHANGED": {
            const campaign = state.campaign;
            const asset = campaign?.assets[action.channel];
            if (!campaign || !asset) return state;
            if (!ALLOWED[asset.meta.status].includes(action.to)) return state;
            if (action.to === "rejected" && !action.reason) return state;
            return {
                campaign: {
                    ...campaign,
                    assets: {
                        ...campaign.assets,
                        [action.channel]: {
                            ...asset,
                            meta: {
                                ...asset.meta,
                                status: action.to,
                                rejectionReason: action.to === "rejected" ? (action.reason ?? null) : null,
                                reviewerNote: action.to === "rejected" ? (action.note ?? null) : asset.meta.reviewerNote,
                                updatedAt: new Date().toISOString(),
                            },
                        },
                    },
                },
            };
        }
    }
}