/** Pricing helpers — authoritative totals computed server-side at checkout. */

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeUnitPrice(basePrice: number, optionDeltas: number[]): number {
  const sum = optionDeltas.reduce((acc, d) => acc + d, 0);
  return roundMoney(basePrice + sum);
}

export function computeLineTotal(unitPrice: number, quantity: number): number {
  return roundMoney(unitPrice * quantity);
}

export function sumMoney(values: number[]): number {
  return roundMoney(values.reduce((acc, v) => acc + v, 0));
}
