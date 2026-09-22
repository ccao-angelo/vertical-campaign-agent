import { useState } from "react";
import type { Brief } from "../../shared/schema";
import BriefForm from "./components/BriefForm";
import CampaignPlan from "./components/CampaignPlan";
import Footer from "./components/Footer";
import { newCampaign } from "./lib/newCampaign";
import type { Campaign } from "./types";

export default function App() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prefill, setPrefill] = useState<Brief | null>(null);

  return (
    <div className="app">
      <header className="masthead">
        <h1>Vertical Campaign Agent</h1>
        <p>Turn one campaign brief into coordinated, trackable marketing assets.</p>
      </header>

      {!campaign ? (
        <BriefForm initial={prefill} onSubmit={(brief) => setCampaign(newCampaign(brief))} />
      ) : (
        <>
          <div className="toolbar">
            <button onClick={() => { setPrefill(campaign.brief); setCampaign(null); }}>
              Edit brief (starts a new campaign)
            </button>
            <button onClick={() => { setPrefill(null); setCampaign(null); }}>New blank campaign</button>
          </div>
          <CampaignPlan campaign={campaign} />
        </>
      )}

      <Footer />
    </div>
  );
}