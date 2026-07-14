import {
  addProductOptionFormAction,
  addOptionValueFormAction,
} from "@/lib/actions/products";
import { adminUi } from "@/lib/admin-ui";

type Option = {
  id: string;
  name_key: string;
  is_required: boolean;
  sort_order: number;
  values: {
    id: string;
    label_key: string;
    price_delta: string;
    is_default: boolean;
  }[];
};

export function ProductOptionsSection({
  productId,
  options,
}: {
  productId: string;
  options: Option[];
}) {
  return (
    <section className={adminUi.section}>
      <h2 className={adminUi.h2}>אפשרויות מוצר</h2>
      {options.map((option) => (
        <div key={option.id} className="rounded-md border border-stone-100 p-4">
          <p className="font-medium">{option.name_key}</p>
          <p className={`text-xs ${adminUi.muted}`}>
            {option.is_required ? "חובה" : "אופציונלי"} · סדר {option.sort_order}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {option.values.map((value) => (
              <li key={value.id}>
                {value.label_key} (+₪{value.price_delta})
                {value.is_default ? " · ברירת מחדל" : ""}
              </li>
            ))}
          </ul>
          <form action={addOptionValueFormAction} className="mt-3 flex flex-wrap gap-2">
            <input type="hidden" name="product_id" value={productId} />
            <input type="hidden" name="option_id" value={option.id} />
            <input
              name="label_key"
              placeholder="תווית ערך"
              required
              className={adminUi.inputSm}
            />
            <input
              name="price_delta"
              placeholder="תוספת מחיר"
              defaultValue="0"
              className={`w-24 ${adminUi.inputSm}`}
            />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="is_default" />
              ברירת מחדל
            </label>
            <button type="submit" className={adminUi.btnSm}>
              הוסף ערך
            </button>
          </form>
        </div>
      ))}
      <form action={addProductOptionFormAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="product_id" value={productId} />
        <input
          name="name_key"
          placeholder="שם אפשרות (למשל: size)"
          required
          className={adminUi.inputSm}
        />
        <input
          name="sort_order"
          type="number"
          defaultValue={options.length}
          className={`w-20 ${adminUi.inputSm}`}
        />
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" name="is_required" />
          חובה
        </label>
        <button type="submit" className={adminUi.btnPrimary}>
          הוסף אפשרות
        </button>
      </form>
    </section>
  );
}
