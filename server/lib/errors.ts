import Anthropic from "@anthropic-ai/sdk";
import type { Response } from "express";
import App from "../../client/src/App";

export class AppError extends Error {
    code: string;
    status: number;

    constructor(code: string, status: number, message: string) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export function toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Anthropic.AuthenticationError) return new AppError("MISSING API_KEY", 500, "The server's API key is missing or invalid.");
    if (error instanceof Anthropic.RateLimitError) return new AppError("RATE_LIMITED", 429, "The AI provider is limiting requests. Try again in a minute.");
    if (error instanceof Anthropic.APIConnectionTimeoutError) return new AppError("TIMEOUT", 504, "The AI model took too long to respond. Try again.");
    if (error instanceof Anthropic.APIConnectionError) return new AppError("NETWORK", 502, "The server could not reach the AI provider.");
    if (error instanceof Anthropic.APIError) return new AppError("MODEL_ERROR", 502, "The AI provider returned an error. Try again.");
    return new AppError("UNKNOWN", 500, "Unexpected server error.");
}

export function sendError(res: Response, error: unknown) {
    const appError = toAppError(error);
    console.error(`[${appError.code}]`, error instanceof Error ? error.message : error);
    res.status(appError.status).json({ error: { code: appError.message } });
}