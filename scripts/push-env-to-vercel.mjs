/**
 * One-shot: push selected keys from .env.local to Vercel (no values logged).
 * Usage: node scripts/push-env-to-vercel.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const envPath = resolve(ROOT, ".env.local");
if (!existsSync(envPath)) {
  console.error("FAIL: .env.local missing");
  process.exit(1);
}

const KEYS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAIL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_DEV_TO",
  "NEXT_PUBLIC_APP_URL",
  "GEMINI_API_KEY",
].filter((k) => {
  const only = process.argv[2];
  return !only || only === k;
});

const PREVIEW_APP_URL =
  "https://maison-malka-git-develop-malkasdevelop.vercel.app";

function parseEnv(text) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = parseEnv(readFileSync(envPath, "utf8"));
env.NEXT_PUBLIC_APP_URL = PREVIEW_APP_URL;

let ok = 0;
let skipped = 0;
let failed = 0;

for (const key of KEYS) {
  const value = env[key];
  if (value === undefined || value === "") {
    console.log(`SKIP ${key} (empty/missing)`);
    skipped++;
    continue;
  }

  const sensitive = ![
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_APP_URL",
    "ADMIN_EMAIL",
    "RESEND_FROM_EMAIL",
  ].includes(key);

  const args = [
    "vercel",
    "env",
    "add",
    key,
    "production,preview",
    "--value",
    value,
    "--yes",
    "--force",
    "--scope",
    "malkasdevelop",
    "--project",
    "maison-malka",
  ];
  if (sensitive) args.push("--sensitive");
  else args.push("--no-sensitive");

  const r = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["--yes", ...args],
    {
      cwd: ROOT,
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    },
  );

  if (r.status === 0) {
    console.log(`OK ${key}`);
    ok++;
  } else {
    console.log(`FAIL ${key}`);
    const err = `${r.stderr || ""}\n${r.stdout || ""}`.trim();
    // Never print values; only status snippets without the --value payload
    console.log(
      err
        .split(/\r?\n/)
        .filter((l) => !l.includes(value) && !l.includes("--value"))
        .slice(0, 8)
        .join("\n") || `(exit ${r.status})`,
    );
    failed++;
  }
}

console.log(`Done. ok=${ok} skipped=${skipped} failed=${failed}`);
process.exit(failed > 0 ? 1 : 0);
