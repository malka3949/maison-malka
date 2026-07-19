import type { LegalDocument } from "./privacy";

export const cancellationHe: LegalDocument = {
  title: "מדיניות ביטולים",
  draftNotice:
    "טיוטה לצרכי MVP — יש לעדכן לפי ייעוץ משפטי לפני השקה ציבורית.",
  sections: [
    {
      heading: "לפני אישור",
      paragraphs: [
        "כל עוד ההזמנה במצב ממתין לאישור, ניתן לפנות אלינו לביטול או שינוי דרך פרטי יצירת הקשר באתר.",
      ],
    },
    {
      heading: "לאחר אישור",
      paragraphs: [
        "לאחר אישור הזמנה, ביטול או שינוי תלויים בלוח ההכנה ובמועד המילוי. נשמח לסייע בתיאום — אין התחייבות לביטול מלא בכל מקרה.",
      ],
    },
    {
      heading: "מוצרים מותאמים",
      paragraphs: [
        "מוצרים שהוכנו לפי הזמנה עשויים להיות מוגבלים יותר לביטול לאחר תחילת ההכנה.",
      ],
    },
  ],
};

export const cancellationEn: LegalDocument = {
  title: "Cancellation Policy",
  draftNotice:
    "Draft for MVP — replace with counsel-reviewed text before public launch.",
  sections: [
    {
      heading: "Before approval",
      paragraphs: [
        "While an order is pending approval, you may contact us to cancel or change it using the contact details on the site.",
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
  ],
};
