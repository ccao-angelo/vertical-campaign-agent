import type { Campaign } from "../types";

const CAMPAIGN_KEY = "vca:campaign";
const SEQUENCE_KEY = "vca:seq";

export function loadCampaign(): Campaign | null {
    try {
        const raw = localStorage.getItem(CAMPAIGN_KEY);
        return raw ? (JSON.parse(raw) as Campaign) : null;
    } catch {
        return null;
    }
}

export function saveCampaign(campaign: Campaign) {
    try {
        localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign));
    } catch {
        // Storage can be full or blocked.
    }
}

export function clearCampaign() {
    try {
        localStorage.removeItem(CAMPAIGN_KEY);
    } catch {
        // Ignore
    }
}

export function nextSequence(): number {
    try {
        const next = Number(localStorage.getItem(SEQUENCE_KEY) ?? "0") + 1;
        localStorage.setItem(SEQUENCE_KEY, String(next));
        return next;
    } catch {
        return 1;
    }
}