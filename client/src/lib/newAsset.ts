import type { Asset, GenerateResult } from "../types";

export function newAsset(result: GenerateResult): Asset {
    return {
        content: result.content,
        meta: {
            status: "draft",
            rejectionReason: null,
            reviewerNote: null,
            edited: false,
            generatedAt: result.meta.generatedAt,
            updatedAt: new Date().toISOString(),
            model: result.meta.model,
            promptVersion: result.meta.promptVersion,
        },
    };
}