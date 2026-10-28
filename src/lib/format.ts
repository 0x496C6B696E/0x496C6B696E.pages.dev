const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

/** "23 Oct 2026" or an empty string for invalid input. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFormatter.format(d);
}

/** "May 2023" */
export function formatMonth(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : monthFormatter.format(d);
}

/** Whole years between two dates, never negative. */
export function yearsBetween(fromIso: string, to: Date = new Date()): number {
  const from = new Date(fromIso);
  if (Number.isNaN(from.getTime())) return 0;
  let years = to.getFullYear() - from.getFullYear();
  const beforeAnniversary = to.getMonth() < from.getMonth() || (to.getMonth() === from.getMonth() && to.getDate() < from.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(0, years);
}

/** 1234 -> "1,234" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
