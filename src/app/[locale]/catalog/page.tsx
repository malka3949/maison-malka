import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogProductCard } from "@/components/storefront/CatalogProductCard";
import { getActiveCategories, getAvailableProducts } from "@/lib/catalog";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { getProductImagePublicUrl } from "@/lib/storefront";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: localeParam } = await params;
  const { category } = await searchParams;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = getMessages(locale);
  const [categories, products] = await Promise.all([
    getActiveCategories(locale),
    getAvailableProducts(locale, category || undefined),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mm-wrap space-y-8 pt-10 pb-6">
      <div className="border-b border-mm-line pb-6">
        <p className="mm-section-label italic">{messages.promoCatalogLabel}</p>
        <h1 className="mt-2 text-3xl font-bold text-mm-primary md:text-4xl">
          {activeCategory ? activeCategory.name : messages.catalogTitle}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-mm-secondary">
          {messages.catalogSubtitle}
        </p>
      </div>

      <nav className="mm-catalog-filters" aria-label={messages.catalogTitle}>
        <Link
          href={`/${locale}/catalog`}
          className={`mm-catalog-filter cursor-pointer ${!category ? "is-active" : ""}`}
        >
          {messages.filterAll}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/${locale}/catalog?category=${c.slug}`}
            className={`mm-catalog-filter cursor-pointer ${
              category === c.slug ? "is-active" : ""
            }`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="py-16 text-center text-mm-secondary">{messages.emptyCatalog}</p>
      ) : (
        <div className="mm-catalog-grid">
          {products.map((p) => (
            <CatalogProductCard
              key={p.id}
              locale={locale}
              productId={p.id}
              name={p.name}
              categoryName={p.categoryName}
              basePrice={p.basePrice}
              imageUrl={p.imagePath ? getProductImagePublicUrl(p.imagePath) : null}
              brand={messages.brand}
              priceFrom={messages.priceFrom}
              ils={messages.ils}
              inCartLabel={messages.inCart}
              addToCartLabel={messages.addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
