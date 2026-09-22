import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "./errors";
import { CHANNEL_CONFIG } from "./channels";
import { buildSystemPrompt, buildUserPrompt, PROMPT_VERSION } from "./prompt";
import { parseFacts, type Brief, type Channel } from "../../shared/schema";

const MODEL = process.env.MODEL ?? "claude-sonnet-5";

function getClient() {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new AppError("MISSING_API_KEY", 500, "The new server has no ANTHROPIC_API_KEY configured.");
    } return new Anthropic({ timeout: 45_000, maxRetries: 1 });
}

export function extractJson(text: string): unknown {
    const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON object found");
    return JSON.parse(cleaned.slice(start, end + 1));
}

export async function generateAsset(args: { brief: Brief; channel: Channel; instruction?: string }) {
    const { brief, channel, instruction } = args;
    const client = getClient();
    const config = CHANNEL_CONFIG[channel];
    const system = buildSystemPrompt();
    const userPrompt = buildUserPrompt(brief, parseFacts(brief.sourceInformation), channel, instruction);
    let problem = "";

    // If the first reply is invalid, tell the model to try once more
    for (let attempt = 0; attempt < 2; attempt++) {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 1500,
            system,
            messages: [
                {
                    role: "user",
                    content: problem
                        ? `${userPrompt}\n\nYour previous reply was rejected: ${problem}\nReturn corrected JSON only.`
                        : userPrompt,
                },
            ],
        });

        const text = response.content
            .filter((block): block is Anthropic.TextBlock => block.type === "text")
            .map((block) => block.text)
            .join("");
        
        try {
            const parsed = config.schema.safeParse(extractJson(text));
            if (parsed.success) {
                return {
                    channel,
                    content: parsed.data,
                    meta: { model: MODEL, promptVersion: PROMPT_VERSION, generatedAt: new Date().toISOString() },
                };
            }
            problem = parsed.error.issues.map((issue) => `${issue.message}`).join("; ");
        } catch {
            problem = "The reply was not valid JSON.";
        }
    }
    throw new AppError("INVALID_JSON", 502, "The AI returned an unusable response twice. Please try again.");
}