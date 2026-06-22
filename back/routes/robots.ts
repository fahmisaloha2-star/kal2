import { Router, Request, Response } from "express";

const router = Router();

// GET /robots.txt — references the dynamic sitemap; admin is disallowed.
router.get("/", (_req: Request, res: Response) => {
  const base = (process.env.PUBLIC_URL || "http://localhost:5173").replace(/\/$/, "");
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${base}/sitemap.xml`,
    "",
    "User-agent: *",
    "Disallow: /admin/",
    "",
  ].join("\n");
  res.header("Content-Type", "text/plain").send(body);
});

export default router;
