import { expect, test } from "vitest";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { extractJson } from "./generate";
import { EXAMPLE_BRIEF } from "../../shared/example";
import { parseFacts } from "../../shared/schema";

test("the prompt contains the CTA, the numbered facts and the grounding rules", () => {
    const facts = parseFacts(EXAMPLE_BRIEF.sourceInformation);
    const prompt = buildUserPrompt(EXAMPLE_BRIEF, facts, "email");
    expect(prompt).toContain("Book a demo");
    expect(prompt).toContain("F1: Inventory management keeps stock counts");
    expect(buildSystemPrompt()).toContain("Use ONLY the numbered approved facts");
});

test("a reviewer instruction is added to the prompt", () => {
  const facts = parseFacts(EXAMPLE_BRIEF.sourceInformation);
  const prompt = buildUserPrompt(EXAMPLE_BRIEF, facts, "social", "Make it shorter.");
  expect(prompt).toContain("REVIEWER INSTRUCTION FOR THIS REVISION: Make it shorter.");
});

test("extractJson handles markdown fences and extra text", () => {
  expect(extractJson('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
  expect(extractJson('Here you go: {"a": 1} Thanks!')).toEqual({ a: 1 });
  expect(() => extractJson("no json here")).toThrow();
});