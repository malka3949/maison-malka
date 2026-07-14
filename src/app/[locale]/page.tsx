import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveCategories, getAvailableProducts } from "@/lib/catalog";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { formatIls, getProductImagePublicUrl } from "@/lib/storefront";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = getMessages(locale);
  const [categories, products] = await Promise.all([
    getActiveCategories(locale),
    getAvailableProducts(locale),
  ]);
  const featured = products.slice(0, 4);

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-sm bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 px-6 py-20 text-stone-50 md:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.25),_transparent_55%)]" />
        <div className="relative max-w-xl space-y-4">
          <h1 className="font-heading text-5xl font-semibold tracking-wide md:text-6xl">
            {messages.heroTitle}
          </h1>
          <p className="text-lg text-stone-200">{messages.heroSubtitle}</p>
          <Link
            href={`/${locale}/catalog`}
            className="inline-block cursor-pointer rounded-sm bg-mm-cta px-6 py-3 text-white transition-colors hover:bg-mm-cta-hover"
          >
            {messages.heroCta}
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-3xl text-mm-primary">{messages.categoriesTitle}</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/catalog?category=${c.slug}`}
              className="cursor-pointer border border-stone-300 px-4 py-2 text-mm-secondary transition-colors hover:border-mm-cta hover:text-mm-cta"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-3xl text-mm-primary">{messages.featuredTitle}</h2>
        {featured.length === 0 ? (
          <p className="text-mm-secondary">{messages.emptyCatalog}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => {
              const img = p.imagePath ? getProductImagePublicUrl(p.imagePath) : null;
              return (
                <Link
                  key={p.id}
                  href={`/${locale}/products/${p.id}`}
                  className="group cursor-pointer space-y-3 transition-opacity hover:opacity-90"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-stone-500">
                        {messages.brand}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-mm-primary">{p.name}</h3>
                    <p className="text-mm-accent">{formatIls(p.basePrice, messages.ils)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
