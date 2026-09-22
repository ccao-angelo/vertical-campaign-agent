import type { AnyContent, Brief, Channel, Fact, RejectionReason, Status } from "../../shared/schema";

// Information about one generated asset
export type AssetMeta = {
  status: Status;
  rejectionReason: RejectionReason | null;
  reviewerNote: string | null;
  edited: boolean;
  generatedAt: string;
  updatedAt: string;
  model: string;
  promptVersion: string;
};

export type Asset = { content: AnyContent; meta: AssetMeta };

export type Campaign = {
  id: string;
  createdAt: string;
  brief: Brief;
  facts: Fact[];
  assets: Partial<Record<Channel, Asset>>;
};

// Information the server sends back after generating one asset
export type GenerateResult = {
  channel: Channel;
  content: AnyContent;
  meta: { model: string; promptVersion: string; generatedAt: string };
};