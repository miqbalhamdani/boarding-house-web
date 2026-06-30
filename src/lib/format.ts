import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/** Format an ISO date string as a human-readable date, e.g. "Jun 27, 2026". */
export function formatDate(date: string | number | Date): string {
  return dayjs(date).format("MMM D, YYYY");
}

/** Format a date as relative time from now, e.g. "3 days ago". */
export function fromNow(date: string | number | Date): string {
  return dayjs(date).fromNow();
}

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format an integer rupiah amount as IDR, e.g. 2000000 → "Rp 2.000.000". */
export function formatIDR(amount: number): string {
  return idrFormatter.format(amount);
}

export { dayjs };
