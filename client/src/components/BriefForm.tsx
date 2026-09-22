import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
    BriefSchema,
    CHANNELS,
    FUNNEL_STAGES,
    OBJECTIVES,
    VERTICALS,
    type Brief,
    type Channel,
} from "../../../shared/schema";
import { CHANNEL_LABELS, OBJECTIVE_LABELS, STAGE_LABELS, VERTICAL_LABELS } from "../../../shared/labels";
import { EXAMPLE_BRIEF } from "../../../shared/example";

type FormState = {
    campaignName: string;
    vertical: string;
    verticalOther: string;
    audience: string;
    objective: string;
    funnelStage: string;
    feature: string;
    valueProposition: string;
    cta: string;
    channels: Channel[];
    sourceInformation: string;
    tone: string;
    destinationUrl: string;
    prohibitedTerms: string;
};

const EMPTY: FormState = {
    campaignName: "",
    vertical: "",
    verticalOther: "",
    audience: "",
    objective: "",
    funnelStage: "",
    feature: "",
    valueProposition: "",
    cta: "",
    channels: ["email", "social", "postcard"],
    sourceInformation: "",
    tone: "",
    destinationUrl: "",
    prohibitedTerms: "",
};

function toFormState(brief: Brief): FormState {
    return { ...brief, verticalOther: brief.verticalOther ?? "", prohibitedTerms: brief.prohibitedTerms ?? "" };
}

function Field(props: { label: string; error?: string; help?: string; children: ReactNode }) {
    return (
        <label className={props.error ? "field has-error" : "field"}>
            <span className="field-label">{props.label}</span>
            {props.children}
            {props.help && <span className="help">{props.help}</span>}
            {props.error && (
                <span className="error" role="alert">
                    {props.error}
                </span>
            )}
        </label>
    );
}

type Props = { initial: Brief | null; onSubmit: (brief: Brief) => void };

export default function BriefForm({ initial, onSubmit }: Props) {
    const [form, setForm] = useState<FormState>(initial ? toFormState(initial) : EMPTY);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const update = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm({ ...form, [field]: event.target.value });
    function toggleChannel(channel: Channel) {
        const channels = form.channels.includes(channel)
            ? form.channels.filter((c) => c !== channel)
            : [...form.channels, channel];
        setForm({ ...form, channels });
    }
    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const result = BriefSchema.safeParse(form);
        if (!result.success) {
            const found: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const field = String(issue.path[0]);
                if (!found[field]) found[field] = issue.message;
            }
            setErrors(found);
            return;
        }
        setErrors({});
        onSubmit(result.data);
    }

    const errorCount = Object.keys(errors).length;

    return (
        <form className="card form" onSubmit={handleSubmit} noValidate>
            <div className="form-head">
                <h2>Campaign brief</h2>
                <button type="button" onClick={() => { setForm(toFormState(EXAMPLE_BRIEF)); setErrors({}); }}>
                    Load sample data
                </button>
            </div>
            <p className="muted small">Sample data uses demonstration facts, not real product claims.</p>

            {errorCount > 0 && (
                <div className="banner" role="alert">
                    {errorCount} {errorCount === 1 ? "field needs" : "fields need"} attention before generation.
                </div>
            )}

            <div className = "grid">
                <Field label="Campaign name" error={errors.campaignName}>
                    <input value={form.campaignName} onChange={update("campaignName")} placeholder="Hardware Inventory Campaign" />
                </Field>

                <Field label="Customer vertical" error={errors.vertical}>
                    <select value={form.vertical} onChange={update("vertical")}>
                        <option value="">Select a vertical</option>
                        {VERTICALS.map((v) => (
                        <option key={v} value={v}>{VERTICAL_LABELS[v]}</option>
                        ))}
                    </select>
                </Field>

                {form.vertical === "other" && (
                    <Field label="Describe the vertical" error={errors.verticalOther}>
                        <input value={form.verticalOther} onChange={update("verticalOther")} placeholder="Example: Plumbing supply" />
                    </Field>
                )}

                <Field label="Target audience" error={errors.audience}>
                    <input value={form.audience} onChange={update("audience")} placeholder="Store owners and operators" />
                </Field>

                <Field label="Campaign objective" error={errors.objective}>
                    <select value={form.objective} onChange={update("objective")}>
                        <option value="">Select an objective</option>
                        {OBJECTIVES.map((o) => (
                        <option key={o} value={o}>{OBJECTIVE_LABELS[o]}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Funnel stage" error={errors.funnelStage}>
                    <select value={form.funnelStage} onChange={update("funnelStage")}>
                        <option value="">Select a stage</option>
                        {FUNNEL_STAGES.map((s) => (
                        <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Product or feature" error={errors.feature}>
                    <input value={form.feature} onChange={update("feature")} placeholder="Inventory management" />
                </Field>

                <Field label="Call to action" error={errors.cta}>
                    <input value={form.cta} onChange={update("cta")} placeholder="Book a demo" />
                </Field>
            </div>

            <Field label="Approved value proposition" error={errors.valueProposition}>
                <input
                    value={form.valueProposition}
                    onChange={update("valueProposition")}
                    placeholder="Reduce inventory-related busywork for store teams"
                />
            </Field>
            <Field
                label="Approved product facts"
                error={errors.sourceInformation}
                help="One fact per line. Each line becomes F1, F2, and so on. The AI may only use these facts."
            >
                <textarea rows={6} value={form.sourceInformation} onChange={update("sourceInformation")} />
            </Field>
            <div className="grid">
                <Field label="Tone" error={errors.tone}>
                    <input value={form.tone} onChange={update("tone")} placeholder="Practical, direct, helpful" />
                </Field>
                <Field
                    label="Destination URL"
                    error={errors.destinationUrl}
                    help="The page the campaign links to. Tracking parameters are added for you."
                >
                    <input value={form.destinationUrl} onChange={update("destinationUrl")} placeholder="https://example.com/demo" />
                </Field>
            </div>
            <Field label="Prohibited terms (optional)" help="Comma-separated. Assets containing them fail the automated checks.">
                <input value={form.prohibitedTerms} onChange={update("prohibitedTerms")} placeholder="guaranteed, revolutionary" />
            </Field>

            <fieldset className={errors.channels ? "field has-error" : "field"}>
                <legend className="field-label">Content channels</legend>
                <div className="checks">
                {CHANNELS.map((channel) => (
                    <label key={channel} className="check-option">
                    <input type="checkbox" checked={form.channels.includes(channel)} onChange={() => toggleChannel(channel)} />
                    {CHANNEL_LABELS[channel]}
                    </label>
                ))}
                </div>
                {errors.channels && <span className="error" role="alert">{errors.channels}</span>}
            </fieldset>

            <button type="submit" className="primary">Create campaign</button>
        </form>
    );
}