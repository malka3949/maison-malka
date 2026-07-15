import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { PrismaClient, Locale, ProductType } from "@prisma/client";

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
const PLACEHOLDER_DIR = resolve(process.cwd(), "public/placeholders");

const IMAGE_FILES: { file: string; url: string }[] = [
  {
    file: "tart.jpg",
    url: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=1400&q=80",
  },
  {
    file: "cheesecake.jpg",
    url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1400&q=80",
  },
  {
    file: "cookies.jpg",
    url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    file: "celebration.jpg",
    url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    file: "brioche.jpg",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80",
  },
  {
    file: "eclair.jpg",
    url: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    file: "giftbox.jpg",
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
  },
  {
    file: "cinnamon.jpg",
    url: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=1400&q=80",
  },
];

async function downloadMissingImages() {
  mkdirSync(PLACEHOLDER_DIR, { recursive: true });
  for (const img of IMAGE_FILES) {
    const dest = resolve(PLACEHOLDER_DIR, img.file);
    if (existsSync(dest)) {
      console.log("skip download", img.file);
      continue;
    }
    const res = await fetch(img.url);
    if (!res.ok) {
      console.warn("download failed", img.file, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    console.log("downloaded", img.file);
  }
}

async function ensureCategory(slug: string, sort: number, he: string, en: string) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.category.create({
    data: {
      slug,
      sort_order: sort,
      is_active: true,
      translations: {
        create: [
          { locale: Locale.he, name: he },
          { locale: Locale.en, name: en },
        ],
      },
    },
  });
}

async function productExistsByHeName(name: string) {
  const found = await prisma.productTranslation.findFirst({
    where: { locale: Locale.he, name },
  });
  return Boolean(found);
}

type NewProduct = {
  heName: string;
  enName: string;
  heDesc: string;
  enDesc: string;
  categorySlug: string;
  price: number;
  sort: number;
  image: string;
  alt: string;
  withSizeOption?: boolean;
};

const NEW_PRODUCTS: NewProduct[] = [
  {
    heName: "טארט פירות עדין",
    enName: "Soft Fruit Tart",
    heDesc: "בצק חמאה רך עם קרם וניל ופירות העונה",
    enDesc: "Buttery shell with vanilla cream and seasonal fruit",
    categorySlug: "desserts",
    price: 95,
    sort: 1,
    image: "/placeholders/tart.jpg",
    alt: "Fruit tart",
  },
  {
    heName: "עוגת גבינה אפויה",
    enName: "Baked Cheesecake",
    heDesc: "מרקם קרמי ועדין, בסיס ביסקוויט",
    enDesc: "Creamy baked cheesecake on a biscuit base",
    categorySlug: "cakes",
    price: 110,
    sort: 2,
    image: "/placeholders/cheesecake.jpg",
    alt: "Cheesecake",
    withSizeOption: true,
  },
  {
    heName: "עוגיות חמאה",
    enName: "Butter Cookies",
    heDesc: "עוגיות רכות בקופסה קטנה",
    enDesc: "Soft butter cookies in a small tin",
    categorySlug: "desserts",
    price: 48,
    sort: 2,
    image: "/placeholders/cookies.jpg",
    alt: "Butter cookies",
  },
  {
    heName: "עוגת חגיגה בקרם",
    enName: "Celebration Cream Cake",
    heDesc: "עוגה בהירה לחגיגות — עיצוב עדין",
    enDesc: "Light celebration cake with soft cream finish",
    categorySlug: "celebrations",
    price: 180,
    sort: 1,
    image: "/placeholders/celebration.jpg",
    alt: "Celebration cake",
    withSizeOption: true,
  },
  {
    heName: "בריוש חמאה",
    enName: "Butter Brioche",
    heDesc: "מאפה אוורירי וחם מהתנור",
    enDesc: "Airy brioche, bakery-fresh",
    categorySlug: "pastries",
    price: 24,
    sort: 4,
    image: "/placeholders/brioche.jpg",
    alt: "Brioche",
  },
  {
    heName: "אקלר וניל",
    enName: "Vanilla Eclair",
    heDesc: "בצק רך, קרם וניל עדין וזיגוג בהיר",
    enDesc: "Soft choux, delicate vanilla cream, light glaze",
    categorySlug: "desserts",
    price: 28,
    sort: 3,
    image: "/placeholders/eclair.jpg",
    alt: "Vanilla eclair",
  },
  {
    heName: "מארז מתנה קלאסי",
    enName: "Classic Gift Box",
    heDesc: "מבחר מאפים מתוקים באריזה מוכנה למתנה",
    enDesc: "A curated sweet pastry selection, gift-ready",
    categorySlug: "boxes",
    price: 160,
    sort: 1,
    image: "/placeholders/giftbox.jpg",
    alt: "Gift box of pastries",
  },
  {
    heName: "לחמניות קינמון",
    enName: "Cinnamon Rolls",
    heDesc: "רכות, ריחניות ומתוקות בעדינות",
    enDesc: "Soft, fragrant cinnamon rolls",
    categorySlug: "pastries",
    price: 32,
    sort: 5,
    image: "/placeholders/cinnamon.jpg",
    alt: "Cinnamon rolls",
  },
];

async function main() {
  await downloadMissingImages();

  const cakes = await ensureCategory("cakes", 1, "עוגות", "Cakes");
  const pastries = await ensureCategory("pastries", 2, "מאפים", "Pastries");
  const desserts = await ensureCategory("desserts", 3, "קינוחים", "Desserts");
  const boxes = await ensureCategory("boxes", 4, "מארזים", "Gift boxes");
  const celebrations = await ensureCategory("celebrations", 5, "חגיגות", "Celebrations");

  const bySlug: Record<string, string> = {
    cakes: cakes.id,
    pastries: pastries.id,
    desserts: desserts.id,
    boxes: boxes.id,
    celebrations: celebrations.id,
  };

  for (const item of NEW_PRODUCTS) {
    if (await productExistsByHeName(item.heName)) {
      console.log("exists:", item.heName);
      continue;
    }
    const category_id = bySlug[item.categorySlug];
    if (!category_id) throw new Error(`missing category ${item.categorySlug}`);

    await prisma.product.create({
      data: {
        category_id,
        product_type: ProductType.standard,
        base_price: item.price,
        is_available: true,
        sort_order: item.sort,
        translations: {
          create: [
            { locale: Locale.he, name: item.heName, description: item.heDesc },
            { locale: Locale.en, name: item.enName, description: item.enDesc },
          ],
        },
        images: {
          create: [
            {
              storage_path: item.image,
              alt_text: item.alt,
              sort_order: 0,
            },
          ],
        },
        ...(item.withSizeOption
          ? {
              options: {
                create: [
                  {
                    name_key: "size",
                    is_required: true,
                    sort_order: 0,
                    values: {
                      create: [
                        { label_key: "small", price_delta: 0, is_default: true },
                        { label_key: "large", price_delta: 35, is_default: false },
                      ],
                    },
                  },
                ],
              },
            }
          : {}),
      },
    });
    console.log("created:", item.heName);
  }

  // Move weekend bundle into boxes category if still under pastries
  const weekend = await prisma.productTranslation.findFirst({
    where: { locale: Locale.he, name: "מארז סוף שבוע" },
    include: { product: true },
  });
  if (weekend && weekend.product.category_id !== boxes.id) {
    await prisma.product.update({
      where: { id: weekend.product_id },
      data: { category_id: boxes.id, sort_order: 2 },
    });
    console.log("moved weekend bundle → boxes");
  }

  const count = await prisma.product.count();
  const cats = await prisma.category.count();
  console.log(`Done. categories=${cats} products=${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
