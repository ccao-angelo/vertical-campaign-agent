import type { Brief, Channel, Fact } from "./schema";
import type { Check, Severity } from "./checks";

export const flattenText = (value: unknown): string[] =>
    typeof value === "string"
        ? [value]
        : Array.isArray(value)
            ? value.flatMap(flattenText)
            : value && typeof value === "object"
                ? Object.entries(value).filter(([key]) => key !== "usedFactIds").flatMap(([, item]) => flattenText(item))
                : [];

const NUMBER_PATTERN = /\$?\d+(?:,\d{3})*(?:\.\d+)?%?/g;

export function unsupportedNumbers(text: string, allowedText: string): string[] {
    const allowed = new Set(allowedText.match(NUMBER_PATTERN) ?? []);
    const found = text.match(NUMBER_PATTERN) ?? [];
    return [...new Set(found.filter((n) => !allowed.has(n)))];
}

export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const DEFAULT_BANNED_TERMS = ["limited time", "act now", "guaranteed", "#1"];

export function evaluateAsset(channel: Channel, content: any, brief: Brief, facts: Fact[]): Check[] {
    const checks: Check[] = [];
    const add = (id: string, label: string, ok: boolean, severityIfBad: Severity, detail?: string) =>
        checks.push({ id, label, severity: ok? "pass" : severityIfBad, detail: ok? undefined : detail });
    const text = flattenText(content).join("\n");
    const lower = text.toLowerCase();
    const sourceLower = brief.sourceInformation.toLowerCase();
    const approvedText = [brief.sourceInformation, brief.valueProposition, brief.cta].join(" ");

    // Grounding: Is everything backed by approved info
    const badNumbers = unsupportedNumbers(text, approvedText);
    add("grounding.numbers", "Numbers and statistics come from approved information", badNumbers.length === 0, "fail", `Not found in the approved information: ${badNumbers.join(", ")}`,);

    const ids: string[] = content.usedFactIds ?? [];
    const validIds = new Set(facts.map((f) => f.id));
    const unknownIds = ids.filter((id) => !validIds.has(id));
    if (unknownIds.length > 0) {
        add("grounding.facts", "References real approved facts", false, "fail", `Unknown fact IDs: ${unknownIds.join(", ")}`);
    } else {
        add("grounding.facts", "References approved facts", ids.length > 0, "warn", "No approved facts are referenced.");
    }

    add("grounding.missing", "No missing details flagged", !text.includes("[MISSING:"), "warn", "The text contains a [MISSING: ...] marker. Fill in the missing detail before approving.",);

    const ctaText: string = channel === "email" ? (content.ctaVariants?.a ?? "") : (content.cta ?? "");
    add("cta.present", "Uses the approved call to action", ctaText.toLowerCase().includes(brief.cta.toLowerCase()), "fail", `The CTA should include "${brief.cta}".`,);

    const customTerms = (brief.prohibitedTerms ?? "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const banned = [...DEFAULT_BANNED_TERMS.filter((t) => !sourceLower.includes(t)), ...customTerms];
    const foundTerms = banned.filter((t) => lower.includes(t));
    add("terms.prohibited", "Avoids prohibited terms and supported urgency", foundTerms.length === 0, "fail", `Found: ${foundTerms.join(", ")}`,);

    add("consistency.feature", "Mentions the feature by name", lower.includes(brief.feature.toLowerCase()), "warn", `"${brief.feature}" does not appear in this asset.`,);

    if (channel === "email") {
        const subjects: { label: string; text: string }[] = content.subjectLines ?? [];
        const badSubjects = subjects.filter((s) => s.text.length < 30 || s.text.length > 60);
        add("email.subject", "Subject lines are 30 to 60 characters", badSubjects.length === 0, "warn", `Outside the range: ${badSubjects.map((s) => `${s.label} (${s.text.length})`).join(", ")}`,);
        
        const preview = String(content.previewText ?? "").trim().toLowerCase();
        const previewClash = subjects.some((s) => {
            const subject = s.text.toLowerCase();
            return preview === subject || subject.includes(preview) || preview.includes(subject);
        });
        add("email.preview", "Preview text is different from the subject lines", preview.length > 0 && !previewClash, "warn", "The preview text repeats a subject line.",);

        const bodyWords = wordCount((content.bodyParagraphs ?? []).join(" "));
        add("email.body", "Body is 150 words or fewer", bodyWords <= 150, "warn", `The body has ${bodyWords} words.`);

        add("ab.distinct", "CTA A and CTA B are different", String(content.ctaVariants?.a).trim().toLowerCase() !== String(content.ctaVariants?.b).trim().toLowerCase(), "warn", "Both CTA variants are identical, so there is nothing to test.",);
    }

    if (channel === "social") {
        const mainWords = wordCount(content.mainPost ?? "");
        const shortLength = String(content.shortVersion ?? "").length;
        const hashtags = (String(content.mainPost ?? "").match(/#\w+/g) ?? []).length;
        add(
        "social.length",
        "Post length and hashtags are within limits",
        mainWords <= 130 && shortLength <= 280 && hashtags <= 2,
        "warn",
        `Main post: ${mainWords} words (max 130). Short version: ${shortLength} characters (max 280). Hashtags: ${hashtags} (max 2).`,
        );
        add(
        "ab.distinct",
        "Hook A and hook B are different",
        String(content.hooks?.a).trim().toLowerCase() !== String(content.hooks?.b).trim().toLowerCase(),
        "warn",
        "Both hooks are identical, so there is nothing to test.",
        );
    }

    if (channel === "postcard") {
        const headlineWords = wordCount(content.headline ?? "");
        const copyWords = wordCount(content.supportingCopy ?? "");
        add("postcard.length", "Headline and copy are short", headlineWords <= 8 && copyWords <= 35, "warn", `Headline: ${headlineWords} words (max 8). Supporting copy: ${copyWords} words (max 35).`,);
    }

    checks.push({
        id: "tone.manual",
        label: "Tone needs a human check",
        severity: "info",
        detail: `Requested tone: "${brief.tone}". The reviewer confirms whether the text matches.`,
    });

    return checks;
}