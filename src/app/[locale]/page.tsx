import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogProductCard } from "@/components/storefront/CatalogProductCard";
import { HorizontalScroller } from "@/components/storefront/HorizontalScroller";
import { Ticker } from "@/components/storefront/Ticker";
import { getActiveCategories, getAvailableProducts } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/i18n";
import { getProductImagePublicUrl } from "@/lib/storefront";
import {
  loadHomeMediaFromCms,
  loadMergedStorefrontMessages,
} from "@/lib/site-cms";

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
  const [messages, categories, products, homeMedia] = await Promise.all([
    loadMergedStorefrontMessages(locale),
    getActiveCategories(locale),
    getAvailableProducts(locale),
    loadHomeMediaFromCms(),
  ]);
  const featured = products.slice(0, 8);

  const heroImg = homeMedia.hero;
  const promoCatalogImg = homeMedia.promoCatalog;
  const promoGiftImg = homeMedia.promoGift;

  // Category chips also use fixed category art when possible (stable, not newest product)
  const CATEGORY_MEDIA: Record<string, string> = {
    cakes: "/placeholders/cake.jpg",
    pastries: "/placeholders/pastry.jpg",
    desserts: "/placeholders/cheesecake.jpg",
    boxes: "/placeholders/giftbox.jpg",
    celebrations: "/placeholders/celebration.jpg",
  };

  const categoriesWithImage = categories.map((c) => ({
    ...c,
    imageUrl: CATEGORY_MEDIA[c.slug] ?? null,
  }));

  return (
    <div>
      <section className="mm-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImg}
          alt={messages.heroImageAlt}
          className="mm-hero-zoom absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.25)_0%,rgba(20,16,12,0.15)_45%,rgba(20,16,12,0.62)_100%)]" />
        <div className="relative z-[2] flex min-h-[min(72vh,620px)] flex-col items-center justify-end px-5 pb-10 text-center md:pb-14">
          <p className="font-brand text-[clamp(2.75rem,8vw,4.75rem)] leading-none tracking-[0.04em] text-[#f3eee4]">
            {messages.brand}
          </p>
          <h1 className="mt-4 max-w-xl font-heading text-[clamp(1.35rem,3.5vw,2rem)] font-semibold leading-snug tracking-[0.02em] text-[#f3eee4]">
            {messages.heroTitle}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 md:text-[0.95rem]">
            {messages.heroSubtitle}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href={`/${locale}/catalog`} className="mm-btn mm-btn-hero-primary">
              {messages.heroCta}
            </Link>
            <Link
              href={`/${locale}/#popular`}
              className="mm-btn mm-btn-outline"
            >
              {messages.heroSecondaryCta}
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-white/75">
            <span className="inline-block h-px w-8 bg-white/45" />
            {messages.brandSince}
            <span className="inline-block h-px w-8 bg-white/45" />
          </p>
        </div>
      </section>

      <Ticker items={messages.tickerItems} />

      <section className="mm-double">
        <div className="mm-wrap mm-double-grid">
          <Link href={`/${locale}/catalog`} className="mm-frame cursor-pointer">
            <span className="mm-frame-word">{messages.promoCatalogLabel}</span>
            <div className="mm-frame-inner">
              <div className="mm-frame-copy">
                <h2>{messages.promoCatalogTitle}</h2>
                <p>{messages.promoCatalogBody}</p>
                <span className="mm-frame-cta">{messages.promoCatalogCta}</span>
              </div>
              <div className="mm-frame-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={promoCatalogImg}
                  alt={messages.promoCatalogImageAlt}
                />
              </div>
            </div>
          </Link>

          <Link
            href={`/${locale}/catalog?category=boxes`}
            className="mm-frame cursor-pointer"
          >
            <span className="mm-frame-word">{messages.promoGiftLabel}</span>
            <div className="mm-frame-inner">
              <div className="mm-frame-copy">
                <h2>{messages.promoGiftTitle}</h2>
                <p>{messages.promoGiftBody}</p>
                <span className="mm-frame-cta">{messages.promoGiftCta}</span>
              </div>
              <div className="mm-frame-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={promoGiftImg} alt={messages.promoGiftImageAlt} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mm-wrap mt-12 pb-6 md:mt-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mm-section-label">{messages.categoriesTitle}</p>
            <p className="mt-2 text-sm text-mm-secondary">{messages.categoriesSubtitle}</p>
          </div>
          <Link
            href={`/${locale}/catalog`}
            className="cursor-pointer text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            {messages.seeFullCatalog}
          </Link>
        </div>

        {categoriesWithImage.length === 0 ? (
          <p className="py-12 text-center text-mm-secondary">{messages.emptyCatalog}</p>
        ) : (
          <HorizontalScroller
            ariaLabelPrev={messages.scrollPrev}
            ariaLabelNext={messages.scrollNext}
          >
            {categoriesWithImage.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/catalog?category=${c.slug}`}
                className="mm-cat-card group cursor-pointer"
              >
                <div className="mm-cat-img">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt={c.name} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-mm-secondary">
                      {messages.brand}
                    </div>
                  )}
                </div>
                <p>{c.name}</p>
              </Link>
            ))}
          </HorizontalScroller>
        )}
      </section>

      <section id="popular" className="mm-wrap mt-10 scroll-mt-28 pb-8 md:mt-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mm-section-label">{messages.featuredTitle}</p>
            <p className="mt-2 max-w-xl text-sm text-mm-secondary">
              {messages.featuredSubtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/catalog`}
            className="cursor-pointer text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            {messages.seeAllProducts}
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="py-12 text-center text-mm-secondary">{messages.emptyCatalog}</p>
        ) : (
          <HorizontalScroller
            ariaLabelPrev={messages.scrollPrev}
            ariaLabelNext={messages.scrollNext}
          >
            {featured.map((p) => (
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
                viewProductLabel={messages.viewProduct}
                layout="scroll"
              />
            ))}
          </HorizontalScroller>
        )}

        <div className="mt-12 grid gap-6 border-y border-mm-line py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [messages.trustDelivery, messages.trustDeliverySub],
            [messages.trustPickup, messages.trustPickupSub],
            [messages.trustHandmade, messages.trustHandmadeSub],
            [messages.trustApproval, messages.trustApprovalSub],
          ].map(([title, sub]) => (
            <div key={title} className="text-center">
              <p className="font-semibold text-mm-primary">{title}</p>
              <p className="mt-1 text-sm text-mm-secondary">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-mm-line bg-mm-surface px-6 py-16 text-center md:px-12 md:py-20">
        <p className="mm-section-label">{messages.ctaFinalTitle}</p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-mm-secondary md:text-base">
          {messages.ctaFinalBody}
        </p>
        <Link href={`/${locale}/catalog`} className="mm-btn mt-8">
          {messages.ctaFinalButton}
        </Link>
      </section>
    </div>
  );
}
