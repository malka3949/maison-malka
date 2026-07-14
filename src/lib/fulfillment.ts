/** Checkout date / fulfillment validation (Israel business rules MVP). */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** JS: Sunday=0 … Saturday=6 */
export function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

export function minFulfillmentDate(from: Date = new Date()): Date {
  const base = startOfDay(from);
  return new Date(base.getTime() + 2 * MS_PER_DAY);
}

export type FulfillmentDateError = "lead_time" | "saturday";

export function validateFulfillmentDate(
  requested: Date,
  today: Date = new Date(),
): { ok: true } | { ok: false; error: FulfillmentDateError } {
  const req = startOfDay(requested);
  const min = minFulfillmentDate(today);

  if (req.getTime() < min.getTime()) {
    return { ok: false, error: "lead_time" };
  }
  if (isSaturday(req)) {
    return { ok: false, error: "saturday" };
  }
  return { ok: true };
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
