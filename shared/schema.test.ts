import { describe, expect, test } from "vitest";
import { BriefSchema, parseFacts } from "./schema";
import { EXAMPLE_BRIEF } from "./example";

describe("brief validation", () => {
  test("the example brief is valid", () => {
    expect(BriefSchema.safeParse(EXAMPLE_BRIEF).success).toBe(true);
  });

  test("a missing CTA and audience are reported (Test 2)", () => {
    const result = BriefSchema.safeParse({ ...EXAMPLE_BRIEF, cta: "", audience: "" });
    expect(result.success).toBe(false);
    const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
    expect(fields).toContain("cta");
    expect(fields).toContain("audience");
  });

  test("no channel selected is reported", () => {
    const result = BriefSchema.safeParse({ ...EXAMPLE_BRIEF, channels: [] });
    expect(result.success).toBe(false);
  });

  test("an invalid destination URL is reported", () => {
    const result = BriefSchema.safeParse({ ...EXAMPLE_BRIEF, destinationUrl: "not a url" });
    expect(result.success).toBe(false);
  });
});

describe("parseFacts", () => {
  test("numbers each line and strips bullets but keeps 24/7", () => {
    const facts = parseFacts("- First fact here\n2. Second fact\n\n24/7 support exists");
    expect(facts).toEqual([
      { id: "F1", text: "First fact here" },
      { id: "F2", text: "Second fact" },
      { id: "F3", text: "24/7 support exists" },
    ]);
  });
});