import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { readDb, writeDb, Db } from "../db";
import { requireAuth } from "../middleware/auth";

type CollectionKey = "projects" | "services" | "testimonials" | "faqs";

interface Entity {
  id: string;
  order?: number;
  [key: string]: unknown;
}

interface CrudOptions {
  /** Optional hook run before an item is removed (e.g. delete its images from disk). */
  onDelete?: (item: Entity) => void;
}

const sortByOrder = (a: Entity, b: Entity) => (a.order ?? 0) - (b.order ?? 0);

/**
 * Builds a CRUD + reorder router for a flat collection in db.json.
 * GET is public; POST / PUT / DELETE / reorder require a valid JWT.
 */
export function makeCrudRouter(key: CollectionKey, opts: CrudOptions = {}): Router {
  const router = Router();

  const list = (db: Db) => db[key] as unknown as Entity[];

  // GET / — public
  router.get("/", (_req: Request, res: Response) => {
    const db = readDb();
    res.json([...list(db)].sort(sortByOrder));
  });

  // POST / — create (auth)
  router.post("/", requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const items = list(db);
    const maxOrder = items.reduce((m, it) => Math.max(m, it.order ?? 0), -1);
    const item: Entity = {
      ...req.body,
      id: uuid(),
      order: typeof req.body?.order === "number" ? req.body.order : maxOrder + 1,
    };
    items.push(item);
    writeDb(db);
    res.status(201).json(item);
  });

  // PUT /reorder — reorder by id list (auth). Must be declared before /:id.
  router.put("/reorder", requireAuth, (req: Request, res: Response) => {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const db = readDb();
    const items = list(db);
    const byId = new Map(items.map((it) => [it.id, it]));
    const reordered: Entity[] = [];
    ids.forEach((id, index) => {
      const it = byId.get(id);
      if (it) {
        it.order = index;
        reordered.push(it);
        byId.delete(id);
      }
    });
    // Any items not present in `ids` keep their relative order at the end.
    let tail = reordered.length;
    [...byId.values()].sort(sortByOrder).forEach((it) => {
      it.order = tail++;
      reordered.push(it);
    });
    (db as unknown as Record<string, unknown>)[key] = reordered;
    writeDb(db);
    res.json(reordered);
  });

  // PUT /:id — update (auth)
  router.put("/:id", requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const items = list(db);
    const idx = items.findIndex((it) => it.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: "Introuvable." });
      return;
    }
    items[idx] = { ...items[idx], ...req.body, id: items[idx].id };
    writeDb(db);
    res.json(items[idx]);
  });

  // DELETE /:id — delete (auth)
  router.delete("/:id", requireAuth, (req: Request, res: Response) => {
    const db = readDb();
    const items = list(db);
    const idx = items.findIndex((it) => it.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: "Introuvable." });
      return;
    }
    const [removed] = items.splice(idx, 1);
    try {
      opts.onDelete?.(removed);
    } catch {
      /* image cleanup is best-effort */
    }
    writeDb(db);
    res.json({ ok: true });
  });

  return router;
}
