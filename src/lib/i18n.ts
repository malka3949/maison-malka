export type Locale = "he" | "en";

export const LOCALES: Locale[] = ["he", "en"];
export const DEFAULT_LOCALE: Locale = "he";

export function isLocale(value: string): value is Locale {
  return value === "he" || value === "en";
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}

export type Messages = {
  brand: string;
  navHome: string;
  navCatalog: string;
  navCart: string;
  navLogin: string;
  navRegister: string;
  navLogout: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  categoriesTitle: string;
  featuredTitle: string;
  catalogTitle: string;
  filterAll: string;
  emptyCatalog: string;
  priceFrom: string;
  addToCart: string;
  viewProduct: string;
  cartTitle: string;
  cartEmpty: string;
  quantity: string;
  remove: string;
  checkout: string;
  subtotal: string;
  total: string;
  checkoutTitle: string;
  fullName: string;
  phone: string;
  email: string;
  fulfillment: string;
  pickup: string;
  delivery: string;
  deliveryAddress: string;
  fulfillmentDate: string;
  paymentMethod: string;
  bankTransfer: string;
  onPickup: string;
  notes: string;
  submitOrder: string;
  orderSuccess: string;
  orderSuccessBody: string;
  orderId: string;
  backHome: string;
  options: string;
  bundleContains: string;
  loginTitle: string;
  registerTitle: string;
  password: string;
  confirmPassword: string;
  loginSubmit: string;
  registerSubmit: string;
  continueAsGuest: string;
  ils: string;
  footerNote: string;
  errorGeneric: string;
  errorRequiredOptions: string;
  errorEmptyCart: string;
  errorLeadTime: string;
  errorSaturday: string;
  errorDeliveryAddress: string;
};

import { he } from "@/messages/he";
import { en } from "@/messages/en";

const catalogs: Record<Locale, Messages> = { he, en };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale];
}
