import Link from "next/link";
import { notFound } from "next/navigation";
import { Ticker } from "@/components/storefront/Ticker";
import { getActiveCategories, getAvailableProducts } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/i18n";
import { formatIls, getProductImagePublicUrl } from "@/lib/storefront";
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
        <div className="mm-hero-veil" aria-hidden />
        <div className="mm-hero-inner">
          <p className="mm-hero-brand font-brand">{messages.brand}</p>
          <h1 className="mm-hero-title font-heading">{messages.heroTitle}</h1>
          <p className="mm-hero-sub">{messages.heroSubtitle}</p>
          <div className="mm-hero-actions">
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
          <p className="mm-hero-since">{messages.brandSince}</p>
        </div>
      </section>

      <Ticker items={messages.tickerItems} />

      <section className="mm-double">
        <div className="mm-wrap mm-double-grid">
          <Link href={`/${locale}/catalog`} className="mm-promo cursor-pointer">
            <div className="mm-promo-media" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={promoCatalogImg} alt="" />
            </div>
            <div className="mm-promo-copy">
              <span className="mm-promo-label">{messages.promoCatalogLabel}</span>
              <h2>{messages.promoCatalogTitle}</h2>
              <p>{messages.promoCatalogBody}</p>
              <span className="mm-promo-cta">{messages.promoCatalogCta}</span>
            </div>
          </Link>

          <Link
            href={`/${locale}/catalog?category=boxes`}
            className="mm-promo cursor-pointer"
          >
            <div className="mm-promo-media" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={promoGiftImg} alt="" />
            </div>
            <div className="mm-promo-copy">
              <span className="mm-promo-label">{messages.promoGiftLabel}</span>
              <h2>{messages.promoGiftTitle}</h2>
              <p>{messages.promoGiftBody}</p>
              <span className="mm-promo-cta">{messages.promoGiftCta}</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="mm-wrap mt-14 pb-6 md:mt-20">
        <div className="mm-section-head">
          <div>
            <p className="mm-section-label">{messages.categoriesTitle}</p>
            <p className="mt-2 text-sm text-mm-secondary">{messages.categoriesSubtitle}</p>
          </div>
          <Link href={`/${locale}/catalog`} className="mm-section-link">
            {messages.seeFullCatalog}
          </Link>
        </div>

        {categoriesWithImage.length === 0 ? (
          <p className="py-12 text-center text-mm-secondary">{messages.emptyCatalog}</p>
        ) : (
          <nav className="mm-cat-nav" aria-label={messages.categoriesTitle}>
            {categoriesWithImage.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/catalog?category=${c.slug}`}
                className="mm-cat-nav-item"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}
      </section>

      <section id="popular" className="mm-wrap mt-12 scroll-mt-28 pb-8 md:mt-16">
        <div className="mm-section-head">
          <div>
            <p className="mm-section-label">{messages.featuredTitle}</p>
            <p className="mt-2 max-w-xl text-sm text-mm-secondary">
              {messages.featuredSubtitle}
            </p>
          </div>
          <Link href={`/${locale}/catalog`} className="mm-section-link">
            {messages.seeAllProducts}
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="py-12 text-center text-mm-secondary">{messages.emptyCatalog}</p>
        ) : (
          <div className="mm-feature-list">
            {featured.slice(0, 4).map((p, index) => {
              const imageUrl = p.imagePath
                ? getProductImagePublicUrl(p.imagePath)
                : null;
              return (
                <Link
                  key={p.id}
                  href={`/${locale}/products/${p.id}`}
                  className={`mm-feature-row${index % 2 === 1 ? " mm-feature-row--flip" : ""}`}
                >
                  <div className="mm-feature-media">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={p.name} />
                    ) : (
                      <div className="mm-feature-fallback">{messages.brand}</div>
                    )}
                  </div>
                  <div className="mm-feature-copy">
                    <p className="mm-eyebrow">{p.categoryName}</p>
                    <h2>{p.name}</h2>
                    <p className="mm-feature-price">
                      {messages.priceFrom}
                      {formatIls(Number(p.basePrice), messages.ils)}
                    </p>
                    <span className="mm-feature-cta">{messages.viewProduct}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mm-trust">
          {[
            [messages.trustDelivery, messages.trustDeliverySub],
            [messages.trustPickup, messages.trustPickupSub],
            [messages.trustHandmade, messages.trustHandmadeSub],
            [messages.trustApproval, messages.trustApprovalSub],
          ].map(([title, sub]) => (
            <div key={title} className="mm-trust-item">
              <p className="mm-trust-title">{title}</p>
              <p className="mm-trust-sub">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mm-final">
        <p className="mm-section-label">{messages.ctaFinalTitle}</p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-mm-secondary md:text-base">
          {messages.ctaFinalBody}
        </p>
        <Link href={`/${locale}/catalog`} className="mm-btn mt-9">
          {messages.ctaFinalButton}
        </Link>
      </section>
    </div>
  );
}
