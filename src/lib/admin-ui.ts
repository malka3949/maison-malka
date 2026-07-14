/** Boutique Noir & Gold — Direction A from DOCS/ux.md */
export const adminUi = {
  page: "min-h-screen bg-mm-bg text-mm-text",
  header: "border-b border-stone-200 bg-white shadow-sm",
  brand: "font-heading text-xl font-semibold tracking-wide text-mm-primary",
  navLink:
    "cursor-pointer rounded-md px-3 py-1.5 text-sm text-mm-secondary transition-colors duration-200 hover:bg-stone-100",
  h1: "font-heading text-3xl font-semibold text-mm-primary",
  h2: "font-heading text-lg font-medium text-mm-primary",
  muted: "text-mm-secondary",
  card: "rounded-lg border border-stone-200 bg-white p-6 shadow-sm",
  cardInteractive:
    "cursor-pointer rounded-lg border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-mm-accent hover:shadow-md",
  section: "space-y-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm",
  input:
    "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-mm-text transition-colors duration-200 focus:border-mm-cta focus:outline-none focus:ring-2 focus:ring-mm-cta/20",
  inputSm:
    "rounded-md border border-stone-300 bg-white px-2 py-1 text-sm transition-colors duration-200 focus:border-mm-cta focus:outline-none focus:ring-2 focus:ring-mm-cta/20",
  select: "rounded-md border border-stone-300 bg-white px-2 py-1 text-sm text-mm-text",
  btnPrimary:
    "cursor-pointer rounded-md bg-mm-cta px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-mm-cta-hover disabled:cursor-not-allowed disabled:opacity-60",
  btnPrimaryLg:
    "w-full cursor-pointer rounded-md bg-mm-cta px-4 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-mm-cta-hover disabled:cursor-not-allowed disabled:opacity-60",
  btnSecondary:
    "cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 text-sm text-mm-secondary transition-colors duration-200 hover:bg-stone-50",
  btnSm:
    "cursor-pointer rounded-md bg-mm-primary px-2 py-1 text-sm text-white transition-colors duration-200 hover:bg-mm-secondary",
  link: "cursor-pointer text-sm text-mm-cta transition-colors duration-200 hover:text-mm-cta-hover hover:underline",
  table: "overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm",
  tableHead: "bg-mm-bg text-mm-secondary",
  tableRow: "border-t border-stone-100 transition-colors duration-150 hover:bg-stone-50/50",
  badgeOn: "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800",
  badgeOff: "rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-600",
  price: "font-medium text-mm-accent",
  loginCard: "w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 shadow-md",
  loginShell: "flex min-h-screen items-center justify-center bg-mm-bg px-4",
} as const;
