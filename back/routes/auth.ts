import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth";
import { loginLimiter } from "../lib/limiters";
import { setEnvVar } from "../lib/envFile";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

// POST /api/auth/login — validate password, return a 24h JWT.
router.post("/login", loginLimiter, (req: Request, res: Response) => {
  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    res.status(500).json({ error: "Mot de passe administrateur non configuré." });
    return;
  }
  if (typeof password !== "string" || password !== expected) {
    res.status(401).json({ error: "Mot de passe incorrect." });
    return;
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

// POST /api/auth/logout — stateless, always 200.
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// PUT /api/auth/password — change the admin password (auth required).
router.put("/password", requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body || {};

  if (currentPassword !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Mot de passe actuel incorrect." });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    return;
  }

  setEnvVar("ADMIN_PASSWORD", newPassword);
  res.json({ ok: true });
});

export default router;
