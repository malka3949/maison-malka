/**
 * One-shot: copy existing Supabase product images into public/uploads
 * so the catalog can serve them as same-origin static files (NetFree-friendly).
 *
 * Usage: npx tsx scripts/sync-product-images-local.ts
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { writeLocalProductImage } from "../src/lib/local-product-images";

const BUCKET = "product-images";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const prisma = new PrismaClient();
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const images = await prisma.productImage.findMany({
    select: { storage_path: true },
  });

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const image of images) {
    const path = image.storage_path;
    if (!path || path.startsWith("/") || path.startsWith("http")) {
      skip += 1;
      continue;
    }

    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error || !data) {
      console.warn("FAIL", path, error?.message);
      fail += 1;
      continue;
    }

    const buf = Buffer.from(await data.arrayBuffer());
    await writeLocalProductImage(path, buf);
    console.log("OK", path, `${(buf.length / 1024).toFixed(0)}KB`);
    ok += 1;
  }

  console.log({ ok, skip, fail, total: images.length });
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
