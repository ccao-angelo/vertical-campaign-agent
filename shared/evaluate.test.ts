import { describe, expect, test } from "vitest";
import { evaluateAsset, unsupportedNumbers } from "./evaluate";
import { hasFailures, scoreChecks } from "./checks";
import { EXAMPLE_BRIEF } from "./example";
import { parseFacts, type Email, type Postcard } from "./schema";

const facts = parseFacts(EXAMPLE_BRIEF.sourceInformation);

const goodEmail: Email = {
  subjectLines: [
    { label: "A", text: "Spend less time counting stock on shelves", angle: "benefit" },
    { label: "B", text: "Still counting inventory by hand every week?", angle: "question" },
    { label: "C", text: "Inventory management for hardware stores", angle: "direct" },
  ],
  previewText: "See how your team can keep stock counts in one place.",
  bodyParagraphs: [
    "Inventory management keeps stock counts for your store in one place.",
    "Staff can look up whether an item is in stock without walking the aisles.",
    "Book a demo to see how it works for your team.",
  ],
  ctaVariants: { a: "Book a demo", b: "Book your demo today" },
  usedFactIds: ["F1", "F2"],
};

function byId(checks: ReturnType<typeof evaluateAsset>, id: string) {
  return checks.find((c) => c.id === id);
}

describe("numbers", () => {
  test("an unapproved statistic is flagged (Test 3)", () => {
    expect(unsupportedNumbers("Cut counting time by 40%.", "Inventory keeps stock counts in one place.")).toEqual(["40%"]);
  });

  test("numbers that appear in the approved text are allowed", () => {
    expect(unsupportedNumbers("Works for 24/7 lookups", "24/7 lookup of stock")).toEqual([]);
  });
});

describe("evaluateAsset", () => {
  test("a clean email has no failures", () => {
    const checks = evaluateAsset("email", goodEmail, EXAMPLE_BRIEF, facts);
    expect(hasFailures(checks)).toBe(false);
    expect(scoreChecks(checks)).toBeGreaterThan(80);
  });

  test("an invented statistic fails grounding.numbers", () => {
    const bad = { ...goodEmail, bodyParagraphs: ["Cut counting time by 40% with inventory management.", "Book a demo."] };
    const checks = evaluateAsset("email", bad, EXAMPLE_BRIEF, facts);
    expect(byId(checks, "grounding.numbers")?.severity).toBe("fail");
    expect(hasFailures(checks)).toBe(true);
  });

  test("a missing CTA fails cta.present", () => {
    const bad = { ...goodEmail, ctaVariants: { a: "Learn more", b: "Find out more" } };
    expect(byId(evaluateAsset("email", bad, EXAMPLE_BRIEF, facts), "cta.present")?.severity).toBe("fail");
  });

  test("a prohibited term fails terms.prohibited", () => {
    const bad = { ...goodEmail, previewText: "A guaranteed way to save time." };
    expect(byId(evaluateAsset("email", bad, EXAMPLE_BRIEF, facts), "terms.prohibited")?.severity).toBe("fail");
  });

  test("a short subject line only warns", () => {
    const short = { ...goodEmail, subjectLines: [{ label: "A" as const, text: "Too short", angle: "x" }, goodEmail.subjectLines[1], goodEmail.subjectLines[2]] };
    expect(byId(evaluateAsset("email", short, EXAMPLE_BRIEF, facts), "email.subject")?.severity).toBe("warn");
  });

  test("an unknown fact ID fails grounding.facts", () => {
    const bad = { ...goodEmail, usedFactIds: ["F9"] };
    expect(byId(evaluateAsset("email", bad, EXAMPLE_BRIEF, facts), "grounding.facts")?.severity).toBe("fail");
  });

  test("a postcard with a long headline warns", () => {
    const card: Postcard = {
      headline: "Inventory management that keeps every single item counted in one place",
      supportingCopy: "Keep stock counts in one place. Book a demo.",
      cta: "Book a demo",
      disclaimer: null,
      visualConcept: "A tidy hardware store shelf.",
      usedFactIds: ["F1"],
    };
    expect(byId(evaluateAsset("postcard", card, EXAMPLE_BRIEF, facts), "postcard.length")?.severity).toBe("warn");
  });
});