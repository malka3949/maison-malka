import Link from "next/link";
import { notFound } from "next/navigation";
import { HorizontalScroller } from "@/components/storefront/HorizontalScroller";
import { SectionHeading } from "@/components/storefront/SectionHeading";
import { getActiveCategories, getAvailableProducts } from "@/lib/catalog";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { formatIls, getProductImagePublicUrl } from "@/lib/storefront";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1800&q=85";

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
  const featured = products.slice(0, 8);
  const heroImg =
    (featured[0]?.imagePath && getProductImagePublicUrl(featured[0].imagePath)) ||
    HERO_FALLBACK;

  const categoriesWithImage = categories.map((c) => {
    const match = products.find((p) => p.categorySlug === c.slug && p.imagePath);
    return {
      ...c,
      imageUrl: match?.imagePath
        ? getProductImagePublicUrl(match.imagePath)
        : null,
    };
  });

  return (
    <div className="space-y-14">
      <section className="mm-wrap relative mt-2 min-h-[min(72vh,560px)] overflow-hidden rounded-[1.75rem] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImg}
          alt=""
          className="mm-hero-zoom absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(30,24,18,0.55)] via-[rgba(30,24,18,0.15)] to-[rgba(30,24,18,0.25)]" />
        <div className="relative z-[2] flex min-h-[min(72vh,560px)] max-w-lg flex-col justify-end p-8 md:p-14">
          <p className="mb-2 text-sm tracking-wide text-mm-cta">{messages.heroEyebrow}</p>
          <h1 className="font-heading text-5xl font-medium leading-tight md:text-6xl">
            {messages.heroTitle}
          </h1>
          <p className="mt-3 text-base text-white/90 md:text-lg">{messages.heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${locale}/catalog`} className="mm-btn">
              {messages.heroCta}
            </Link>
            <a href="#popular" className="mm-btn mm-btn-outline">
              {messages.heroSecondaryCta}
            </a>
          </div>
        </div>
      </section>

      <section className="mm-wrap">
        <SectionHeading
          title={messages.categoriesTitle}
          subtitle={messages.categoriesSubtitle}
          moreHref={`/${locale}/catalog`}
          moreLabel={messages.seeFullCatalog}
        />
        {categoriesWithImage.length === 0 ? (
          <p className="text-mm-secondary">{messages.emptyCatalog}</p>
        ) : (
          <HorizontalScroller
            ariaLabelPrev={messages.scrollPrev}
            ariaLabelNext={messages.scrollNext}
          >
            {categoriesWithImage.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/catalog?category=${c.slug}`}
                className="group relative block h-56 w-44 overflow-hidden rounded-2xl bg-mm-soft cursor-pointer sm:w-52"
              >
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-mm-soft text-sm text-mm-secondary">
                    {messages.brand}
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-10 text-center text-sm font-semibold text-white">
                  {c.name}
                </span>
              </Link>
            ))}
          </HorizontalScroller>
        )}
      </section>

      <section id="popular" className="mm-wrap scroll-mt-28">
        <SectionHeading
          title={messages.featuredTitle}
          subtitle={messages.featuredSubtitle}
          moreHref={`/${locale}/catalog`}
          moreLabel={messages.seeAllProducts}
        />
        {featured.length === 0 ? (
          <p className="text-mm-secondary">{messages.emptyCatalog}</p>
        ) : (
          <HorizontalScroller
            ariaLabelPrev={messages.scrollPrev}
            ariaLabelNext={messages.scrollNext}
          >
            {featured.map((p) => {
              const img = p.imagePath ? getProductImagePublicUrl(p.imagePath) : null;
              return (
                <Link
                  key={p.id}
                  href={`/${locale}/products/${p.id}`}
                  className="group w-56 cursor-pointer sm:w-64"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mm-soft">
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
                  <div className="mt-3 space-y-1">
                    <h3 className="font-heading text-xl text-mm-primary">{p.name}</h3>
                    <p className="text-mm-cta">{formatIls(p.basePrice, messages.ils)}</p>
                  </div>
                </Link>
              );
            })}
          </HorizontalScroller>
        )}

        <div className="mt-10 grid gap-4 rounded-2xl border border-mm-line bg-mm-surface p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [messages.trustDelivery, messages.trustDeliverySub],
            [messages.trustPickup, messages.trustPickupSub],
            [messages.trustHandmade, messages.trustHandmadeSub],
            [messages.trustApproval, messages.trustApprovalSub],
          ].map(([title, sub]) => (
            <div key={title} className="text-center sm:text-start">
              <p className="font-semibold text-mm-primary">{title}</p>
              <p className="text-sm text-mm-secondary">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mm-wrap overflow-hidden rounded-[1.75rem] bg-mm-dark px-6 py-14 text-center text-white md:px-12">
        <h2 className="font-heading text-3xl md:text-5xl">{messages.ctaFinalTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/75">{messages.ctaFinalBody}</p>
        <Link href={`/${locale}/catalog`} className="mm-btn mm-btn-gold mt-8">
          {messages.ctaFinalButton}
        </Link>
      </section>
    </div>
  );
}
