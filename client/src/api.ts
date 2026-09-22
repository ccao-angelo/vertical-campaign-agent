import type { Brief, Channel } from "../../shared/schema";
import type { GenerateResult } from "./types";

export class ApiError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
    }
}

export async function getHealth(): Promise<{ ok: boolean; hasApiKey: boolean } | null> {
    try {
        const response = await fetch("/api/health");
        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
}

export async function generateAsset(brief: Brief, channel: Channel, instruction?: string): Promise<GenerateResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);

    try {
        const response = await fetch("/api/assets/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brief, channel, instruction }),
            signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
            throw new ApiError(data?.error?.code ?? "UNKNOWN", data?.error?.message ?? "Unexpected server error.");
        }
        return data as GenerateResult;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError("TIMEOUT", "The request took too long. Try again.");
        } throw new ApiError("NETWORK", "Network problem. Check your connection and try again.");
    } finally {
        clearTimeout(timer);
    }
}