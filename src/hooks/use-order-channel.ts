"use client"

import { useEffect, useCallback } from "react"
import { pusherClient } from "@/lib/pusher-client"

type OrderEvent = {
  orderId: string
  orderNumber: string
  status: string
  driverName?: string
}

export function useOrderChannel(
  commerceId: string,
  onOrderUpdate: (event: OrderEvent) => void
) {
  const handleOrderUpdate = useCallback(
    (event: OrderEvent) => {
      onOrderUpdate(event)
    },
    [onOrderUpdate]
  )

  useEffect(() => {
    if (!commerceId) return

    const channel = pusherClient.subscribe(`commerce-${commerceId}`)

    channel.bind("order-updated", handleOrderUpdate)

    return () => {
      channel.unbind("order-updated", handleOrderUpdate)
      pusherClient.unsubscribe(`commerce-${commerceId}`)
    }
  }, [commerceId, handleOrderUpdate])
}
