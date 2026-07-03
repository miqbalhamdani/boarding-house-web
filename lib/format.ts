const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

// Formats an integer IDR amount (money is stored as whole rupiah).
export function formatIDR(amount: number): string {
  return idrFormatter.format(amount)
}
