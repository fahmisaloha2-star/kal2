import path from "path";
import dotenv from "dotenv";

// Load .env.local (dev) first, then fall back to .env for anything unset.
dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { contactLimiter } from "./lib/limiters";
import { uploadDir } from "./lib/uploads";

import authRoutes from "./routes/auth";
import projectsRoutes from "./routes/projects";
import servicesRoutes from "./routes/services";
import testimonialsRoutes from "./routes/testimonials";
import faqsRoutes from "./routes/faqs";
import contentRoutes from "./routes/content";
import uploadRoutes from "./routes/upload";
import contactRoutes from "./routes/contact";
import sitemapRoutes from "./routes/sitemap";
import robotsRoutes from "./routes/robots";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// ── Security ──────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow <img> from front origin
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

// ── Static uploads ──────────────────────────────────────────────────────────
app.use("/uploads", express.static(uploadDir()));

// ── Health ────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes); // loginLimiter applied inside on /login
app.use("/api/projects", projectsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/faqs", faqsRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/sitemap.xml", sitemapRoutes);
app.use("/robots.txt", robotsRoutes);

// ── Error handler (multer / CORS / etc.) ────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: err.message || "Requête invalide." });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
