import { useEffect, useReducer, useState } from "react";
import { CHANNELS, type Brief, type Channel } from "../../shared/schema";
import { buildTracking } from "../../shared/campaign";
import type { Check } from "../../shared/checks";
import { evaluateAsset } from "../../shared/evaluate";
import AssetCard from "./components/AssetCard";
import BriefForm from "./components/BriefForm";
import CampaignPlan from "./components/CampaignPlan";
import ErrorBanner from "./components/ErrorBanner";
import ExportPanel from "./components/ExportPanel";
import Footer from "./components/Footer";
import { ApiError, generateAsset, getHealth } from "./api";
import { newCampaign } from "./lib/newCampaign";
import { reducer } from "./state/reducer";
import { clearCampaign, loadCampaign, saveCampaign } from "./state/storage";
import type { Campaign } from "./types";
import { start } from "node:repl";

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ campaign: loadCampaign() }));
  const campaign = state.campaign;
  const [prefill, setPrefill] = useState<Brief | null>(null);
  const [loading, setLoading] = useState<Partial<Record<Channel, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Channel, string | null>>>({});
  const [health, setHealth] = useState<"checking" | "ok" | "no-key" | "down">("checking");

  useEffect(() => {
    getHealth().then((result) => setHealth(!result ? "down" : result.hasApiKey ? "ok" : "no-key"));
  }, []);

  // Save the campaign in the browser every time it changes
  useEffect(() => {
    if (campaign) saveCampaign(campaign);
    else clearCampaign();
  }, [campaign]);

  // Automated checks for one channel
  const getChecks = (channel: Channel): Check[] => {
    const asset = campaign?.assets[channel];
    return campaign && asset ? evaluateAsset(channel, asset.content, campaign.brief, campaign.facts) : [];
  };

  async function generateChannel(current: Campaign, channel: Channel, instruction?: string) {
    setLoading((prev) => ({ ...prev, [channel]: true }));
    setErrors((prev) => ({ ...prev, [channel]: null }));
    try {
      const result = await generateAsset(current.brief, channel, instruction);
      dispatch({ type: "ASSET_GENERATED", channel, result });
    }  catch (error) {
      setErrors((prev) => ({ ...prev, [channel]: error instanceof ApiError ? error.message : "Something went wrong. Try again.", }));
    } finally {
      setLoading((prev) => ({ ...prev, [channel]: false }));
    }
  }

  function startOver(keepBrief: boolean) {
    setPrefill(keepBrief && campaign ? campaign.brief : null);
    setLoading({});
    setErrors({});
    dispatch({ type: "CAMPAIGN_RESET" });
  }

  const channels = campaign ? CHANNELS.filter((channel) => campaign.brief.channels.includes(channel)) : [];
  const missing = campaign ? channels.filter((channel) => !campaign.assets[channel]) : [];
  const busy = Object.values(loading).some(Boolean);
  const tracking = campaign ? buildTracking(campaign.brief, campaign.id) : [];

  return (
    <div className="app">
      <header className="masthead">
        <h1>Vertical Campaign Agent</h1>
        <p>Turn one campaign brief into coordinated, trackable marketing assets.</p>
      </header>

      <ol className="steps">
        <li>Enter the brief</li>
        <li>Review each asset</li>
        <li>Export the package</li>
      </ol>

      {health === "no-key" && (<ErrorBanner message="The server has no ANTHROPIC_API_KEY. Add it to the .env file and restart the server." /> )}
      {health === "down" && <ErrorBanner message="Cannot reach the server. Check that it is running." />}

      {!campaign ? (
        <BriefForm initial={prefill} onSubmit={(brief) => dispatch({ type: "CAMPAIGN_CREATED", campaign: newCampaign(brief) })} />
      ) : (
        <>
          <div className="toolbar">
            <button className="primary" disabled={busy || missing.length === 0} onClick={() => Promise.all(missing.map((channel) => generateChannel(campaign, channel)))}>
              {busy ? "Generating..." : missing.length === channels.length ? "Generate assets" : "Generate missing assets"}
            </button>
            <button onClick={() => { startOver(true)}}>Edit brief (starts a new campaign)</button>
            <button onClick={() => { startOver(false)}}>New blank campaign</button>
          </div>

          <CampaignPlan campaign={campaign} />

          <h2 className="section-title">Assets</h2>
          <div className="assets">
            {channels.map((channel) => (
              <AssetCard key={channel} channel={channel} asset={campaign.assets[channel]} links={tracking.filter((link) => link.channel === channel)} checks={getChecks(channel)} loading={!!loading[channel]} error={errors[channel]}
              onGenerate={(instruction) => generateChannel(campaign, channel, instruction)}
              onEdit={(content) => dispatch({ type: "ASSET_EDITED", channel, content })}
              onStatus={(to, reason, note) => dispatch({ type: "STATUS_CHANGED", channel, to, reason, note })}
              />
            ))}
          </div>

          <ExportPanel campaign={campaign} getChecks={getChecks} />
        </>
      )}

      <Footer />
    </div>
  );
}