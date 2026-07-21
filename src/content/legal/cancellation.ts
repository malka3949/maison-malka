import type { LegalDocument } from "./privacy";

export const cancellationHe: LegalDocument = {
  title: "מדיניות ביטולים",
  draftNotice:
    "מסמך תבנית מקצועי — יש לאשר מול יועץ משפטי לפני השקה ציבורית ולהתאים לפרטי העסק בפועל.",
  sections: [
    {
      heading: "לפני אישור",
      paragraphs: [
        "כל עוד ההזמנה במצב ממתין לאישור, ניתן לפנות לביטול או שינוי דרך פרטי יצירת הקשר באתר.",
      ],
    },
    {
      heading: "לאחר אישור",
      paragraphs: [
        "לאחר אישור, ביטול או שינוי תלויים בלוח ההכנה ובמועד המילוי. נשתדל לסייע בתיאום — אין התחייבות לביטול מלא בכל מקרה.",
      ],
    },
    {
      heading: "מוצרים מותאמים",
      paragraphs: [
        "מוצרים שהוכנו לפי הזמנה עשויים להיות מוגבלים יותר לביטול לאחר תחילת ההכנה.",
      ],
    },
    {
      heading: "תשלומים והחזרים",
      paragraphs: [
        "מאחר שאין סליקה מקוונת באתר, החזרים (אם יחולו) יטופלו מול בית העסק בהתאם לנסיבות ולדין החל.",
      ],
    },
  ],
};

export const cancellationEn: LegalDocument = {
  title: "Cancellation Policy",
  draftNotice:
    "Professional template — obtain counsel review and adapt to your business before public launch.",
  sections: [
    {
      heading: "Before approval",
      paragraphs: [
        "While an order is pending approval, contact us to cancel or change it using the contact details on the site.",
      ],
    },
    {
      heading: "After approval",
      paragraphs: [
        "After approval, cancellation or changes depend on preparation schedules and fulfillment timing. We will try to help coordinate — full cancellation is not guaranteed in every case.",
      ],
    },
    {
      heading: "Made-to-order items",
      paragraphs: [
        "Custom or made-to-order items may have stricter limits once preparation has started.",
      ],
    },
    {
      heading: "Payments and refunds",
      paragraphs: [
        "Because the site does not process online card payments, any applicable refunds are handled directly with the shop according to the circumstances and applicable law.",
      ],
    },
  ],
};
