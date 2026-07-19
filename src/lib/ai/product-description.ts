export type ProductDescriptionInput = {
  nameHe: string;
  nameEn: string;
  categoryLabel?: string;
  productType?: "standard" | "bundle";
};

export type ProductDescriptionSuggestion = {
  he: string;
  en: string;
  source: "local";
};

type CategoryKind =
  | "cake"
  | "pastry"
  | "dessert"
  | "box"
  | "celebration"
  | "general";

function detectKind(categoryLabel: string, nameHe: string, nameEn: string): CategoryKind {
  const hay = `${categoryLabel} ${nameHe} ${nameEn}`.toLowerCase();

  if (/מארז|box|gift|גיופט/.test(hay)) return "box";
  if (/חגיג|celebration|event|אירוע/.test(hay)) return "celebration";
  // Cookies before cakes — "עוגיות" also matches "עוג".
  if (/עוגי|cookie|מאפ|pastr|בורקס|קרואס|brioche/.test(hay)) return "pastry";
  if (/עוג|cake|tort|טארט|tart|מספר/.test(hay)) return "cake";
  if (/קינוח|dessert|מוס|mousse|גליד|ice/.test(hay)) return "dessert";
  return "general";
}

function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

const PRODUCT_NAME_PHRASES: Record<string, string> = {
  "עוגת שוקולד": "Chocolate cake",
  "עוגת גבינה": "Cheesecake",
  "עוגת מספר": "Number cake",
  "עוגה אישית": "Personal cake",
  "עוגת גלידה": "Ice cream cake",
  "עוגת יום הולדת": "Birthday cake",
  "עוגת פירות": "Fruit cake",
  "עוגת תות": "Strawberry cake",
  "עוגת וניל": "Vanilla cake",
  "עוגת קרמל": "Caramel cake",
  "עוגת לימון": "Lemon cake",
  "עוגת פיסטוק": "Pistachio cake",
  "מארז חגיגי": "Celebration box",
  "מארז מתנה": "Gift box",
  "מארז עוגיות": "Cookie box",
  "קרואסון חמאה": "Butter croissant",
  "קרואסון שוקולד": "Chocolate croissant",
  "קינוח מוס": "Mousse dessert",
  "קינוח לוטוס": "Lotus dessert",
  "עוגיות שמש": "Sun cookies",
  "עוגיות חמאה": "Butter cookies",
  "עוגיות שוקולד": "Chocolate cookies",
  "עוגיות תות": "Strawberry cookies",
  "עוגיות וניל": "Vanilla cookies",
  "טארט תות": "Strawberry tart",
  "טארט לימון": "Lemon tart",
  "מאפין שוקולד": "Chocolate muffin",
  "חלה מתוקה": "Sweet challah",
};

/** Bakery Hebrew → English (whole words only). */
const PRODUCT_WORDS: Record<string, string> = {
  // product types
  עוגה: "cake",
  עוגת: "cake",
  עוגות: "cakes",
  עוגיות: "cookies",
  עוגייה: "cookie",
  עוגיית: "cookie",
  מארז: "box",
  מארזים: "boxes",
  קינוח: "dessert",
  קינוחים: "desserts",
  מאפה: "pastry",
  מאפים: "pastries",
  קרואסון: "croissant",
  קרואסונים: "croissants",
  טארט: "tart",
  טארטים: "tarts",
  פאי: "pie",
  מאפין: "muffin",
  מאפינס: "muffins",
  לחם: "bread",
  חלה: "challah",
  בורקס: "burekas",
  // flavors / themes
  שמש: "sun",
  ירח: "moon",
  כוכב: "star",
  כוכבים: "star",
  פרח: "flower",
  פרחים: "flower",
  לב: "heart",
  שוקולד: "chocolate",
  וניל: "vanilla",
  גבינה: "cheese",
  תות: "strawberry",
  תותים: "strawberry",
  פירות: "fruit",
  פרי: "fruit",
  לימון: "lemon",
  תפוז: "orange",
  דובדבן: "cherry",
  אוכמניות: "blueberry",
  פיסטוק: "pistachio",
  שקד: "almond",
  שקדים: "almond",
  אגוזים: "nut",
  קינמון: "cinnamon",
  חמאה: "butter",
  קרמל: "caramel",
  דבש: "honey",
  קוקוס: "coconut",
  לוטוס: "Lotus",
  אוראו: "Oreo",
  מוס: "mousse",
  גלידה: "ice cream",
  מספר: "number",
  אישי: "personal",
  אישית: "personal",
  חגיגי: "celebration",
  חגיגית: "celebration",
  מתנה: "gift",
  יום: "day",
  הולדת: "birthday",
  בריא: "healthy",
  בריאה: "healthy",
  בריאות: "healthy",
  טבעוני: "vegan",
  טבעונית: "vegan",
  מתוק: "sweet",
  מתוקה: "sweet",
  מתוקים: "sweet",
  בננה: "banana",
  בננות: "banana",
  ריבת: "jam",
  ריבה: "jam",
  שוקולדים: "chocolate",
  נטול: "without",
  מלח: "salt",
  מלוח: "savory",
  מלוחה: "savory",
  ללא: "without",
  סוכר: "sugar",
  גלוטן: "gluten",
};

