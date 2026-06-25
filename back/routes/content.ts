import { Router, Request, Response } from "express";
import { supabase } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/content — full SiteContent (public)
router.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data?.content ?? {});
});

// PUT /api/content — partial or full update (auth)
router.put("/", requireAuth, async (req: Request, res: Response) => {
  // Fetch current content first
  const { data: current } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .single();

  const existing = current?.content ?? {};
  const incoming = req.body || {};
  // Deep-merge navLabels so a partial nav update doesn't wipe the others.
  const navLabels = { ...(existing.navLabels ?? {}), ...(incoming.navLabels ?? {}) };
  // Deep-merge typography so a partial update doesn't wipe the others.
  const typography = { ...(existing.typography ?? {}), ...(incoming.typography ?? {}) };
  const merged = { ...existing, ...incoming, navLabels, typography };

  const { data, error } = await supabase
    .from("site_content")
    .upsert({ id: 1, content: merged })
    .select("content")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data?.content ?? merged);
});

export default router;
