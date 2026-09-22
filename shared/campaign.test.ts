import { expect, test } from "vitest";
import { buildTracking, buildUtmUrl, makeCampaignId } from "./campaign";
import { EXAMPLE_BRIEF } from "./example";

test("UTM url is formatted consistently (Test 5)", () => {
  const url = buildUtmUrl("https://example.com/demo", {
    source: "LinkedIn",
    medium: "organic social",
    campaign: "hardware-inventory-001",
    content: "social-hook-a",
  });
  expect(url).toBe(
    "https://example.com/demo?utm_source=linkedin&utm_medium=organic-social&utm_campaign=hardware-inventory-001&utm_content=social-hook-a",
  );
});

test("campaign id has the expected format", () => {
  expect(makeCampaignId("hardware", "Inventory management", 1)).toBe("hardware-inventory-management-001");
  expect(makeCampaignId("lawn_garden", "Soil test kit", 12)).toBe("lawn-garden-soil-test-kit-012");
});

test("tracking links exist for every selected channel", () => {
  const links = buildTracking(EXAMPLE_BRIEF, "hardware-inventory-management-001");
  expect(links).toHaveLength(5); // email A/B, social A/B, postcard
  expect(links.every((l) => l.url.includes("utm_campaign=hardware-inventory-management-001"))).toBe(true);
});