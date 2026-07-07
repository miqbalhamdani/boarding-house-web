import { TenantBillDetail } from "@/components/tenant/tenant-bill-detail"

export default async function TenantBillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TenantBillDetail id={id} />
}
