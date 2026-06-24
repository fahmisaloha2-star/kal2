import { Router, Request, Response } from "express";
import { supabase } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

type TableName = "projects" | "services" | "testimonials" | "faqs";

interface CrudOptions {
  onDelete?: (item: Record<string, unknown>) => Promise<void> | void;
}

export function makeCrudRouter(table: TableName, opts: CrudOptions = {}): Router {
  const r = Router();

  // GET / — public, returns all rows sorted by order
  r.get("/", async (_req: Request, res: Response) => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // POST / — create (auth)
  r.post("/", requireAuth, async (req: Request, res: Response) => {
    const body = req.body || {};
    // Get max order
    const { data: existing } = await supabase.from(table).select("order").order("order", { ascending: false }).limit(1);
    const maxOrder = existing?.[0]?.order ?? -1;
    const newItem = { ...body, order: typeof body.order === "number" ? body.order : maxOrder + 1 };
    delete newItem.id; // let Supabase generate UUID

    const { data, error } = await supabase.from(table).insert(newItem).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  });

  // PUT /reorder — bulk reorder (auth)
  r.put("/reorder", requireAuth, async (req: Request, res: Response) => {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const updates = ids.map((id, index) =>
      supabase.from(table).update({ order: index }).eq("id", id)
    );
    await Promise.all(updates);
    const { data, error } = await supabase.from(table).select("*").order("order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // PUT /:id — update (auth)
  r.put("/:id", requireAuth, async (req: Request, res: Response) => {
    const body = { ...req.body };
    delete body.id;
    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // DELETE /:id — delete (auth)
  r.delete("/:id", requireAuth, async (req: Request, res: Response) => {
    const { data: item } = await supabase.from(table).select("*").eq("id", req.params.id).single();
    if (item && opts.onDelete) {
      try { await opts.onDelete(item); } catch { /* best effort */ }
    }
    const { error } = await supabase.from(table).delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  });

  return r;
}
