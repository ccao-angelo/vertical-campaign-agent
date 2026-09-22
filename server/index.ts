import "dotenv/config";
import path from "node:path";
import express from "express";

const app = express();
app.use(express.json({ limit: "50kb" }));

// The browser will call this to check that the server is running.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) });
});

const dist = path.join(import.meta.dirname, "../dist");
app.use(express.static(dist));
app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));