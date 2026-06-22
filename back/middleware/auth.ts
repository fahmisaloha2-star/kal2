import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

export interface AuthedRequest extends Request {
  auth?: { role: string };
}

/**
 * Verifies `Authorization: Bearer <token>`. Returns 401 if missing or invalid.
 * The password is never stored or checked client-side — only this JWT is trusted.
 */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    res.status(401).json({ error: "Non autorisé." });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role?: string };
    req.auth = { role: payload.role || "admin" };
    next();
  } catch {
    res.status(401).json({ error: "Session invalide ou expirée." });
  }
}
