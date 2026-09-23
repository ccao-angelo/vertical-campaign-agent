import { describe, expect, test } from "vitest";
import { EXAMPLE_BRIEF } from "../../../shared/example";
import type { AnyContent } from "../../../shared/schema";
import { newAsset } from "../lib/newAsset";
import type { Campaign, GenerateResult } from "../types";
import { reducer, type State } from "./reducer";

function result(channel: GenerateResult["channel"], text: string): GenerateResult {
  return {
    channel,
    content: { headline: text } as unknown as AnyContent,
    meta: { model: "test-model", promptVersion: "v1.0", generatedAt: "2026-01-01T00:00:00.000Z" },
  };
}

function startState(): State {
  const campaign: Campaign = {
    id: "hardware-inventory-management-001",
    createdAt: "2026-01-01T00:00:00.000Z",
    brief: EXAMPLE_BRIEF,
    facts: [],
    assets: {
      email: newAsset(result("email", "old email")),
      social: newAsset(result("social", "old social")),
      postcard: newAsset(result("postcard", "old postcard")),
    },
  };
  return { campaign };
}

describe("individual regeneration (Test 4)", () => {
  test("regenerating the email does not touch the social post or postcard", () => {
    const before = startState();
    const after = reducer(before, { type: "ASSET_GENERATED", channel: "email", result: result("email", "new email") });
    expect((after.campaign!.assets.email!.content as any).headline).toBe("new email");
    expect(after.campaign!.assets.social).toBe(before.campaign!.assets.social);
    expect(after.campaign!.assets.postcard).toBe(before.campaign!.assets.postcard);
  });
});

describe("review workflow (Test 6)", () => {
  test("draft -> needs review -> approved works", () => {
    let state = startState();
    state = reducer(state, { type: "STATUS_CHANGED", channel: "email", to: "needs_review" });
    expect(state.campaign!.assets.email!.meta.status).toBe("needs_review");
    state = reducer(state, { type: "STATUS_CHANGED", channel: "email", to: "approved" });
    expect(state.campaign!.assets.email!.meta.status).toBe("approved");
  });

  test("draft -> approved directly is refused", () => {
    const state = reducer(startState(), { type: "STATUS_CHANGED", channel: "email", to: "approved" });
    expect(state.campaign!.assets.email!.meta.status).toBe("draft");
  });

  test("rejecting requires a reason", () => {
    let state = reducer(startState(), { type: "STATUS_CHANGED", channel: "email", to: "needs_review" });
    state = reducer(state, { type: "STATUS_CHANGED", channel: "email", to: "rejected" });
    expect(state.campaign!.assets.email!.meta.status).toBe("needs_review");
    state = reducer(state, { type: "STATUS_CHANGED", channel: "email", to: "rejected", reason: "too_generic", note: "Add detail" });
    expect(state.campaign!.assets.email!.meta.status).toBe("rejected");
    expect(state.campaign!.assets.email!.meta.rejectionReason).toBe("too_generic");
  });

  test("editing an approved asset sends it back to draft", () => {
    let state = startState();
    state = reducer(state, { type: "STATUS_CHANGED", channel: "email", to: "needs_review" });
    state = reducer(state, { type: "STATUS_CHANGED", channel: "email", to: "approved" });
    state = reducer(state, { type: "ASSET_EDITED", channel: "email", content: { headline: "edited" } as unknown as AnyContent });
    expect(state.campaign!.assets.email!.meta.status).toBe("draft");
    expect(state.campaign!.assets.email!.meta.edited).toBe(true);
  });
});