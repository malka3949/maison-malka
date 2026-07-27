import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { getProductDetail } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/i18n";
import { loadMergedStorefrontMessages } from "@/lib/site-cms";
import { getProductImagePublicUrl } from "@/lib/storefront";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = await loadMergedStorefrontMessages(locale);
  const product = await getProductDetail(id, locale);
  if (!product) {
    notFound();
  }

  const mainImage = product.images[0];
  const mainUrl = mainImage ? getProductImagePublicUrl(mainImage.path) : null;

  return (
    <div className="mm-wrap mm-page space-y-8">
      <p>
        <Link href={`/${locale}/catalog`} className="mm-back-link">
          ← {messages.navCatalog}
        </Link>
      </p>

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-3">
          <div className="mm-pdp-img">
            {mainUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainUrl} alt={mainImage?.alt || product.name} />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-mm-soft text-mm-secondary">
                {messages.brand}
              </div>
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img) => {
                const url = getProductImagePublicUrl(img.path);
                return url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.path}
                    src={url}
                    alt={img.alt || product.name}
                    className="mm-thumb"
                  />
                ) : null;
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-7 lg:pt-2">
          <div>
            <p className="mm-eyebrow">{messages.brand}</p>
            <h1 className="mm-page-title font-heading mt-2">{product.name}</h1>
            {product.description ? (
              <p className="mm-page-lead">{product.description}</p>
            ) : null}
          </div>

          {product.productType === "bundle" && product.bundleItems.length > 0 ? (
            <div className="mm-panel-inset space-y-2">
              <h2 className="mm-eyebrow">{messages.bundleContains}</h2>
              <ul className="space-y-1 text-sm text-mm-primary">
                {product.bundleItems.map((bi) => (
                  <li key={bi.name}>
                    {bi.quantity}× {bi.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <AddToCartButton
            productId={product.id}
            productName={product.name}
            basePrice={product.basePrice}
            options={product.options}
            messages={messages}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
