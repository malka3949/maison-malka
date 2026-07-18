import type { LegalDocument } from "./privacy";

export const termsHe: LegalDocument = {
  title: "תנאי שימוש",
  draftNotice:
    "טיוטה לצרכי MVP — יש לעדכן לפי ייעוץ משפטי לפני השקה ציבורית.",
  sections: [
    {
      heading: "הזמנות",
      paragraphs: [
        "הזמנה באתר היא בקשה בלבד ואינה סופית עד לאישור ידני על ידי בית העסק.",
        "בית העסק רשאי לאשר או לדחות הזמנה בהתאם לזמינות, לוחות זמנים ומגבלות תפעול.",
      ],
    },
    {
      heading: "תשלום",
      paragraphs: [
        "ב-MVP אין תשלום מקוון באתר. ניתן לבחור תשלום באיסוף או העברה בנקאית לפי ההוראות שיימסרו לאחר אישור.",
      ],
    },
    {
      heading: "איסוף ומשלוח",
      paragraphs: [
        "איסוף עצמי בתיאום. משלוח זמין באזור ירושלים כפי שמפורט בצ׳קאאוט; עלות משלוח בתיאום.",
        "תאריכי מילוי כפופים לזמני הכנה ולמגבלות ימי פעילות המפורסמים באתר.",
      ],
    },
    {
      heading: "תוכן האתר",
      paragraphs: [
        "תיאורי מוצרים ותמונות נועדו להמחשה. ייתכנו שינויים קלים במראה או בהרכב לפי זמינות.",
      ],
    },
  ],
};

export const termsEn: LegalDocument = {
  title: "Terms of Use",
  draftNotice:
    "Draft for MVP — replace with counsel-reviewed text before public launch.",
  sections: [
    {
      heading: "Orders",
      paragraphs: [
        "An order on this site is a request only and is not final until manually approved by the shop.",
        "The shop may approve or reject an order based on availability, scheduling, and operational limits.",
      ],
    },
    {
      heading: "Payment",
      paragraphs: [
        "This MVP does not process online payments on the site. You may choose pay on pickup or bank transfer per instructions provided after approval.",
      ],
    },
    {
      heading: "Pickup and delivery",
      paragraphs: [
        "Pickup is by arrangement. Delivery is available in the Jerusalem area as stated at checkout; delivery cost is arranged separately.",
        "Fulfillment dates are subject to preparation lead times and published operating constraints.",
      ],
    },
    {
      heading: "Site content",
      paragraphs: [
        "Product descriptions and images are illustrative. Minor variations in appearance or composition may occur based on availability.",
      ],
    },
  ],
};
