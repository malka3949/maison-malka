export type OrderCalendarEntry = {
  id: string;
  customer_name: string;
  status: string;
  total: number | string | { toString(): string };
  requested_fulfillment_date: Date;
};

export function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function groupOrdersByFulfillmentDate<T extends OrderCalendarEntry>(
  orders: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const order of orders) {
    const key = formatDateKey(order.requested_fulfillment_date);
    const bucket = map.get(key) ?? [];
    bucket.push(order);
    map.set(key, bucket);
  }
  for (const [, bucket] of map) {
    bucket.sort((a, b) => a.customer_name.localeCompare(b.customer_name, "he"));
  }
  return map;
}

export function sortedDateKeys(map: Map<string, unknown>): string[] {
  return [...map.keys()].sort();
}
