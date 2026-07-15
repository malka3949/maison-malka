import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { getProductDetail } from "@/lib/catalog";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
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
  const messages = getMessages(locale);
  const product = await getProductDetail(id, locale);
  if (!product) {
    notFound();
  }

  const mainImage = product.images[0];
  const mainUrl = mainImage ? getProductImagePublicUrl(mainImage.path) : null;

  return (
    <div className="mm-wrap space-y-8 pt-8 pb-10">
      <p>
        <Link
          href={`/${locale}/catalog`}
          className="cursor-pointer text-sm text-mm-secondary underline-offset-4 transition-colors hover:text-mm-primary hover:underline"
        >
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
                    className="aspect-square border border-mm-line object-cover"
                  />
                ) : null;
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-7 lg:pt-2">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-mm-word">
              {messages.brand}
            </p>
            <h1 className="mt-2 font-heading text-4xl font-medium leading-tight text-mm-primary md:text-5xl">
              {product.name}
            </h1>
            {product.description ? (
              <p className="mt-4 text-[0.95rem] leading-relaxed text-mm-secondary">
                {product.description}
              </p>
            ) : null}
          </div>

          {product.productType === "bundle" && product.bundleItems.length > 0 ? (
            <div className="border-y border-mm-line py-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-mm-word">
                {messages.bundleContains}
              </h2>
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
