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
  draftNotice:
    "טיוטה לצרכי MVP — יש לעדכן לפי ייעוץ משפטי לפני השקה ציבורית.",
  sections: [
    {
      heading: "מה אנחנו אוספים",
      paragraphs: [
        "בעת הזמנה אנו אוספים שם, טלפון, כתובת אימייל, פרטי הזמנה, וכתובת למשלוח אם נבחר משלוח.",
        "אם נרשמים לחשבון אופציונלי, נשמרים גם פרטי התחברות דרך ספק האימות שלנו.",
      ],
    },
    {
      heading: "למה",
      paragraphs: [
        "המידע משמש לביצוע ההזמנה, יצירת קשר, אישור/דחייה ידניים, ושליחת התראות אימייל רלוונטיות.",
      ],
    },
    {
      heading: "שמירה וספקים",
      paragraphs: [
        "המידע מאוחסן אצל ספקי התשתית של האתר (כולל Supabase ו-Vercel). הודעות אימייל נשלחות דרך Resend.",
        "אין סליקת כרטיסי אשראי באתר במסגרת ה-MVP.",
      ],
    },
    {
      heading: "יצירת קשר",
      paragraphs: [
        "לשאלות בנוגע לפרטיות ניתן לפנות דרך פרטי יצירת הקשר המופיעים באתר.",
      ],
    },
  ],
};

export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  draftNotice:
    "Draft for MVP — replace with counsel-reviewed text before public launch.",
  sections: [
    {
      heading: "What we collect",
      paragraphs: [
        "When you place an order we collect your name, phone, email, order details, and delivery address if delivery is selected.",
        "If you create an optional account, login credentials are handled by our authentication provider.",
      ],
    },
    {
      heading: "Why",
      paragraphs: [
        "We use this information to fulfil orders, contact you, complete manual approval/rejection, and send related email notifications.",
      ],
    },
    {
      heading: "Storage and providers",
      paragraphs: [
        "Data is stored with our infrastructure providers (including Supabase and Vercel). Transactional email is sent via Resend.",
        "This MVP does not process card payments on the site.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "For privacy questions, contact us using the details shown on the site.",
      ],
    },
  ],
};
