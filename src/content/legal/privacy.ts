export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  draftNotice: string;
  sections: LegalSection[];
};

export const privacyHe: LegalDocument = {
  title: "מדיניות פרטיות",
  draftNotice: "",
  sections: [
    {
      heading: "מי אנחנו",
      paragraphs: [
        "Maison Malka מפעילה אתר הזמנות לקונדיטוריה בוטיק בירושלים. פנייה בנושאי פרטיות תיעשה דרך פרטי יצירת הקשר המופיעים באתר.",
      ],
    },
    {
      heading: "איזה מידע נאסף",
      paragraphs: [
        "בהזמנה: שם מלא, טלפון, אימייל, פרטי הזמנה (מוצרים, כמויות, מחירים), סוג מילוי (איסוף/משלוח), כתובת למשלוח אם נבחרה, תאריך מבוקש, אמצעי תשלום שנבחר, והערות אופציונליות.",
        "בחשבון אופציונלי: אימייל וסיסמה מנוהלים אצל ספק האימות (Supabase Auth), ופרופיל לקוח (שם, טלפון, אימייל, כתובת ברירת מחדל אופציונלית).",
        "נתונים טכניים מינימליים עשויים להיווצר אצל ספקי האחסון והאחסון בענן (למשל לוגים תפעוליים).",
      ],
    },
    {
      heading: "מטרות השימוש",
      paragraphs: [
        "ביצוע הזמנות, יצירת קשר, אישור או דחייה ידניים, שליחת הודעות אימייל תפעוליות, ושיפור תפעול בית העסק.",
        "אין שימוש במידע לפרסום צד שלישי במסגרת ה-MVP.",
      ],
    },
    {
      heading: "בסיס ומסירה",
      paragraphs: [
        "מסירת הפרטים נעשית בהסכמה במסגרת שליחת ההזמנה (כולל אישור תנאים ומדיניות).",
        "המידע נשמר אצל ספקי תשתית: Supabase (מסד נתונים ואימות), Vercel (אחסון האפליקציה), ו-Resend (אימייל תפעולי).",
        "אין סליקת כרטיסי אשראי באתר; תשלום באיסוף או בהעברה בנקאית לפי הנחיות לאחר אישור.",
      ],
    },
    {
      heading: "שמירה ומחיקה",
      paragraphs: [
        "פרטי הזמנה נשמרים כל עוד נדרשים לתפעול, לתיעוד עסקי ולמענה לפניות. ניתן לפנות בבקשת עיון, תיקון או מחיקה/התמה באמצעות פרטי הקשר באתר; בית העסק יטפל בבקשה במסגרת החוק והיכולת התפעולית.",
      ],
    },
    {
      heading: "זכויות",
      paragraphs: [
        "בהתאם לדין החל ניתן לבקש עיון במידע, תיקון, ומחיקה/התמה במקרים המתאימים. לפניות: השתמשו בפרטי הקשר באתר וציינו את מספר ההזמנה אם קיים. בית העסק יכול לייצא או להתם פרטי הזמנה דרך ממשק הניהול לאחר אימות זהות סביר.",
      ],
    },
  ],
};

export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  draftNotice: "",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "Maison Malka operates an order website for a boutique bakery in Jerusalem. Privacy requests should use the contact details shown on the site.",
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "On checkout: full name, phone, email, order details (products, quantities, prices), fulfillment type (pickup/delivery), delivery address if selected, requested date, chosen payment method, and optional notes.",
        "With an optional account: email/password via our auth provider (Supabase Auth), plus a customer profile (name, phone, email, optional default address).",
        "Minimal technical/operational logs may be created by hosting providers.",
      ],
    },
    {
      heading: "Purposes",
      paragraphs: [
        "We use this information to fulfil orders, contact you, complete manual approval/rejection, send transactional emails, and operate the shop.",
        "This MVP does not sell personal data to third parties for advertising.",
      ],
    },
    {
      heading: "Processors and payment",
      paragraphs: [
        "Submitting an order includes consent to the terms and policies.",
        "Data is processed by infrastructure providers: Supabase (database/auth), Vercel (application hosting), and Resend (transactional email).",
        "No card payments are processed on the site; payment is on pickup or by bank transfer after approval.",
      ],
    },
    {
      heading: "Retention and deletion",
      paragraphs: [
        "Order records are kept as needed for operations, business records, and support. You may request access, correction, or deletion/anonymization via the site contact details; we will handle requests as required by applicable law and operational feasibility.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Subject to applicable law, you may request access, correction, and deletion/anonymization where appropriate. Contact us using the site details and include your order id if available. The business can export or anonymize order personal data via the admin tools after reasonable identity verification.",
      ],
    },
  ],
};
