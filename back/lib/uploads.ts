import fs from "fs";
import path from "path";

/** Absolute upload directory, from UPLOAD_DIR or ./uploads (relative to back/). */
export function uploadDir(): string {
  const dir = process.env.UPLOAD_DIR || "./uploads";
  return path.isAbsolute(dir) ? dir : path.join(__dirname, "..", dir);
}

/** Safely delete an upload file given its basename (no path traversal). */
export function deleteUploadByFilename(filename: string): void {
  const base = path.basename(filename);
  const full = path.join(uploadDir(), base);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

/** Delete a file referenced by a public "/uploads/xxx.webp" URL. Ignores external URLs. */
export function deleteUploadByUrl(url: string | undefined): void {
  if (!url) return;
  const marker = "/uploads/";
  const i = url.indexOf(marker);
  if (i === -1) return; // external (e.g. Unsplash) — nothing on our disk
  const filename = url.slice(i + marker.length);
  if (filename) deleteUploadByFilename(filename);
}
