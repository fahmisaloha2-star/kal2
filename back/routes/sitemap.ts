import { Router, Request, Response } from "express";

const router = Router();

// GET /sitemap.xml — generated dynamically; lastmod is always today.
router.get("/", (_req: Request, res: Response) => {
  const base = (process.env.PUBLIC_URL || "http://localhost:5173").replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/#about", priority: "0.8" },
    { loc: "/#services", priority: "0.8" },
    { loc: "/#portfolio", priority: "0.9" },
    { loc: "/#contact", priority: "0.7" },
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${base}${u.loc}</loc><priority>${u.priority}</priority><lastmod>${today}</lastmod></url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  res.header("Content-Type", "application/xml").send(body);
});

export default router;
