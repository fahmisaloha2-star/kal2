import express from "express";
import cors from "cors";
import helmet from "helmet";

import { contactLimiter } from "../lib/limiters";
import authRoutes from "../routes/auth";
import projectsRoutes from "../routes/projects";
import servicesRoutes from "../routes/services";
import testimonialsRoutes from "../routes/testimonials";
import faqsRoutes from "../routes/faqs";
import contentRoutes from "../routes/content";
import contactRoutes from "../routes/contact";
import sitemapRoutes from "../routes/sitemap";
import robotsRoutes from "../routes/robots";

const app = express();

// ── Security ──────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.disable("x-powered-by");

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:4000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// ── Health ────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/faqs", faqsRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/sitemap.xml", sitemapRoutes);
app.use("/robots.txt", robotsRoutes);

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: err.message || "Requête invalide." });
});

export default app;
