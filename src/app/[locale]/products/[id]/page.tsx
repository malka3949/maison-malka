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

  return (
    <div className="mm-wrap space-y-6">
      <p>
        <Link
          href={`/${locale}/catalog`}
          className="cursor-pointer text-sm text-mm-secondary transition-colors hover:text-mm-primary"
        >
          ← {messages.navCatalog}
        </Link>
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          {product.images.length === 0 ? (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-mm-soft text-mm-secondary">
              {messages.brand}
            </div>
          ) : (
            product.images.map((img) => {
              const url = getProductImagePublicUrl(img.path);
              return url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.path}
                  src={url}
                  alt={img.alt || product.name}
                  className="w-full rounded-2xl object-cover"
                />
              ) : null;
            })
          )}
        </div>

        <div className="space-y-6 rounded-2xl border border-mm-line bg-mm-surface p-6 md:p-8">
          <div>
            <h1 className="font-heading text-4xl text-mm-primary">{product.name}</h1>
            {product.description ? (
              <p className="mt-3 text-mm-secondary">{product.description}</p>
            ) : null}
          </div>

          {product.productType === "bundle" && product.bundleItems.length > 0 ? (
            <div>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-mm-secondary">
                {messages.bundleContains}
              </h2>
              <ul className="list-inside list-disc text-mm-primary">
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
