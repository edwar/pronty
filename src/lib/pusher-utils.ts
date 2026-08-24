import { pusher } from "@/lib/pusher-server"

export async function triggerOrderUpdate(commerceId: string, data: {
  orderId: string
  orderNumber: string
  status: string
  driverName?: string
}) {
  try {
    await pusher.trigger(`commerce-${commerceId}`, "order-updated", data)
  } catch (error) {
    console.error("Pusher trigger error:", error)
  }
}
