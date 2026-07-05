import { RoomDetail } from "@/components/rooms/room-detail"

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RoomDetail id={id} />
}
