import type { Channel, FunnelStage, Objective, RejectionReason, Status, Vertical } from "./schema";

export const VERTICAL_LABELS: Record<Vertical, string> = {
    hardware: "Hardware",
    paint: "Paint",
    lawn_garden: "Lawn and garden",
    farm_feed: "Farm and feed",
    lumber: "Lumber",
    other: "Other",
};

export const STAGE_LABELS: Record<FunnelStage, string> = {
    awareness: "Awareness",
    lead: "Lead",
    mql: "MQL",
    sql: "SQL",
    opportunity: "Opportunity",
    customer: "Customer",
};

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  brand_awareness: "Brand awareness",
  website_traffic: "Website traffic",
  content_download: "Content download",
  demo_request: "Demo request",
  lead_nurturing: "Lead nurturing",
  customer_education: "Customer education",
  product_adoption: "Product adoption",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  social: "LinkedIn post",
  postcard: "Digital postcard",
};

export const STATUS_LABELS: Record<Status, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  approved: "Approved",
  rejected: "Rejected",
};

export const REASON_LABELS: Record<RejectionReason, string> = {
  too_generic: "Too generic",
  unsupported_claim: "Unsupported claim",
  wrong_audience: "Wrong audience",
  tone_mismatch: "Tone mismatch",
  cta_unclear: "CTA unclear",
  other: "Other",
};

// Used when a rejected asset is regenerated: Tells AI what to fix
export const REASON_INSTRUCTIONS: Record<RejectionReason, string> = {
  too_generic: "Make it more specific to the audience and feature, using only approved facts.",
  unsupported_claim: "Remove any claim that is not directly supported by the approved facts.",
  wrong_audience: "Rewrite it for the stated audience and vertical.",
  tone_mismatch: "Match the requested tone more closely.",
  cta_unclear: "Make the call to action clearer and use the exact required wording.",
  other: "",
};