import "dotenv/config";
import path from "node:path";
import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { BriefSchema, CHANNELS } from "../shared/schema";
import { generateAsset } from "./lib/generate";
import { AppError, sendError } from "./lib/errors";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50kb" }));
app.get("/api/health", (req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

// Limited 40 requests per hour per visitor
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: "RATE_LIMITED", message: "Too many requests. Please wait a few minutes." } },
  }),
);

const GeneratedBody = z.object({
  brief: BriefSchema,
  channel: z.enum(CHANNELS),
  instruction: z.string().max(400).optional(),
});

app.post("/api/assets/generate", async (req, res) => {
  const parsed = GeneratedBody.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return sendError(res, new AppError("VALIDATION", 400, message));
  }
  try {
    res.json(await generateAsset(parsed.data));
  } catch (error) {
    sendError(res, error);
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown endpoint."} });
});

const dist = path.join(import.meta.dirname, "../dist");
app.use(express.static(dist));
app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));