"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { adminUi } from "@/lib/admin-ui";

export function CategoryFilter({
  categories,
  selectedId,
}: {
  categories: { id: string; label: string }[];
  selectedId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className={`text-sm ${adminUi.muted}`}>סינון לפי קטגוריה:</label>
      <select
        value={selectedId ?? ""}
        className={adminUi.select}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set("category", e.target.value);
          } else {
            params.delete("category");
          }
          router.push(`/admin/products?${params.toString()}`);
        }}
      >
        <option value="">הכל</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
