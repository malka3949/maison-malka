import { toggleCategoryActiveFormAction } from "@/lib/actions/categories";
import { adminUi } from "@/lib/admin-ui";

export function CategoryToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  return (
    <form action={toggleCategoryActiveFormAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="is_active" value={String(isActive)} />
      <button
        type="submit"
        className={`cursor-pointer ${isActive ? adminUi.badgeOn : adminUi.badgeOff}`}
      >
        {isActive ? "פעילה" : "מוסתרת"}
      </button>
    </form>
  );
}
