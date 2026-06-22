import fs from "fs";
import path from "path";
import { Router, Request, Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { requireAuth } from "../middleware/auth";
import { uploadDir, deleteUploadByFilename } from "../lib/uploads";

const router = Router();

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Format non supporté (jpeg, png ou webp uniquement)."));
  },
});

// POST /api/upload — upload + process one image (auth).
router.post("/", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Aucune image reçue." });
      return;
    }
    const dir = uploadDir();
    fs.mkdirSync(dir, { recursive: true });

    const id = uuid();
    const name = `${id}.webp`;
    const thumbName = `${id}_thumb.webp`;

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(dir, name));

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toFile(path.join(dir, thumbName));

    res.json({ url: `/uploads/${name}`, thumbUrl: `/uploads/${thumbName}` });
  } catch (err) {
    res.status(500).json({ error: "Échec du traitement de l'image." });
  }
});

// DELETE /api/upload/:filename — remove a file (and its thumbnail) from disk (auth).
router.delete("/:filename", requireAuth, (req: Request, res: Response) => {
  try {
    const filename = path.basename(req.params.filename);
    deleteUploadByFilename(filename);
    // Also remove the matching thumbnail if a main image was deleted.
    if (filename.endsWith(".webp") && !filename.endsWith("_thumb.webp")) {
      deleteUploadByFilename(filename.replace(/\.webp$/, "_thumb.webp"));
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Échec de la suppression." });
  }
});

export default router;
