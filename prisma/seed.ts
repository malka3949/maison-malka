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
            description: "עוגת שוקולד עשירה",
          },
          {
            locale: Locale.en,
            name: "Chocolate Cake",
            description: "Rich chocolate cake",
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
          { locale: Locale.he, name: "קרואסון חמאה", description: "קרואסון פריך" },
          { locale: Locale.en, name: "Butter Croissant", description: "Flaky croissant" },
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
          { locale: Locale.he, name: "פיינן שוקולד", description: "מאפה שוקולד" },
          { locale: Locale.en, name: "Chocolate Pain", description: "Chocolate pastry" },
        ],
      },
    },
  });

  const weekendBundle = await prisma.product.create({
    data: {
      category_id: pastries.id,
      product_type: ProductType.bundle,
      base_price: 130,
      is_available: true,
      sort_order: 3,
      translations: {
        create: [
          { locale: Locale.he, name: "מארז סוף שבוע", description: "מארז קבוע" },
          { locale: Locale.en, name: "Weekend Bundle", description: "Fixed bundle" },
        ],
      },
      bundle_items: {
        create: [
          { item_product_id: chocolateCake.id, quantity: 1 },
          { item_product_id: croissant.id, quantity: 4 },
        ],
      },
    },
  });

  console.log("Seed complete:", {
    categories: [cakes.slug, pastries.slug],
    products: [chocolateCake.id, croissant.id, weekendBundle.id],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
