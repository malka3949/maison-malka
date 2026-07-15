import { PrismaClient, Locale, ProductType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.bundleItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();

  const cakes = await prisma.category.create({
    data: {
      slug: "cakes",
      sort_order: 1,
      is_active: true,
      translations: {
        create: [
          { locale: Locale.he, name: "עוגות" },
          { locale: Locale.en, name: "Cakes" },
        ],
      },
    },
  });

  const pastries = await prisma.category.create({
    data: {
      slug: "pastries",
      sort_order: 2,
      is_active: true,
      translations: {
        create: [
          { locale: Locale.he, name: "מאפים" },
          { locale: Locale.en, name: "Pastries" },
        ],
      },
    },
  });

  const desserts = await prisma.category.create({
    data: {
      slug: "desserts",
      sort_order: 3,
      is_active: true,
      translations: {
        create: [
          { locale: Locale.he, name: "קינוחים" },
          { locale: Locale.en, name: "Desserts" },
        ],
      },
    },
  });

  const boxes = await prisma.category.create({
    data: {
      slug: "boxes",
      sort_order: 4,
      is_active: true,
      translations: {
        create: [
          { locale: Locale.he, name: "מארזים" },
          { locale: Locale.en, name: "Gift boxes" },
        ],
      },
    },
  });

  const celebrations = await prisma.category.create({
    data: {
      slug: "celebrations",
      sort_order: 5,
      is_active: true,
      translations: {
        create: [
          { locale: Locale.he, name: "חגיגות" },
          { locale: Locale.en, name: "Celebrations" },
        ],
      },
    },
  });

  const chocolateCake = await prisma.product.create({
    data: {
      category_id: cakes.id,
      product_type: ProductType.standard,
      base_price: 120,
      is_available: true,
      sort_order: 1,
      translations: {
        create: [
          {
            locale: Locale.he,
            name: "עוגת שוקולד",
            description: "עוגת שוקולד עשירה ועדינה",
          },
          {
            locale: Locale.en,
            name: "Chocolate Cake",
            description: "Rich, soft chocolate cake",
          },
        ],
      },
      options: {
        create: [
          {
            name_key: "size",
            is_required: true,
            sort_order: 0,
            values: {
              create: [
                { label_key: "small", price_delta: 0, is_default: true },
                { label_key: "large", price_delta: 30, is_default: false },
              ],
            },
          },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/cake.jpg",
            alt_text: "Chocolate cake",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: cakes.id,
      product_type: ProductType.standard,
      base_price: 110,
      is_available: true,
      sort_order: 2,
      translations: {
        create: [
          {
            locale: Locale.he,
            name: "עוגת גבינה אפויה",
            description: "מרקם קרמי ועדין, בסיס ביסקוויט",
          },
          {
            locale: Locale.en,
            name: "Baked Cheesecake",
            description: "Creamy baked cheesecake on a biscuit base",
          },
        ],
      },
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
      images: {
        create: [
          {
            storage_path: "/placeholders/cheesecake.jpg",
            alt_text: "Cheesecake",
            sort_order: 0,
          },
        ],
      },
    },
  });

  const croissant = await prisma.product.create({
    data: {
      category_id: pastries.id,
      product_type: ProductType.standard,
      base_price: 18,
      is_available: true,
      sort_order: 1,
      translations: {
        create: [
          { locale: Locale.he, name: "קרואסון חמאה", description: "קרואסון פריך ועדין" },
          { locale: Locale.en, name: "Butter Croissant", description: "Flaky butter croissant" },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/croissant.jpg",
            alt_text: "Butter croissant",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: pastries.id,
      product_type: ProductType.standard,
      base_price: 22,
      is_available: true,
      sort_order: 2,
      translations: {
        create: [
          { locale: Locale.he, name: "פיינן שוקולד", description: "מאפה שוקולד רך" },
          { locale: Locale.en, name: "Chocolate Pain", description: "Soft chocolate pastry" },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/pastry.jpg",
            alt_text: "Chocolate pastry",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: pastries.id,
      product_type: ProductType.standard,
      base_price: 24,
      is_available: true,
      sort_order: 4,
      translations: {
        create: [
          { locale: Locale.he, name: "בריוש חמאה", description: "מאפה אוורירי וחם מהתנור" },
          { locale: Locale.en, name: "Butter Brioche", description: "Airy brioche, bakery-fresh" },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/brioche.jpg",
            alt_text: "Brioche",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: pastries.id,
      product_type: ProductType.standard,
      base_price: 32,
      is_available: true,
      sort_order: 5,
      translations: {
        create: [
          { locale: Locale.he, name: "לחמניות קינמון", description: "רכות, ריחניות ומתוקות בעדינות" },
          { locale: Locale.en, name: "Cinnamon Rolls", description: "Soft, fragrant cinnamon rolls" },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/cinnamon.jpg",
            alt_text: "Cinnamon rolls",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: desserts.id,
      product_type: ProductType.standard,
      base_price: 95,
      is_available: true,
      sort_order: 1,
      translations: {
        create: [
          {
            locale: Locale.he,
            name: "טארט פירות עדין",
            description: "בצק חמאה רך עם קרם וניל ופירות העונה",
          },
          {
            locale: Locale.en,
            name: "Soft Fruit Tart",
            description: "Buttery shell with vanilla cream and seasonal fruit",
          },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/tart.jpg",
            alt_text: "Fruit tart",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: desserts.id,
      product_type: ProductType.standard,
      base_price: 48,
      is_available: true,
      sort_order: 2,
      translations: {
        create: [
          { locale: Locale.he, name: "עוגיות חמאה", description: "עוגיות רכות בקופסה קטנה" },
          { locale: Locale.en, name: "Butter Cookies", description: "Soft butter cookies in a small tin" },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/cookies.jpg",
            alt_text: "Butter cookies",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: desserts.id,
      product_type: ProductType.standard,
      base_price: 28,
      is_available: true,
      sort_order: 3,
      translations: {
        create: [
          {
            locale: Locale.he,
            name: "אקלר וניל",
            description: "בצק רך, קרם וניל עדין וזיגוג בהיר",
          },
          {
            locale: Locale.en,
            name: "Vanilla Eclair",
            description: "Soft choux, delicate vanilla cream, light glaze",
          },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/eclair.jpg",
            alt_text: "Vanilla eclair",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: boxes.id,
      product_type: ProductType.standard,
      base_price: 160,
      is_available: true,
      sort_order: 1,
      translations: {
        create: [
          {
            locale: Locale.he,
            name: "מארז מתנה קלאסי",
            description: "מבחר מאפים מתוקים באריזה מוכנה למתנה",
          },
          {
            locale: Locale.en,
            name: "Classic Gift Box",
            description: "A curated sweet pastry selection, gift-ready",
          },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/giftbox.jpg",
            alt_text: "Gift box of pastries",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: boxes.id,
      product_type: ProductType.bundle,
      base_price: 130,
      is_available: true,
      sort_order: 2,
      translations: {
        create: [
          { locale: Locale.he, name: "מארז סוף שבוע", description: "מארז קבוע לשבת ולחגים" },
          { locale: Locale.en, name: "Weekend Bundle", description: "Fixed weekend bundle" },
        ],
      },
      bundle_items: {
        create: [
          { item_product_id: chocolateCake.id, quantity: 1 },
          { item_product_id: croissant.id, quantity: 4 },
        ],
      },
      images: {
        create: [
          {
            storage_path: "/placeholders/assortment.jpg",
            alt_text: "Pastry assortment",
            sort_order: 0,
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      category_id: celebrations.id,
      product_type: ProductType.standard,
      base_price: 180,
      is_available: true,
      sort_order: 1,
      translations: {
        create: [
          {
            locale: Locale.he,
            name: "עוגת חגיגה בקרם",
            description: "עוגה בהירה לחגיגות — עיצוב עדין",
          },
          {
            locale: Locale.en,
            name: "Celebration Cream Cake",
            description: "Light celebration cake with soft cream finish",
          },
        ],
      },
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
      images: {
        create: [
          {
            storage_path: "/placeholders/celebration.jpg",
            alt_text: "Celebration cake",
            sort_order: 0,
          },
        ],
      },
    },
  });

  console.log("Seed complete with expanded catalog");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
