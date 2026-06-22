import fs from "fs";
import path from "path";

/** Path of the env file currently in effect (matches index.ts's dotenv load). */
export function activeEnvPath(): string {
  const file = process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
  return path.join(__dirname, "..", file);
}

/**
 * Rewrite a single KEY=value line in the active .env file (creating it if needed)
 * and update process.env in memory. Used by the change-password endpoint.
 */
export function setEnvVar(key: string, value: string): void {
  const envPath = activeEnvPath();
  let lines: string[] = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  }
  const prefix = `${key}=`;
  let found = false;
  lines = lines.map((line) => {
    if (line.startsWith(prefix)) {
      found = true;
      return `${prefix}${value}`;
    }
    return line;
  });
  if (!found) lines.push(`${prefix}${value}`);
  fs.writeFileSync(envPath, lines.join("\n"));
  process.env[key] = value;
}
