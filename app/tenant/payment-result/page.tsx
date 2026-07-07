import { TenantPaymentResult } from "@/components/tenant/tenant-payment-result"

export default async function TenantPaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ bill_id?: string }>
}) {
  const { bill_id } = await searchParams
  return <TenantPaymentResult billId={bill_id} />
}
