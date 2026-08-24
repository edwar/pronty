import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage, sendWhatsAppButtonMessage } from "./index"

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, "")
}

async function findDriverByPhone(phone: string) {
  const normalized = normalizePhone(phone)
  const last10 = normalized.slice(-10)

  const drivers = await prisma.driver.findMany({
    include: { user: true },
  })

  return drivers.find(d => {
    const dn = normalizePhone(d.phone)
    return dn === normalized || dn.endsWith(last10) || normalized.endsWith(dn.replace(/^\+/, ""))
  }) || null
}

async function getCheckInIntervalMinutes(): Promise<number> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "global_settings" },
    })
    const settings = config?.value as Record<string, unknown>
    const whatsapp = settings?.whatsapp as Record<string, unknown> | undefined
    return (whatsapp?.checkInIntervalMinutes as number) || 1600
  } catch {
    return 1600
  }
}

export async function handleDriverMessage(phone: string, message: string) {
  const driver = await findDriverByPhone(phone)

  if (!driver) {
    await sendWhatsAppMessage({
      to: phone,
      message: "Hola, no estás registrado como domiciliario en Pronty.",
    })
    return
  }

  const normalizedMessage = message.toLowerCase().trim()
  const now = new Date()

  // Primera activación: needs_activation → active
  if (driver.conversationStage === "needs_activation") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: true,
        isActive: true,
        conversationStage: "active",
        conversationStartedAt: now,
        conversationLastActivity: now,
        totalConversations: { increment: 1 },
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Bienvenido ${driver.fullName}! ✅ Tu cuenta está activa y lista para recibir pedidos.\n\nCada vez que recibas un pedido, te llegará por aquí. ¡Éxito!`,
    })
    return
  }

  // Actualizar última actividad
  await prisma.driver.update({
    where: { id: driver.id },
    data: { conversationLastActivity: now },
  })

  // Si estaba en warning o expired, reiniciar conversación
  if (driver.conversationStage === "warning" || driver.conversationStage === "expired") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        conversationStage: "active",
        conversationStartedAt: now,
        isAvailable: true,
        isActive: true,
        totalConversations: { increment: 1 },
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Hola de nuevo ${driver.fullName}! ✅ Nueva conversación iniciada. Estás activo y recibirás pedidos.`,
    })
    return
  }

  // Check-in: sigo aquí
  if (normalizedMessage === "sigo" || normalizedMessage === "sigo aquí" || normalizedMessage === "sigo trabajando") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: true,
        isActive: true,
        conversationStage: "active",
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! Sigue recibiendo pedidos. ✅`,
    })
    return
  }

  // Check-out: ya no
  if (normalizedMessage === "no" || normalizedMessage === "ya no" || normalizedMessage === "descanso") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: false,
        isActive: false,
        conversationStage: "inactive",
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `Ok ${driver.fullName}, has sido desactivado. Cuando quieras volver a trabajar, envíame "Hola".`,
    })
    return
  }

  // Texto no reconocido
  await sendWhatsAppButtonMessage(
    phone,
    "No entendí tu mensaje. ¿Qué deseas hacer?",
    [
      { id: "activate", title: "Activarme" },
      { id: "deactivate", title: "Desactivarme" },
    ]
  )
}

export async function handleDriverButtonResponse(phone: string, buttonId: string) {
  console.log(`[WhatsApp] Button response from ${phone}: ${buttonId}`)

  const driver = await findDriverByPhone(phone)

  if (!driver) {
    console.log(`[WhatsApp] Driver not found for phone: ${phone}`)
    return
  }

  const now = new Date()

  // === ACTIVACIÓN / DESACTIVACIÓN ===
  if (buttonId === "activate") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: true,
        isActive: true,
        conversationStage: "active",
        conversationStartedAt: driver.conversationStartedAt || now,
        conversationLastActivity: now,
        ...(driver.conversationStage === "needs_activation" ? { totalConversations: { increment: 1 } } : {}),
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! ✅ Estás activo y recibirás pedidos.`,
    })
    return
  }

  if (buttonId === "deactivate") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: false,
        isActive: false,
        conversationStage: "inactive",
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `Has sido desactivado. Cuando quieras volver a trabajar, envíame "Hola".`,
    })
    return
  }

  // === CHECK-IN ===
  if (buttonId === "check_in") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: true,
        isActive: true,
        conversationStage: "active",
        conversationLastActivity: now,
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! ✅ Sigue recibiendo pedidos.`,
    })
    return
  }

  if (buttonId === "check_out") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: false,
        isActive: false,
        conversationStage: "inactive",
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `Has sido desactivado. Descansa bien.`,
    })
    return
  }

  // === RENOVAR SESIÓN ===
  if (buttonId === "renew_session") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        conversationStage: "active",
        conversationStartedAt: now,
        conversationLastActivity: now,
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Sesión renovada! ✅ Sigue recibiendo pedidos.`,
    })
    return
  }

  // === ACEPTAR / RECHAZAR PEDIDO ===
  if (buttonId.startsWith("accept_")) {
    const orderId = buttonId.replace("accept_", "")

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { commerce: true },
    })

    if (!order) {
      console.log(`[WhatsApp] Order not found: ${orderId}`)
      return
    }

    if (order.status !== "ASSIGNING_DIRECT" && order.status !== "ASSIGNING_BROADCAST") {
      await sendWhatsAppMessage({
        to: phone,
        message: `El pedido #${order.orderNumber} ya no está disponible.`,
      })
      return
    }

    // Aceptar el pedido
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "ACCEPTED",
        assignedAt: new Date(),
        statusLogs: {
          create: {
            from: order.status,
            to: "ACCEPTED",
            note: `Pedido aceptado por ${driver.fullName} via WhatsApp`,
            actorId: driver.userId,
          },
        },
      },
    })

    // Enviar ubicación de recogida con botón para confirmar
    const pickupMapLink = order.pickupLat && order.pickupLng
      ? `\n🗺️ *Ubicación:* https://www.google.com/maps?q=${order.pickupLat},${order.pickupLng}`
      : ""
    const deliveryMapLink = order.deliveryLat && order.deliveryLng
      ? `\n🗺️ *Ubicación entrega:* https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`
      : ""

    await sendWhatsAppButtonMessage(
      phone,
      `✅ Pedido #${order.orderNumber} aceptado\n\n📍 *Recogida:* ${order.pickupAddress}${pickupMapLink}\n${order.pickupNotes ? `📝 Nota: ${order.pickupNotes}\n` : ""}\n🏠 *Entrega:* ${order.deliveryAddress}${deliveryMapLink}\n💰 *Tarifa:* $${Number(order.totalFee).toLocaleString("es-CO")}${order.distanceKm ? `\n📏 *Distancia:* ${Number(order.distanceKm).toFixed(1)} km` : ""}`,
      [
        { id: `pickup_${orderId}`, title: "Confirmar Recogida" },
      ]
    )

    console.log(`[WhatsApp] Order ${order.orderNumber} accepted by ${driver.fullName}`)
    return
  }

  if (buttonId.startsWith("decline_")) {
    const orderId = buttonId.replace("decline_", "")

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      console.log(`[WhatsApp] Order not found: ${orderId}`)
      return
    }

    // Rechazar el pedido - vuelve a buscar
    await prisma.order.update({
      where: { id: orderId },
      data: {
        driverId: null,
        status: "ASSIGNING_BROADCAST",
        statusLogs: {
          create: {
            from: order.status,
            to: "ASSIGNING_BROADCAST",
            note: `Pedido rechazado por ${driver.fullName} via WhatsApp`,
            actorId: driver.userId,
          },
        },
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `Has rechazado el pedido #${order.orderNumber}. Seguiremos buscando domiciliario.`,
    })

    console.log(`[WhatsApp] Order ${order.orderNumber} declined by ${driver.fullName}`)
    return
  }

  // === CONFIRMAR RECOGIDA ===
  if (buttonId.startsWith("pickup_")) {
    const orderId = buttonId.replace("pickup_", "")

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      console.log(`[WhatsApp] Order not found: ${orderId}`)
      return
    }

    // Actualizar estado a IN_TRANSIT
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "IN_TRANSIT",
        pickedUpAt: new Date(),
        statusLogs: {
          create: {
            from: "ACCEPTED",
            to: "IN_TRANSIT",
            note: `Recogida confirmada por ${driver.fullName} via WhatsApp`,
            actorId: driver.userId,
          },
        },
      },
    })

    // Preguntar si entregó
    await sendWhatsAppButtonMessage(
      phone,
      `📦 Pedido #${order.orderNumber} recogido\n\n¿Se completó la entrega?`,
      [
        { id: `delivered_${orderId}`, title: "Sí, entregado" },
        { id: `failed_${orderId}`, title: "No se pudo entregar" },
      ]
    )

    console.log(`[WhatsApp] Order ${order.orderNumber} pickup confirmed by ${driver.fullName}`)
    return
  }

  // === CONFIRMAR ENTREGA ===
  if (buttonId.startsWith("delivered_")) {
    const orderId = buttonId.replace("delivered_", "")

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { commerce: true },
    })

    if (!order) {
      console.log(`[WhatsApp] Order not found: ${orderId}`)
      return
    }

    // Marcar como entregado
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
        statusLogs: {
          create: {
            from: "IN_TRANSIT",
            to: "DELIVERED",
            note: `Entrega confirmada por ${driver.fullName} via WhatsApp`,
            actorId: driver.userId,
          },
        },
      },
    })

    // Crear ganancia para el domiciliario
    const commission = Number(order.baseFee) * 0.2
    const netEarning = Number(order.baseFee) - commission

    await prisma.driverEarning.create({
      data: {
        driverId: driver.id,
        orderId: orderId,
        baseFee: order.baseFee,
        commission: commission,
        netEarning: netEarning,
        status: "PENDING",
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `✅ ¡Pedido #${order.orderNumber} entregado con éxito!\n\n💰 Tu ganancia: $${netEarning.toLocaleString("es-CO")}\n\nGracias por trabajar con Pronty.`,
    })

    console.log(`[WhatsApp] Order ${order.orderNumber} delivered by ${driver.fullName}`)
    return
  }

  // === FALLÓ LA ENTREGA ===
  if (buttonId.startsWith("failed_")) {
    const orderId = buttonId.replace("failed_", "")

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { commerce: true },
    })

    if (!order) {
      console.log(`[WhatsApp] Order not found: ${orderId}`)
      return
    }

    // Marcar como entrega fallida
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "FAILED_DELIVERY",
        cancelledAt: new Date(),
        cancelReason: "No se pudo entregar",
        statusLogs: {
          create: {
            from: "IN_TRANSIT",
            to: "FAILED_DELIVERY",
            note: `Entrega fallida reportada por ${driver.fullName} via WhatsApp`,
            actorId: driver.userId,
          },
        },
      },
    })

    // Crear ganancia para el domiciliario (el viaje se hizo)
    const commission = Number(order.baseFee) * 0.2
    const netEarning = Number(order.baseFee) - commission

    await prisma.driverEarning.create({
      data: {
        driverId: driver.id,
        orderId: orderId,
        baseFee: order.baseFee,
        commission: commission,
        netEarning: netEarning,
        status: "PENDING",
      },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `📦 Pedido #${order.orderNumber} marcado como "No entregado"\n\n💰 Tu ganancia: $${netEarning.toLocaleString("es-CO")}\n\nEl comercio será notificado.`,
    })

    console.log(`[WhatsApp] Order ${order.orderNumber} delivery failed by ${driver.fullName}`)
    return
  }

  console.log(`[WhatsApp] Unknown button: ${buttonId}`)
}

