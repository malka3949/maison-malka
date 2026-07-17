"use server";

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
import { computeLineTotal, computeUnitPrice, sumMoney } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";
import { sendOrderAdminNew, sendOrderReceived } from "@/lib/notifications/resend";

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
  lines: CheckoutCartLineInput[];
  locale: Locale;
};

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createGuestOrder(
  input: CheckoutFormInput,
): Promise<CheckoutResult> {
  if (!input.lines.length) {
    return { ok: false, error: "empty_cart" };
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

  const name = input.customerName.trim();
  const phone = input.customerPhone.trim();
  const email = input.customerEmail.trim().toLowerCase();
  if (!name || !phone || !email) {
    return { ok: false, error: "generic" };
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
    if (line.quantity < 1) {
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

  return { ok: true, orderId: order.id };
}

export async function registerCustomer(formData: FormData) {
  const locale = String(formData.get("locale") || "he");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!email || !password || !fullName || !phone) {
    redirect(`/${locale}/register?error=1`);
  }

  // Never grant admin via public register
  if (
    process.env.ADMIN_EMAIL &&
    email === process.env.ADMIN_EMAIL.trim().toLowerCase()
  ) {
    redirect(`/${locale}/register?error=1`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    redirect(`/${locale}/register?error=1`);
  }

  await prisma.user.upsert({
    where: { id: data.user.id },
    create: {
      id: data.user.id,
      email,
      role: UserRole.customer,
    },
    update: {
      email,
      role: UserRole.customer,
    },
  });

  await prisma.customerProfile.upsert({
    where: { user_id: data.user.id },
    create: {
      user_id: data.user.id,
      full_name: fullName,
      phone,
      email,
    },
    update: {
      full_name: fullName,
      phone,
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
