import { z } from "zod";

// Allowed values used in form dropdowns and validation
export const VERTICALS = ["hardware", "paint", "lawn_garden", "farm_feed", "lumber", "other"] as const;
export const FUNNEL_STAGES = ["awareness", "lead", "mql", "sql", "opportunity", "customer"] as const;
export const OBJECTIVES = [
    "brand_awareness",
    "website_traffic",
    "content_download",
    "demo_request",
    "lead_nurturing",
    "customer_education",
    "product_adoption",
] as const;
export const CHANNELS = ["email", "social", "postcard"] as const;
export const STATUSES = ["draft", "needs_review", "approved", "rejected"] as const;
export const REJECTION_REASONS = [
    "too_generic",
  "unsupported_claim",
  "wrong_audience",
  "tone_mismatch",
  "cta_unclear",
  "other",
] as const;

export type Vertical = (typeof VERTICALS)[number];
export type FunnelStage = (typeof FUNNEL_STAGES)[number];
export type Objective = (typeof OBJECTIVES)[number];
export type Channel = (typeof CHANNELS)[number];
export type Status = (typeof STATUSES)[number];
export type RejectionReason = (typeof REJECTION_REASONS)[number];

function isHttpUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

// Campaign brief
export const BriefSchema = z
    .object({
        campaignName: z.string().trim().min(3, "Enter a campaign name (at least 3 characters)."),
        vertical: z.enum(VERTICALS, { message: "Select a customer vertical." }),
        verticalOther: z.string().trim().optional(),
        audience: z.string().trim().min(3, "Describe the target audience."),
        objective: z.enum(OBJECTIVES, { message: "Select a campaign objective." }),
        funnelStage: z.enum(FUNNEL_STAGES, { message: "Select a funnel stage." }),
        feature: z.string().trim().min(2, "Enter the product or feature."),
        valueProposition: z.string().trim().min(10, "Enter the approved value proposition (at least 10 characters)."),
        cta: z.string().trim().min(2, "Enter the call to action."),
        channels: z.array(z.enum(CHANNELS)).min(1, "Select at least one channel."),
        sourceInformation: z.string().trim().min(30, "Paste the approved product facts, one fact per line."),
        tone: z.string().trim().min(3, "Describe the tone."),
        destinationUrl: z.string().trim().refine(isHttpUrl, "Enter a valid web address starting with http:// or https://"),
        prohibitedTerms: z.string().trim().optional(),
    })
    .refine((brief) => brief.vertical !== "other" || !brief.verticalOther, {
        path: ["verticalOther"],
        message: "Describe the vertical.",
    });

export  type Brief = z.infer<typeof BriefSchema>;

// What AI must return for each channel
const usedFactIds = z.array(z.string()).min(1);

export const EmailSchema = z.object({
    subjectLines: z
        .array(z.object({ label: z.enum(["A", "B", "C"]), text: z.string().min(1), angle: z.string() }))
        .length(3),
    previewText: z.string().min(1),
    bodyParagraphs: z.array(z.string().min(1)).min(2).max(6),
    ctaVariants: z.object({ a: z.string().min(1), b: z.string().min(1) }),
    usedFactIds,
});

export const SocialSchema = z.object({
    hooks: z.object({ a: z.string().min(1), b: z.string().min(1) }),
    mainPost: z.string().min(1),
    cta: z.string().min(1),
    visualDirection: z.string().min(1),
    usedFactIds,
});

export const PostcardSchema = z.object({
  headline: z.string().min(1),
  supportingCopy: z.string().min(1),
  cta: z.string().min(1),
  disclaimer: z.string().nullable(),
  visualConcept: z.string().min(1),
  usedFactIds,
});

export type Email = z.infer<typeof EmailSchema>;
export type Social = z.infer<typeof SocialSchema>;
export type Postcard = z.infer<typeof PostcardSchema>;
export type AnyContent = Email | Social | Postcard;

// Approved facts
export type Fact = { id: string; text: string };

export function parseFacts(source: string): Fact[] {
    return source
        .split("\n")
        .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim()) // Remove "- " or "1. " but keep "24/7"
        .filter(Boolean)
        .map((text, index) => ({ id: `F${index + 1}`, text }));
}