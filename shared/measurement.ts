import type { Brief, FunnelStage, Objective } from "./schema";

export const OBJECTIVE_KPIS: Record<Objective, { primary: string; secondary: string[]; event: string }> = {
  brand_awareness: {
    primary: "Qualified reach (impressions within the target vertical)",
    secondary: ["Engagement rate", "Follower or subscriber growth"],
    event: "engaged_visit",
  },
  website_traffic: {
    primary: "Landing-page sessions from the campaign",
    secondary: ["Click-through rate", "Engaged-session rate"],
    event: "landing_page_view",
  },
  content_download: {
    primary: "Download conversion rate (downloads / landing-page sessions)",
    secondary: ["Click-through rate", "Form completion rate"],
    event: "content_download",
  },
  demo_request: {
    primary: "Demo request conversion rate (requests / landing-page sessions)",
    secondary: ["Click-through rate", "Click-to-open rate (email)", "Form completion rate"],
    event: "demo_request_submitted",
  },
  lead_nurturing: {
    primary: "Nurture engagement rate (clicks / delivered)",
    secondary: ["Click-to-open rate", "Reply rate", "Progression to the next funnel stage"],
    event: "nurture_cta_click",
  },
  customer_education: {
    primary: "Content engagement rate",
    secondary: ["Return visits", "Help-content views"],
    event: "education_content_viewed",
  },
  product_adoption: {
    primary: "Feature activation rate (activated accounts / targeted accounts)",
    secondary: ["Time to first use", "Repeat usage"],
    event: "feature_activated",
  },
};

export const STAGE_KPI: Record<FunnelStage, string> = {
  awareness: "Reach",
  lead: "Lead capture rate",
  mql: "MQL rate (leads meeting MQL criteria / leads)",
  sql: "MQL to SQL conversion rate",
  opportunity: "SQL to opportunity conversion rate",
  customer: "Retention or expansion rate",
};

export type MeasurementPlan = {
  primaryKpi: string;
  secondaryKpis: string[];
  funnelStage: FunnelStage;
  stageKpi: string;
  conversionEvent: string;
  successDefinition: string;
};

export function buildMeasurementPlan(brief: Brief): MeasurementPlan {
  const objective = OBJECTIVE_KPIS[brief.objective];
  const stageKpi = STAGE_KPI[brief.funnelStage];
  return {
    primaryKpi: objective.primary,
    secondaryKpis: [...objective.secondary, stageKpi],
    funnelStage: brief.funnelStage,
    stageKpi,
    conversionEvent: objective.event,
    successDefinition:
      `Success means "${objective.primary}" for ${brief.audience} improves against a baseline set before launch, ` +
      `and "${stageKpi}" moves in the same direction. This tool assumes no benchmark values; ` +
      `set targets from your own historical data.`,
  };
}