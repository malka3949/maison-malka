import Link from "next/link";
import { notFound } from "next/navigation";
import { HorizontalScroller } from "@/components/storefront/HorizontalScroller";
import { Ticker } from "@/components/storefront/Ticker";
import { getActiveCategories, getAvailableProducts } from "@/lib/catalog";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { formatIls, getProductImagePublicUrl } from "@/lib/storefront";
import { HOME_MEDIA } from "@/lib/home-media";

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

  // Fixed site media — do not bind promo frames to “first product with image”
  const heroImg = HOME_MEDIA.hero;
  const promoCatalogImg = HOME_MEDIA.promoCatalog;
  const promoGiftImg = HOME_MEDIA.promoGift;

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
          alt=""
          className="mm-hero-zoom absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,16,12,0.25)_0%,rgba(20,16,12,0.15)_45%,rgba(20,16,12,0.62)_100%)]" />
        <div className="relative z-[2] flex min-h-[min(72vh,620px)] flex-col items-center justify-end px-5 pb-10 text-center md:pb-14">
          <h1 className="font-heading text-[clamp(3rem,10vw,6.5rem)] font-medium leading-[0.9] tracking-[0.04em] text-[#f3eee4]">
            {messages.heroTitle}
          </h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/${locale}/catalog`} className="mm-btn mm-btn-outline">
              {messages.heroCta}
            </Link>
            <Link
              href={`/${locale}/catalog?category=boxes`}
              className="mm-btn mm-btn-outline"
            >
              {messages.promoGiftTitle}
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
                <img src={promoCatalogImg} alt="" />
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
                <img src={promoGiftImg} alt="" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mm-wrap mt-8 pb-4">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mm-section-label">{messages.categoriesTitle}</p>
            <p className="mt-1 text-sm text-mm-secondary">{messages.categoriesSubtitle}</p>
          </div>
          <Link
            href={`/${locale}/catalog`}
            className="cursor-pointer text-sm underline underline-offset-4"
          >
            {messages.seeFullCatalog}
          </Link>
        </div>

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
                className="mm-cat-card group cursor-pointer"
              >
                <div className="mm-cat-img">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.imageUrl} alt="" />
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

      <section id="popular" className="mm-wrap mt-6 scroll-mt-28 pb-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mm-section-label">{messages.featuredTitle}</p>
            <p className="mt-1 max-w-xl text-sm text-mm-secondary">
              {messages.featuredSubtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/catalog`}
            className="cursor-pointer text-sm underline underline-offset-4"
          >
            {messages.seeAllProducts}
          </Link>
        </div>

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
                  className="mm-product-card group cursor-pointer"
                >
                  <div className="mm-product-img">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.name} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-mm-secondary">
                        {messages.brand}
                      </div>
                    )}
                    <span className="mm-add-hint">{messages.addToCart}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-mm-primary">{p.name}</h3>
                  <p className="mt-1 text-sm text-mm-secondary">
                    {messages.priceFrom}
                    {formatIls(p.basePrice, messages.ils)}
                  </p>
                </Link>
              );
            })}
          </HorizontalScroller>
        )}

        <div className="mt-10 grid gap-5 border-y border-mm-line py-8 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="border-t border-mm-line bg-mm-surface px-6 py-14 text-center md:px-12">
        <p className="mm-section-label">{messages.ctaFinalTitle}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-mm-secondary">{messages.ctaFinalBody}</p>
        <Link href={`/${locale}/catalog`} className="mm-btn mt-7">
          {messages.ctaFinalButton}
        </Link>
      </section>
    </div>
  );
}
