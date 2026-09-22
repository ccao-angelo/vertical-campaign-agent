import type { Brief } from "./schema";

// Demonstration data only
export const EXAMPLE_BRIEF: Brief = {
  campaignName: "Hardware Inventory Campaign",
  vertical: "hardware",
  audience: "Independent hardware store owners and operators",
  objective: "demo_request",
  funnelStage: "mql",
  feature: "Inventory management",
  valueProposition: "Reduce inventory-related busywork for store teams",
  cta: "Book a demo",
  channels: ["email", "social", "postcard"],
  sourceInformation: [
    "Inventory management keeps stock counts for a store in one place.",
    "Staff can look up whether an item is in stock without walking the aisles.",
    "Low-stock items are visible in the system, which makes reorder needs easier to spot.",
    "The product is designed for independent retail stores that carry many different items.",
  ].join("\n"),
  tone: "Practical, direct, helpful",
  destinationUrl: "https://example.com/demo",
  prohibitedTerms: "guaranteed, revolutionary",
};