export async function sendCheckInMessages() {
  const intervalMinutes = await getCheckInIntervalMinutes()
  const warningMinutes = Math.max(intervalMinutes * 1.5, 60)
  const threshold = new Date(Date.now() - intervalMinutes * 60 * 1000)
  const warningThreshold = new Date(Date.now() - warningMinutes * 60 * 1000)

  // Buscar drivers activos que necesiten check-in
  const activeDrivers = await prisma.driver.findMany({
    where: {
      conversationStage: "active",
      isActive: true,
      conversationLastActivity: { lt: threshold },
    },
    include: { user: true },
  })

  for (const driver of activeDrivers) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { conversationStage: "waiting_renewal" },
    })

    await sendWhatsAppButtonMessage(
      driver.phone,
      `¿Sigues trabajando, ${driver.fullName}? Confirma para seguir recibiendo pedidos.`,
      [
        { id: "check_in", title: "Sigo aquí" },
        { id: "check_out", title: "Ya no" },
      ]
    )
  }

  // Buscar drivers en waiting_renewal que necesiten advertencia
  const renewalDrivers = await prisma.driver.findMany({
    where: {
      conversationStage: "waiting_renewal",
      isActive: true,
      conversationLastActivity: { lt: warningThreshold },
    },
    include: { user: true },
  })

  for (const driver of renewalDrivers) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { conversationStage: "warning" },
    })

    await sendWhatsAppButtonMessage(
      driver.phone,
      `⚠️ ${driver.fullName}, tu sesión está por expirar. Si no la renuevas, deberás iniciar una nueva conversación.`,
      [
        { id: "renew_session", title: "Renovar sesión" },
        { id: "check_out", title: "Descansar" },
      ]
    )
  }

  // Buscar drivers en warning que hayan expirado (2x el intervalo)
  const expiredThreshold = new Date(Date.now() - intervalMinutes * 2 * 60 * 1000)
  const expiredDrivers = await prisma.driver.findMany({
    where: {
      conversationStage: "warning",
      isActive: true,
      conversationLastActivity: { lt: expiredThreshold },
    },
  })

  for (const driver of expiredDrivers) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        conversationStage: "expired",
        isActive: false,
        isAvailable: false,
      },
    })

    await sendWhatsAppMessage({
      to: driver.phone,
      message: `Tu sesión ha expirado. Para volver a trabajar, envía cualquier mensaje y se iniciará una nueva conversación.`,
    })
  }
}

export function getActiveDriversCount() {
  return prisma.driver.count({
    where: {
      isActive: true,
      conversationStage: "active",
    },
  })
}
