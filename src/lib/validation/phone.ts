/**
 * Israeli phone helpers — free local validation (no external API).
 * Accepts mobile: 05XXXXXXXX, 05X-XXX-XXXX, +9725XXXXXXXX.
 */

export function normalizeIsraeliMobile(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("00")) {
    digits = `+${digits.slice(2)}`;
  }
  if (digits.startsWith("+972")) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith("972") && digits.length >= 11) {
    digits = `0${digits.slice(3)}`;
  }

  if (!/^05\d{8}$/.test(digits)) {
    return null;
  }
  return digits;
}

export function isValidIsraeliMobile(input: string): boolean {
  return normalizeIsraeliMobile(input) !== null;
}
