import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveCategories, getAvailableProducts } from "@/lib/catalog";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { formatIls, getProductImagePublicUrl } from "@/lib/storefront";

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

  return (
    <div className="mm-wrap space-y-8">
      <div>
        <h1 className="font-heading text-4xl text-mm-primary md:text-5xl">
          {messages.catalogTitle}
        </h1>
        <p className="mt-2 text-mm-secondary">{messages.catalogSubtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${locale}/catalog`}
          className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors ${
            !category
              ? "border-mm-dark bg-mm-dark text-white"
              : "border-mm-line bg-mm-surface text-mm-secondary hover:border-mm-cta hover:text-mm-primary"
          }`}
        >
          {messages.filterAll}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/${locale}/catalog?category=${c.slug}`}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors ${
              category === c.slug
                ? "border-mm-dark bg-mm-dark text-white"
                : "border-mm-line bg-mm-surface text-mm-secondary hover:border-mm-cta hover:text-mm-primary"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-mm-secondary">{messages.emptyCatalog}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const img = p.imagePath ? getProductImagePublicUrl(p.imagePath) : null;
            return (
              <Link
                key={p.id}
                href={`/${locale}/products/${p.id}`}
                className="group cursor-pointer space-y-3"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-mm-soft">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-mm-secondary">
                      {messages.brand}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-mm-secondary">
                    {p.categoryName}
                  </p>
                  <h2 className="font-heading text-2xl text-mm-primary">{p.name}</h2>
                  <p className="text-mm-cta">
                    {messages.priceFrom}
                    {formatIls(p.basePrice, messages.ils)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
