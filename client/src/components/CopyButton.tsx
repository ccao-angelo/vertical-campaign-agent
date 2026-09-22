import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string}) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            alert("Copy failed. Select the text and copy it manually.");
        }
    }

    return <button onClick={copy}>{copied ? "Copied" : label}</button>
}