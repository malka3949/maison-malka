# Maison Malka — תוכנית פאזות

מסמך זה מפרק את הפרויקט לפאזות פיתוח מסודרות, על בסיס [Maison-Malka-PRD.md](../Maison-Malka-PRD.md).

## מבט כללי

| קבוצה | פאזות | מטרה |
|---|---|---|
| **MVP (שלב 1)** | 01–09 | אתר מותג, קטלוג, הזמנות ואזור מנהל בסיסי — ירושלים בלבד |
| **Post-MVP גלים** | ראו [12-post-mvp-waves-roadmap.md](./12-post-mvp-waves-roadmap.md) | Production → המרה → שימור → סקייל → כבד/נדחה |
| **צמיחה (גלים 1–2)** | 10 | קופונים, תשלום, המלצות, היסטוריה; ואז WhatsApp, דוחות, עונתיות, נאמנות פשוטה |
| **התרחבות (גל 3)** | 11 | אזורי משלוח, cap יומי, אוטומציות שיווק |
| **קמפיין מייל ידני** | 12 | דיוור מהאדמין ללקוחות עם הסכמה (Team Yuri Phase 8) |
| **כבד (גל 4)** | 13 | מלאי אוטומטי, CRM, התאמות מתקדמות, ניהול ייצור — backlog |

## עקרונות

- כל פאזה מסתיימת בתוצאה **ניתנת לבדיקה** — אפשר לראות או להריץ משהו קונקרטי.
- פאזות נבנות **בסדר** — כל פאזה תלויה בפאזות שקדמו לה.
- אחרי MVP: סדר הגלים ב־[12-post-mvp-waves-roadmap.md](./12-post-mvp-waves-roadmap.md) הוא מקור האמת.
- שאלות פתוחות מה-PRD מסומנות בכל פאזה רלוונטית.

## מפת תלויות (MVP)

```text
01 Foundation ──► 02 Catalog ──► 03 Product Pages
                                        │
                                        ▼
                                   04 Cart
                                        │
                                        ▼
                                   05 Auth
                                        │
                                        ▼
                              06 Checkout & Orders
                                   ╱         ╲
                                  ▼           ▼
                          07 Admin Products  08 Admin Orders
                                  ╲           ╱
                                   ▼         ▼
                              09 i18n + Trust/Legal & Launch
```

## מפת תלויות (Post-MVP)

```text
Wave 0 Production (TY Phase 4)
        │
        ▼
Marketing email campaigns (TY Phase 8)  ← product doc 12
        │
        ▼
Wave 1+ Conversion / Retention (later TY)  ← product docs 10–11
        │
        ▼
Wave 4 Heavy deferred (later)  ← product doc 13
```

> **Team Yuri:** Trust & Legal בוצע כ־`PHASE=7` (מקופל ב־09). **Phase 8 בפועל** = קמפיין מייל שיווקי ידני → [12-marketing-email-campaigns.md](./12-marketing-email-campaigns.md). Production = חידוש Phase 4. פאזת מוצר 08 נשארת ניהול הזמנות.

## רשימת פאזות

| # | קובץ | שם | תוצאה ניתנת לבדיקה |
|---|---|---|---|
| 01 | [01-foundation-and-brand.md](./01-foundation-and-brand.md) | תשתית ואתר מותג | האתר עולה, דף בית מעוצב מוצג |
| 02 | [02-product-catalog.md](./02-product-catalog.md) | קטלוג מוצרים | רשימת מוצרים ניתנת לצפייה |
| 03 | [03-product-pages.md](./03-product-pages.md) | עמודי מוצר | כל מוצר עם תמונה, תיאור ומחיר |
| 04 | [04-shopping-cart.md](./04-shopping-cart.md) | עגלת קניות | הוספה, עדכון והסרה מהעגלה |
| 05 | [05-authentication.md](./05-authentication.md) | הרשמה והתחברות | משתמש נרשם ומתחבר |
| 06 | [06-checkout-and-orders.md](./06-checkout-and-orders.md) | תהליך הזמנה | הזמנה מלאה עם אישור |
| 07 | [07-admin-products.md](./07-admin-products.md) | ניהול מוצרים (מנהל) | מנהל מוסיף ועורך מוצרים |
| 08 | [08-admin-orders.md](./08-admin-orders.md) | ניהול הזמנות (מנהל) | מנהל רואה ומנהל הזמנות |
| 09 | [09-i18n-and-mvp-launch.md](./09-i18n-and-mvp-launch.md) | רב-לשוניות, אמון/משפט והשקה | עברית/אנגלית, Trust & Legal, MVP מוכן לייצור |
| 10 | [10-growth-and-retention.md](./10-growth-and-retention.md) | צמיחה ושימור (גלים 1–2) | קופונים/תשלום/המלצות/היסטוריה; דוחות/נאמנות/הודעות |
| 11 | [11-scale-and-automation.md](./11-scale-and-automation.md) | התרחבות ואוטומציה (גל 3) | אזורים, cap, אוטומציות (לא קמפיין ידני) |
| 12 | [12-marketing-email-campaigns.md](./12-marketing-email-campaigns.md) | קמפיין מייל שיווקי | מנהלת שולחת פרסומת ללקוחות עם הסכמה (TY Phase 8) |
| 13 | [13-deferred-heavy-ops.md](./13-deferred-heavy-ops.md) | תפעול כבד (גל 4) | backlog — רק עם צורך מוכח |

## קשר ל-Team Yuri

תיקייה זו היא **תכנון מוצר** (מה בונים ובאיזה סדר).

| גל / נושא מוצר | Team Yuri | סטטוס |
|---|---|---|
| Wave 0 Production | Phase 4 | PARKED — לחדש לפני go-live |
| קמפיין מייל ידני (פאזת מוצר 12) | Phase 8 | In implementation / review |
| Wave 2 Retention/Ops | Phase 9+ | Planned |
| Wave 3 Scale/Automation | later | Planned (אוטומציות; לא קמפיין ידני) |
| Wave 4 Heavy | later | Backlog |

תהליך הפיתוח המנוהל (`team-Yuri/`) רץ רק אחרי אישור משתמש לכל גל — אז נוצרים `arch-phase<N>.md` / `manager-phase<N>.md` / `dev-phase<N>.md`.

## החלטות שדורשות אישור לפני פיתוח

| נושא | השפעה | פאזה / גל |
|---|---|---|
| אישור ידני להזמנה לפני אישור סופי? | זרימת checkout ומסך מנהל | 06, 08 |
| קטגוריות מיוחדות / עונתיות / מארזים? | מבנה קטלוג ומסכי מנהל | 02, 07, גל 2 |
| ספק תשלום (Stripe, ספק ישראלי, אחר?) | אינטגרציית תשלום | גל 1 |
| WhatsApp מול SMS | ערוץ התראות | גל 2 |
| סטאק טכנולוגי (Next.js, וכו') | תשתית פרויקט | 01 |
