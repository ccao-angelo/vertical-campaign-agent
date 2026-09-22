import { EmailSchema, PostcardSchema, SocialSchema } from "../../shared/schema";

export const CHANNEL_CONFIG = {
    email: {
        schema: EmailSchema,
        guidance: `Subject lines: exactly 3, labelled A, B and C. Each is 30-60 characters and uses a different angle (benefit, question, direct).
    previewText: 40-90 characters and clearly different from every subject line.
    bodyParagraphs: 3-4 short paragraphs (1-3 sentences each), 120 words maximum in total.
    ctaVariants.a: the exact required CTA. ctaVariants.b: the same action in different wording.`,
        shape: `{"subjectLines":[{"label":"A","text":"","angle":"benefit"},{"label":"B","text":"","angle":"question"},{"label":"C","text":"","angle":"direct"}],"previewText":"","bodyParagraphs":["","",""],"ctaVariants":{"a":"","b":""},"usedFactIds":["F1"]}`,
    },
    social: {
        schema: SocialSchema,
        guidance: `hooks.a and hooks.b: two strong opening sentences in different styles (for example problem-first and outcome-first).
    mainPost: begins with hooks.a, 60-120 words, at most 2 hashtags (none is better), one CTA at the end.
    shortVersion: 280 characters maximum and includes the CTA.
    cta: the exact required CTA. visualDirection: one or two sentences.`,
        shape: `{"hooks":{"a":"","b":""},"mainPost":"","shortVersion":"","cta":"","visualDirection":"","usedFactIds":["F1"]}`,
    },
    postcard: {
        schema: PostcardSchema,
        guidance: `headline: 8 words maximum. supportingCopy: 35 words maximum, built around one central benefit.
    cta: the exact required CTA. disclaimer: a short string, or null if none is needed.
    visualConcept: one or two sentences. No statistics.`,
        shape: `{"headline":"","supportingCopy":"","cta":"","disclaimer":null,"visualConcept":"","usedFactIds":["F1"]}`,
    },
} as const;