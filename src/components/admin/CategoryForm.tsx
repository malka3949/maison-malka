"use client";

import { useActionState } from "react";
import {
  upsertCategoryAction,
  type CategoryFormState,
} from "@/lib/actions/categories";
import { adminUi } from "@/lib/admin-ui";

const initialState: CategoryFormState = {};

type CategoryFormProps = {
  category?: {
    id: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    translations: { locale: string; name: string }[];
  };
};

export function CategoryForm({ category }: CategoryFormProps) {
  const nameHe =
    category?.translations.find((t) => t.locale === "he")?.name ?? "";
  const nameEn =
    category?.translations.find((t) => t.locale === "en")?.name ?? "";

  const [state, formAction, pending] = useActionState(upsertCategoryAction, initialState);

  return (
    <form action={formAction} className={`space-y-4 ${adminUi.card}`}>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">שם (עברית)</label>
          <input name="name_he" defaultValue={nameHe} required className={adminUi.input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">שם (אנגלית)</label>
          <input name="name_en" defaultValue={nameEn} required className={adminUi.input} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">Slug</label>
          <input
            name="slug"
            defaultValue={category?.slug ?? ""}
            placeholder="cakes"
            className={adminUi.input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">סדר תצוגה</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={category?.sort_order ?? 0}
            className={adminUi.input}
          />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} />
        פעילה
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-700">נשמר בהצלחה</p> : null}
      <button type="submit" disabled={pending} className={adminUi.btnPrimary}>
        {pending ? "שומר..." : category ? "עדכון" : "יצירה"}
      </button>
    </form>
  );
}
