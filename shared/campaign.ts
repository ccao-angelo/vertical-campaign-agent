import type { Brief, Channel } from "./schema";

// Turn any text into lowercase with hyphens value
export const slug = (text: string) =>
    text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export function makeCampaignId(vertical: string, feature: string, sequence: number) {
    const featurePart = slug(feature).slice(0, 30).replace(/-$/, "");
    return `${slug(vertical)}-${featurePart}-${String(sequence).padStart(3, "0")}`
}

// utm_source and utm_medium for each channel
export const CHANNEL_UTM: Record<Channel, {source: string, medium: string }> = {
    email: { source: "email", medium: "email" },
    social: { source: "linkedin", medium: "organic-social" },
    postcard: { source: "digital-postcard", medium: "display" },
};

export function buildUtmUrl(
  baseUrl: string,
  params: { source: string; medium: string; campaign: string; content?: string },
) {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", slug(params.source));
  url.searchParams.set("utm_medium", slug(params.medium));
  url.searchParams.set("utm_campaign", slug(params.campaign));
  if (params.content) url.searchParams.set("utm_content", slug(params.content));
  return url.toString();
}

export type TrackingLink = { channel: Channel; label: string; url: string };

export function buildTracking(brief: Brief, campaignId: string): TrackingLink[] {
    const links: TrackingLink[] = [];
    const add = (channel: Channel, content: string, label: string) =>
        links.push({
            channel,
            label,
            url: buildUtmUrl(brief.destinationUrl, { ...CHANNEL_UTM[channel], campaign: campaignId, content }),
        });
    if (brief.channels.includes("email")) {
        add("email", "email-cta-a", "Email, CTA A");
        add("email", "email-cta-b", "Email, CTA B");
    }
    if (brief.channels.includes("social")) {
        add("social", "social-hook-a", "LinkedIn post, hook A");
        add("social", "social-hook-b", "LinkedIn post, hook B");
    }
    if (brief.channels.includes("postcard")) {
        add("postcard", "postcard-main", "Digital postcard");
    }
    return links;
}