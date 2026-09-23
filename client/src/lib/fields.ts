import type { AnyContent, Channel, Email } from "../../../shared/schema";

export type Path = (string | number)[];
export type Field = { path: Path; label: string; multiline?: boolean };

export function getIn(object: unknown, path: Path): string {
    let current: any = object;
    for (const key of path) current = current?.[key];
    return typeof current === "string" ? current : "";
}

export function setIn<T>(object: T, path: Path, value: string): T {
    const copy = structuredClone(object) as any;
    let current = copy;
    for (const key of path.slice(0, -1)) current = current[key];
    current[path[path.length - 1]] = value;
    return copy as T;
}

export function fieldsFor(channel: Channel, content: AnyContent): Field[] {
    if (channel === "email") {
        const email = content as Email;
        return [
            ...email.subjectLines.map((s, i) => ({ path: ["subjectLines", i, "text"], label: `Subject ${s.label} (${s.angle})` })),
            { path: ["previewText"], label: "Preview text" },
            ...email.bodyParagraphs.map((_, i) => ({ path: ["bodyParagraphs", i], label: `Body paragraph ${i + 1}`, multiline: true })),
            { path: ["ctaVariants", "a"], label: "CTA A" },
            { path: ["ctaVariants", "b"], label: "CTA B" },
        ];
    }
    if (channel === "social") {
        return [
        { path: ["hooks", "a"], label: "Hook A" },
        { path: ["hooks", "b"], label: "Hook B" },
        { path: ["mainPost"], label: "Main post", multiline: true },
        { path: ["shortVersion"], label: "Short version", multiline: true },
        { path: ["cta"], label: "CTA" },
        { path: ["visualDirection"], label: "Visual direction", multiline: true },
        ];
    }
    return [
        { path: ["headline"], label: "Headline" },
        { path: ["supportingCopy"], label: "Supporting copy", multiline: true },
        { path: ["cta"], label: "CTA" },
        { path: ["disclaimer"], label: "Disclaimer (optional)" },
        { path: ["visualConcept"], label: "Visual concept", multiline: true },
    ];
}

export function assetToText(channel: Channel, content: AnyContent): string {
    return fieldsFor(channel, content)
        .map((field) => `${field.label}: ${getIn(content, field.path) || "(none)"}`)
        .join("\n");
}