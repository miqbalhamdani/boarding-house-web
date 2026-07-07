const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

// Formats an integer IDR amount (money is stored as whole rupiah).
export function formatIDR(amount: number): string {
  return idrFormatter.format(amount)
}

// RFC3339 timestamp → "10 July 2026, 17.00" (id-ID locale). Falls back to the
// raw string when unparseable and "—" when empty.
export function formatDateTime(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
