import {
  addBundleItemFormAction,
  removeBundleItemFormAction,
} from "@/lib/actions/products";
import { adminUi } from "@/lib/admin-ui";

type BundleItem = {
  id: string;
  quantity: number;
  item_product: {
    id: string;
    translations: { locale: string; name: string }[];
  };
};

export function BundleItemsSection({
  bundleProductId,
  items,
  standardProducts,
}: {
  bundleProductId: string;
  items: BundleItem[];
  standardProducts: { id: string; label: string }[];
}) {
  return (
    <section className={adminUi.section}>
      <h2 className={adminUi.h2}>רכיבי מארז</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => {
          const name =
            item.item_product.translations.find((t) => t.locale === "he")?.name ??
            item.item_product.translations[0]?.name ??
            "—";
          return (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-stone-100 px-3 py-2"
            >
              <span>
                {name} × {item.quantity}
              </span>
              <form action={removeBundleItemFormAction}>
                <input type="hidden" name="bundle_product_id" value={bundleProductId} />
                <input type="hidden" name="item_id" value={item.id} />
                <button
                  type="submit"
                  className="cursor-pointer text-xs text-red-600 transition-colors duration-200 hover:underline"
                >
                  הסרה
                </button>
              </form>
            </li>
          );
        })}
      </ul>
      <form action={addBundleItemFormAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="bundle_product_id" value={bundleProductId} />
        <select name="item_product_id" required className={adminUi.select}>
          <option value="">בחרו מוצר</option>
          {standardProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          className={`w-20 ${adminUi.inputSm}`}
        />
        <button type="submit" className={adminUi.btnPrimary}>
          הוסף למארז
        </button>
      </form>
    </section>
  );
}
