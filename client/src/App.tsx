import { useEffect, useState } from "react";
import type { Brief, Channel } from "../../shared/schema";
import BriefForm from "./components/BriefForm";
import CampaignPlan from "./components/CampaignPlan";
import ErrorBanner from "./components/ErrorBanner";
import Footer from "./components/Footer";
import { ApiError, generateAsset, getHealth } from "./api";
import { newAsset } from "./lib/newAsset";
import { newCampaign } from "./lib/newCampaign";
import type { Campaign } from "./types";

export default function App() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prefill, setPrefill] = useState<Brief | null>(null);
  const [loading, setLoading] = useState<Partial<Record<Channel, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Channel, string | null>>>({});
  const [health, setHealth] = useState<"checking" | "ok" | "no-key" | "down">("checking");

  useEffect(() => {
    getHealth().then((result) => setHealth(!result ? "down" : result.hasApiKey ? "ok" : "no-key"));
  }, []);

  async function generateChannel(current: Campaign, channel: Channel) {
    setLoading((prev) => ({ ...prev, [channel]: true }));
    setErrors((prev) => ({ ...prev, [channel]: null }));
    try {
      const result = await generateAsset(current.brief, channel);
      setCampaign((prev) => (prev ? { ...prev, assets: { ...prev.assets, [channel]: newAsset(result) } } : prev));
    }  catch (error) {
      setErrors((prev) => ({ ...prev, [channel]: error instanceof ApiError ? error.message : "Something went wrong." }));
    } finally {
      setLoading((prev) => ({ ...prev, [channel]: false }));
    }
  }

  const busy = Object.values(loading).some(Boolean);

  return (
    <div className="app">
      <header className="masthead">
        <h1>Vertical Campaign Agent</h1>
        <p>Turn one campaign brief into coordinated, trackable marketing assets.</p>
      </header>

      {health === "no-key" && <ErrorBanner message="The server has no ANTHROPIC_API_KEY. Add it to the .env file and restart the server." />}
      {health === "down" && <ErrorBanner message="Cannot reach the server. Check that it is running." />}

      {!campaign ? (
        <BriefForm initial={prefill} onSubmit={(brief) => setCampaign(newCampaign(brief))} />
      ) : (
        <>
          <div className="toolbar">
            <button className="primary" disabled={busy} onClick={() => Promise.all(campaign.brief.channels.map((channel) => generateChannel(campaign, channel)))}>
              {busy ? "Generating..." : "Generate assets"}
            </button>
            <button onClick={() => { setPrefill(campaign.brief); setCampaign(null); }}>Edit brief (starts a new campaign)</button>
            <button onClick={() => { setPrefill(null); setCampaign(null); }}>New blank campaign</button>
          </div>

          <CampaignPlan campaign={campaign} />

          {campaign.brief.channels.map((channel) => (
            <section className="card" key={channel}>
              <h3>{channel}</h3>
              {loading[channel] && <p className="muted">Generating...</p>}
              {errors[channel] && <ErrorBanner message={errors[channel]!} />}
              {campaign.assets[channel] && <pre>{JSON.stringify(campaign.assets[channel]!.content, null, 2)}</pre>}
            </section>
          ))}
        </>
      )}

      <Footer />
    </div>
  );
}