/** "Type + rest" Hebrew patterns → English "rest type" (bakery word order). */
const PRODUCT_TYPE_PATTERNS: { pattern: RegExp; englishType: string }[] = [
  { pattern: /^עוגיות\s+(.+)$/, englishType: "cookies" },
  { pattern: /^עוגיי(?:ה|ת)\s+(.+)$/, englishType: "cookie" },
  { pattern: /^עוג(?:ה|ת)\s+(.+)$/, englishType: "cake" },
  { pattern: /^מארז\s+(.+)$/, englishType: "box" },
  { pattern: /^קינוח\s+(.+)$/, englishType: "dessert" },
  { pattern: /^מאפה\s+(.+)$/, englishType: "pastry" },
  { pattern: /^טארט\s+(.+)$/, englishType: "tart" },
  { pattern: /^מאפינס?\s+(.+)$/, englishType: "muffin" },
  { pattern: /^קרואסון\s+(.+)$/, englishType: "croissant" },
];

function titleCaseWords(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word.length <= 2 && word.toLowerCase() === "of"
        ? word
        : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function translateProductWords(value: string): string {
  return value
    .split(" ")
    .map((word) => {
      const known = PRODUCT_WORDS[word];
      if (known) return known;
      // Prefer keeping unknown Hebrew readable over bad letter-soup transliteration.
      return word;
    })
    .join(" ");
}

/**
 * Free offline helper for bakery product names.
 * Translates known Hebrew bakery terms; does not invent letter-by-letter "English".
 */
export function translateProductNameToEnglish(hebrewName: string): string {
  const name = cleanName(hebrewName);
  if (!name) return "";
  if (!/[\u0590-\u05ff]/.test(name)) return titleCaseWords(name);

  const exact = PRODUCT_NAME_PHRASES[name];
  if (exact) return exact;

  for (const { pattern, englishType } of PRODUCT_TYPE_PATTERNS) {
    const match = name.match(pattern);
    if (!match) continue;
    const rest = translateProductWords(match[1]);
    const candidate = titleCaseWords(`${rest} ${englishType}`);
    // Incomplete dictionary match → empty (admin / optional Gemini fills EN).
    if (/[\u0590-\u05ff]/.test(candidate)) return "";
    return candidate;
  }

  const wordOnly = translateProductWords(name);
  if (!/[\u0590-\u05ff]/.test(wordOnly)) {
    return titleCaseWords(wordOnly);
  }

  // Unknown full name: empty so the admin can fix EN manually
  // instead of producing misleading transliteration like "Aogiot shmsh".
  return "";
}

/**
 * Free, offline product-copy helper for admin.
 * No external AI API — NetFree-safe and zero cost.
 */
export function suggestProductDescriptions(
  input: ProductDescriptionInput,
): ProductDescriptionSuggestion {
  const nameHe = cleanName(input.nameHe) || "המוצר";
  const nameEn = cleanName(input.nameEn) || "This pastry";
  const category = cleanName(input.categoryLabel ?? "");
  const isBundle = input.productType === "bundle";
  const kind = detectKind(category, nameHe, nameEn);

  const he = buildHebrew({ nameHe, category, isBundle, kind });
  const en = buildEnglish({ nameEn, category, isBundle, kind });

  return { he, en, source: "local" };
}

function buildHebrew(opts: {
  nameHe: string;
  category: string;
  isBundle: boolean;
  kind: CategoryKind;
}): string {
  const { nameHe, category, isBundle, kind } = opts;
  const catBit = category ? ` בקטגוריית ${category}` : "";

  if (isBundle || kind === "box") {
    return [
      `${nameHe} — מארז מושקע${catBit} מבית Maison Malka בירושלים.`,
      "נבחר בקפידה לרגעים מתוקים, לאירוח ולמתנה.",
      "ההזמנה מאושרת ידנית — נשמח להתאים את המארז לאירוע שלכם.",
    ].join(" ");
  }

  switch (kind) {
    case "cake":
      return [
        `${nameHe} — עוגה ביתית${catBit} בגימור בוטיק של Maison Malka.`,
        "מתאימה לחגיגות, ימי הולדת ורגעים שרוצים להרגיש מיוחדים.",
        "ההכנה לפי הזמנה; נשמח לעזור בבחירת הגודל והטעמים.",
      ].join(" ");
    case "pastry":
      return [
        `${nameHe} — מאפה טרי${catBit} מהמטבח של Maison Malka בירושלים.`,
        "מושלם לקפה של בוקר, לפינוק קטן או לשולחן מתוק.",
        "מומלץ להזמין מראש כדי שנכין במיוחד עבורכם.",
      ].join(" ");
    case "dessert":
      return [
        `${nameHe} — קינוח עדין${catBit} בסגנון בוטיק של Maison Malka.`,
        "סיום מושלם לארוחה או פינוק עצמאי באמצע היום.",
        "ההזמנה עוברת אישור ידני בהתאם לזמינות.",
      ].join(" ");
    case "celebration":
      return [
        `${nameHe} — בחירה לחגיגות ואירועים${catBit}.`,
        "עיצוב ומתיקות שמתאימים לרגעים גדולים ולשולחנות מלאים.",
        "צרו קשר דרך ההזמנה ונשמח לייעץ על הכמויות.",
      ].join(" ");
    default:
      return [
        `${nameHe} — יצירה מתוקה${catBit} מבית Maison Malka, קונדיטוריה בוטיק בירושלים.`,
        "עשוי בקפידה, עם דגש על טעם ומראה.",
        "ההזמנה מתקבלת באתר ומאושרת ידנית לפני ההכנה.",
      ].join(" ");
  }
}

function buildEnglish(opts: {
  nameEn: string;
  category: string;
  isBundle: boolean;
  kind: CategoryKind;
}): string {
  const { nameEn, category, isBundle, kind } = opts;
  const catBit = category ? ` in our ${category} collection` : "";

  if (isBundle || kind === "box") {
    return [
      `${nameEn} — a thoughtfully composed gift box${catBit} from Maison Malka in Jerusalem.`,
      "Perfect for hosting, celebrations, and sweet surprises.",
      "Orders are reviewed by hand so we can prepare everything with care.",
    ].join(" ");
  }

  switch (kind) {
    case "cake":
      return [
        `${nameEn} — a boutique cake${catBit} from Maison Malka.`,
        "Made for birthdays, gatherings, and moments worth celebrating.",
        "Prepared to order; we are happy to help with size and flavours.",
      ].join(" ");
    case "pastry":
      return [
        `${nameEn} — a fresh pastry${catBit} from our Jerusalem kitchen.`,
        "Ideal with morning coffee, a small treat, or a sweet table.",
        "Please order ahead so we can bake it especially for you.",
      ].join(" ");
    case "dessert":
      return [
        `${nameEn} — a refined dessert${catBit} in Maison Malka’s boutique style.`,
        "A lovely finish to a meal or a quiet mid-day indulgence.",
        "Each order is manually approved according to availability.",
      ].join(" ");
    case "celebration":
      return [
        `${nameEn} — made for celebrations and special events${catBit}.`,
        "Designed to look beautiful and taste memorable on a full table.",
        "Share your needs in the order notes and we will guide quantities.",
      ].join(" ");
    default:
      return [
        `${nameEn} — a sweet creation${catBit} from Maison Malka, a boutique pastry atelier in Jerusalem.`,
        "Crafted with care for flavour and presentation.",
        "Orders are placed online and approved manually before preparation.",
      ].join(" ");
  }
}
