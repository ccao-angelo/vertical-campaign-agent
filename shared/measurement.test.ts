import { expect, test } from "vitest";
import { buildMeasurementPlan } from "./measurement";
import { EXAMPLE_BRIEF } from "./example";

test("demo request at the MQL stage maps to the right KPIs and event", () => {
  const plan = buildMeasurementPlan(EXAMPLE_BRIEF);
  expect(plan.primaryKpi).toContain("Demo request conversion rate");
  expect(plan.conversionEvent).toBe("demo_request_submitted");
  expect(plan.secondaryKpis.at(-1)).toContain("MQL rate");
});