import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const text = readFileSync(".env.local", "utf8");
for (const line of text.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env[m[1]] = v;
}

if (!process.env.DATABASE_URL) {
  console.error("FAIL: DATABASE_URL missing in .env.local");
  process.exit(1);
}

const r = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  env: process.env,
  encoding: "utf8",
  shell: true,
});
const scrub = (s) => (s || "").replace(/postgresql:\/\/[^\s]+/gi, "[db-url]");
process.stdout.write(scrub(r.stdout));
process.stderr.write(scrub(r.stderr));
process.exit(r.status ?? 1);
