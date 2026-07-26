"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";
import type { Locale } from "@/lib/i18n";
import { formatIls } from "@/lib/storefront";

type Props = {
  locale: Locale;
  productId: string;
  name: string;
  categoryName: string;
  basePrice: number;
  imageUrl: string | null;
  brand: string;
  priceFrom: string;
  ils: string;
  inCartLabel: string;
  viewProductLabel: string;
  /** `grid` for catalog; `scroll` for home horizontal scroller */
  layout?: "grid" | "scroll";
};

export function CatalogProductCard({
  locale,
  productId,
  name,
  categoryName,
  basePrice,
  imageUrl,
  brand,
  priceFrom,
  ils,
  inCartLabel,
  viewProductLabel,
  layout = "grid",
}: Props) {
  const { lines } = useCart();
  const qtyInCart = lines
    .filter((l) => l.productId === productId)
    .reduce((sum, l) => sum + l.quantity, 0);

  return (
    <Link
      href={`/${locale}/products/${productId}`}
      className={`mm-product-card group relative cursor-pointer${
        layout === "grid" ? " mm-product-card--grid" : ""
      }`}
    >
      <div className="mm-product-img">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} />
        ) : (
          <div className="flex h-full items-center justify-center bg-mm-soft text-sm text-mm-secondary">
            {brand}
          </div>
        )}
        {qtyInCart > 0 ? (
          <span className="absolute end-2 top-2 bg-mm-announce px-2 py-1 text-[0.65rem] font-semibold text-mm-primary">
            {inCartLabel}: {qtyInCart}
          </span>
        ) : null}
      </div>
      <p className="mm-product-cat">{categoryName}</p>
      <h2 className="mm-product-name">{name}</h2>
      <p className="mm-product-price">
        {priceFrom}
        {formatIls(basePrice, ils)}
      </p>
      <span className="mm-product-action">{viewProductLabel}</span>
    </Link>
  );
}
