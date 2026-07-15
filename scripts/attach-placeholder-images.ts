import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const prisma = new PrismaClient();

/** Soft bakery placeholders under public/placeholders (temporary until business assets). */
const BY_HEBREW_NAME: Record<string, { path: string; alt: string }> = {
  "עוגת שוקולד": { path: "/placeholders/cake.jpg", alt: "Chocolate cake" },
  "קרואסון חמאה": { path: "/placeholders/croissant.jpg", alt: "Butter croissant" },
  "פיינן שוקולד": { path: "/placeholders/pastry.jpg", alt: "Chocolate pastry" },
  "מארז סוף שבוע": { path: "/placeholders/assortment.jpg", alt: "Pastry assortment" },
};

async function main() {
  const products = await prisma.product.findMany({
    include: { translations: true, images: true },
  });

  for (const product of products) {
    const heName = product.translations.find((t) => t.locale === "he")?.name;
    const mapping = heName ? BY_HEBREW_NAME[heName] : undefined;
    if (!mapping) {
      console.log("skip (no mapping):", heName ?? product.id);
      continue;
    }

    await prisma.productImage.deleteMany({ where: { product_id: product.id } });
    await prisma.productImage.create({
      data: {
        product_id: product.id,
        storage_path: mapping.path,
        alt_text: mapping.alt,
        sort_order: 0,
      },
    });
    console.log("image set:", heName, "→", mapping.path);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
