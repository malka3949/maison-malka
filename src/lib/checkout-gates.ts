/**
 * Checkout trust gates (consent + delivery affirmation).
 * Pure helpers — unit-tested; also enforced in createGuestOrder.
 */
export function checkoutTrustGateError(input: {
  acceptedTerms: boolean;
  fulfillmentType: "pickup" | "delivery";
  deliveryAreaConfirmed?: boolean;
}): "accepted_terms" | "delivery_area" | null {
  if (!input.acceptedTerms) {
    return "accepted_terms";
  }
  if (
    input.fulfillmentType === "delivery" &&
    input.deliveryAreaConfirmed !== true
  ) {
    return "delivery_area";
  }
  return null;
}
