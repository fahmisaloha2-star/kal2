import { Router, Request, Response } from "express";
import { readDb, writeDb } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/content — full SiteContent (public)
router.get("/", (_req: Request, res: Response) => {
  const db = readDb();
  res.json(db.content);
});

// PUT /api/content — partial or full update (auth)
router.put("/", requireAuth, (req: Request, res: Response) => {
  const db = readDb();
  const incoming = req.body || {};
  // Deep-merge navLabels so a partial nav update doesn't wipe the others.
  const navLabels = { ...db.content.navLabels, ...(incoming.navLabels || {}) };
  db.content = { ...db.content, ...incoming, navLabels };
  writeDb(db);
  res.json(db.content);
});

export default router;
