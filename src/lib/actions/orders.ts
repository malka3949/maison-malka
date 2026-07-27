"use server";

import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import {
  FulfillmentType,
  Locale as PrismaLocale,
  OrderStatus,
  PaymentMethod,
  UserRole,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, syncUserFromAuth } from "@/lib/auth";
import { validateFulfillmentDate } from "@/lib/fulfillment";
import { checkoutTrustGateError } from "@/lib/checkout-gates";
import { computeLineTotal, computeUnitPrice, sumMoney } from "@/lib/pricing";
import { normalizeIsraeliMobile } from "@/lib/validation/phone";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";
import { sendOrderAdminNew, sendOrderReceived } from "@/lib/notifications/resend";
import { clientIpFromHeaders, rateLimitConsume } from "@/lib/rate-limit";
import { LEGAL_CONSENT_VERSION } from "@/content/legal";
import { upsertMarketingOptIn } from "@/lib/campaigns/consent";

const MAX_LINE_QTY = 99;

export type CheckoutCartLineInput = {
  productId: string;
  quantity: number;
  optionValueIds: string[];
};

export type CheckoutFormInput = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryAddress?: string;
  requestedFulfillmentDate: string;
  paymentMethod: "bank_transfer" | "on_pickup";
  customerNotes?: string;
  acceptedTerms: boolean;
  deliveryAreaConfirmed?: boolean;
  /** Optional marketing (דיוור) opt-in — not required for order. */
  marketingOptIn?: boolean;
  lines: CheckoutCartLineInput[];
  locale: Locale;
};

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createGuestOrder(
  input: CheckoutFormInput,
): Promise<CheckoutResult> {
  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = rateLimitConsume(`checkout:${ip}`, 12, 15 * 60 * 1000);
  if (!limited.ok) {
    return { ok: false, error: "rate_limited" };
  }

  if (!input.lines.length) {
    return { ok: false, error: "empty_cart" };
  }

  const trustError = checkoutTrustGateError({
    acceptedTerms: input.acceptedTerms === true,
    fulfillmentType: input.fulfillmentType,
    deliveryAreaConfirmed: input.deliveryAreaConfirmed,
  });
  if (trustError) {
    return { ok: false, error: trustError };
  }

  const requested = new Date(input.requestedFulfillmentDate + "T12:00:00");
  if (Number.isNaN(requested.getTime())) {
    return { ok: false, error: "generic" };
  }

  const dateCheck = validateFulfillmentDate(requested);
  if (!dateCheck.ok) {
    return { ok: false, error: dateCheck.error };
  }

  if (input.fulfillmentType === "delivery" && !input.deliveryAddress?.trim()) {
    return { ok: false, error: "delivery_address" };
  }

  if (
    input.fulfillmentType === "delivery" &&
    input.paymentMethod === "on_pickup"
  ) {
    return { ok: false, error: "generic" };
  }

  const name = input.customerName.trim();
  const phoneRaw = input.customerPhone.trim();
  const phone = normalizeIsraeliMobile(phoneRaw);
  const email = input.customerEmail.trim().toLowerCase();
  if (!name || !email) {
    return { ok: false, error: "generic" };
  }
  if (!phone) {
    return { ok: false, error: "invalid_phone" };
  }

  const productIds = [...new Set(input.lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      is_available: true,
      category: { is_active: true },
    },
    include: {
      options: { include: { values: true } },
    },
  });

  if (products.length !== productIds.length) {
    return { ok: false, error: "generic" };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const computedLines: {
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    options: {
      productOptionValueId: string;
      optionName: string;
      optionValue: string;
      priceDelta: number;
    }[];
  }[] = [];

  for (const line of input.lines) {
    if (
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > MAX_LINE_QTY
    ) {
      return { ok: false, error: "generic" };
    }
    const product = productMap.get(line.productId);
    if (!product) {
      return { ok: false, error: "generic" };
    }

    const selectedValues = [];
    for (const opt of product.options) {
      const selected = opt.values.find((v) => line.optionValueIds.includes(v.id));
      if (opt.is_required && !selected) {
        return { ok: false, error: "required_options" };
      }
      if (selected) {
        if (selected.product_option_id !== opt.id) {
          return { ok: false, error: "generic" };
        }
        selectedValues.push({
          productOptionValueId: selected.id,
          optionName: opt.name_key,
          optionValue: selected.label_key,
          priceDelta: Number(selected.price_delta),
        });
      }
    }

    // Reject unknown option ids
    const knownIds = new Set(
      product.options.flatMap((o) => o.values.map((v) => v.id)),
    );
    if (line.optionValueIds.some((id) => !knownIds.has(id))) {
      return { ok: false, error: "generic" };
    }

    const unitPrice = computeUnitPrice(
      Number(product.base_price),
      selectedValues.map((v) => v.priceDelta),
    );
    const lineTotal = computeLineTotal(unitPrice, line.quantity);
    computedLines.push({
      productId: product.id,
      quantity: line.quantity,
      unitPrice,
      lineTotal,
      options: selectedValues,
    });
  }

  const subtotal = sumMoney(computedLines.map((l) => l.lineTotal));
  const total = subtotal;

  const authUser = await getSessionUser();
  let userId: string | null = null;
  if (authUser?.email) {
    const appUser = await syncUserFromAuth(authUser.id, authUser.email);
    if (appUser.role !== UserRole.admin) {
      userId = appUser.id;
    }
  }

  const orderLocale =
    input.locale === "en" ? PrismaLocale.en : PrismaLocale.he;

  const order = await prisma.order.create({
    data: {
      access_token: randomBytes(24).toString("hex"),
      user_id: userId,
      status: OrderStatus.pending_approval,
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      locale: orderLocale,
      fulfillment_type:
        input.fulfillmentType === "delivery"
          ? FulfillmentType.delivery
          : FulfillmentType.pickup,
      delivery_address:
        input.fulfillmentType === "delivery"
          ? input.deliveryAddress!.trim()
          : null,
      requested_fulfillment_date: requested,
      payment_method:
        input.paymentMethod === "bank_transfer"
          ? PaymentMethod.bank_transfer
          : PaymentMethod.on_pickup,
      customer_notes: input.customerNotes?.trim() || null,
      terms_accepted_at: new Date(),
      legal_consent_version: LEGAL_CONSENT_VERSION,
      subtotal,
      total,
      items: {
        create: computedLines.map((l) => ({
          product_id: l.productId,
          quantity: l.quantity,
          unit_price: l.unitPrice,
          line_total: l.lineTotal,
          options: {
            create: l.options.map((o) => ({
              product_option_value_id: o.productOptionValueId,
              option_name_snapshot: o.optionName,
              option_value_snapshot: o.optionValue,
              price_delta_snapshot: o.priceDelta,
            })),
          },
        })),
      },
    },
  });

  if (input.marketingOptIn === true) {
    try {
      await upsertMarketingOptIn(email, "checkout");
    } catch (err) {
      console.error("[checkout] marketing consent upsert failed", err);
    }
  }

  void sendOrderReceived(order).then((result) => {
    if (!result.ok && !result.skipped) {
      console.error("[checkout] order received email failed", result.error);
    }
  });

  void sendOrderAdminNew(order, computedLines.length).then((result) => {
    if (!result.ok && !result.skipped) {
      console.error("[checkout] admin new-order email failed", result.error);
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(`mm_order_access_${order.id}`, order.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  return { ok: true, orderId: order.id };
}

export async function registerCustomer(formData: FormData) {
  const locale = String(formData.get("locale") || "he");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const phone = normalizeIsraeliMobile(phoneRaw);
  const acceptedTerms = formData.get("acceptedTerms") === "on";

  const fail = (code: string): never => {
    redirect(`/${locale}/register?error=${encodeURIComponent(code)}`);
    throw new Error("unreachable");
  };

  if (!acceptedTerms) {
    fail("accepted_terms");
  }
  if (!email || !password || !fullName) {
    fail("generic");
  }
  if (password.length < 6) {
    fail("generic");
  }
  if (!phoneRaw) {
    fail("generic");
  }
  if (!phone) {
    fail("invalid_phone");
  }

  // Never grant admin via public register
  if (
    process.env.ADMIN_EMAIL &&
    email === process.env.ADMIN_EMAIL.trim().toLowerCase()
  ) {
    fail("generic");
  }

  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = rateLimitConsume(`register:${ip}`, 6, 60 * 60 * 1000);
  if (!limited.ok) {
    fail("rate_limited");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    fail("generic");
  }
  // Assert after guards: `fail()` is `never`, but tsc does not always narrow through it.
  const authUser = data.user!;
  const safePhone = phone!;

  await prisma.user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      email,
      role: UserRole.customer,
    },
    update: {
      email,
      // Never demote/promote via public register
    },
  });

  await prisma.customerProfile.upsert({
    where: { user_id: authUser.id },
    create: {
      user_id: authUser.id,
      full_name: fullName.slice(0, 120),
      phone: safePhone,
      email,
    },
    update: {
      full_name: fullName.slice(0, 120),
      phone: safePhone,
      email,
    },
  });

  redirect(`/${locale}/checkout`);
}

export async function loginCustomer(formData: FormData) {
  const locale = String(formData.get("locale") || "he");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = rateLimitConsume(
    `customer-login:${ip}:${email || "unknown"}`,
    8,
    15 * 60 * 1000,
  );
  if (!limited.ok) {
    redirect(`/${locale}/login?error=rate_limited`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/${locale}/login?error=1`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) {
    await syncUserFromAuth(user.id, user.email);
  }

  redirect(`/${locale}`);
}

export async function logoutCustomer(formData: FormData) {
  const locale = String(formData.get("locale") || "he");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}

export async function getCustomerProfileForCheckout() {
  const authUser = await getSessionUser();
  if (!authUser) {
    return null;
  }
  const profile = await prisma.customerProfile.findUnique({
    where: { user_id: authUser.id },
  });
  if (!profile) {
    return null;
  }
  return {
    fullName: profile.full_name,
    phone: profile.phone,
    email: profile.email,
    deliveryAddress: profile.default_delivery_address ?? "",
  };
}
