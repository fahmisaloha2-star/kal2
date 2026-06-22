import fs from "fs";
import path from "path";
import type { Project, Service, Testimonial, FaqItem, SiteContent } from "./types";
import { seed } from "./scripts/seed";

const DB_PATH = path.join(__dirname, "./data/db.json");

export interface Db {
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  content: SiteContent;
}

export function readDb(): Db {
  if (!fs.existsSync(DB_PATH)) {
    // Auto-seed on first run.
    seed();
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")) as Db;
}

export function writeDb(data: Db): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
