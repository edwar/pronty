import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage, sendWhatsAppButtonMessage } from "./index"

type ConversationState =
  | "idle"
  | "active"
  | "inactive"
  | "waiting_check_in"
  | "waiting_pickup_confirm"
  | "waiting_delivery_confirm"

interface DriverConversation {
  driverId: string
  phone: string
  state: ConversationState
  lastActivity: Date
}

const conversations = new Map<string, DriverConversation>()

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

function getConversation(phone: string, driverId: string): DriverConversation {
  let conversation = conversations.get(phone)
  if (!conversation) {
    conversation = {
      driverId,
      phone,
      state: "idle",
      lastActivity: new Date(),
    }
    conversations.set(phone, conversation)
  }
  return conversation
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
  const conversation = getConversation(phone, driver.id)
  conversation.lastActivity = new Date()

  // Activación inicial
  if (normalizedMessage === "hola" || normalizedMessage === "inicio" || normalizedMessage === "start") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: true, isActive: true },
    })

    conversation.state = "active"

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Hola ${driver.fullName}! ✅ Estás activo y recibirás pedidos.`,
    })
    return
  }

  // Check-in: sigo aquí
  if (normalizedMessage === "sigo" || normalizedMessage === "sigo aquí" || normalizedMessage === "sigo trabajando") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: true, isActive: true },
    })

    conversation.state = "active"
    conversation.lastActivity = new Date()

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
      data: { isAvailable: false, isActive: false },
    })

    conversation.state = "inactive"

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

  const conversation = getConversation(phone, driver.id)

  // === ACTIVACIÓN / DESACTIVACIÓN ===
  if (buttonId === "activate") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: true, isActive: true },
    })
    conversation.state = "active"

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! ✅ Estás activo y recibirás pedidos.`,
    })
    return
  }

  if (buttonId === "deactivate") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: false, isActive: false },
    })
    conversation.state = "inactive"

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
      data: { isAvailable: true, isActive: true },
    })
    conversation.state = "active"
    conversation.lastActivity = new Date()

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! ✅ Sigue recibiendo pedidos.`,
    })
    return
  }

  if (buttonId === "check_out") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: false, isActive: false },
    })
    conversation.state = "inactive"

    await sendWhatsAppMessage({
      to: phone,
      message: `Has sido desactivado. Descansa bien.`,
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

    conversation.state = "waiting_pickup_confirm"

    // Enviar ubicación de recogida con botón para confirmar
    await sendWhatsAppButtonMessage(
      phone,
      `✅ Pedido #${order.orderNumber} aceptado\n\n📍 *Recogida:* ${order.pickupAddress}\n${order.pickupNotes ? `📝 Nota: ${order.pickupNotes}\n` : ""}\n🏠 *Entrega:* ${order.deliveryAddress}\n💰 *Tarifa:* $${Number(order.totalFee).toLocaleString("es-CO")}`,
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

    conversation.state = "waiting_delivery_confirm"

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

    conversation.state = "active"

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

    // NO reembolsar crédito al comercio (el viaje se hizo)
    // El comercio ya pagó cuando creó el pedido

    conversation.state = "active"

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
  const threshold = new Date(Date.now() - 30 * 60 * 1000)

  for (const [phone, conversation] of conversations.entries()) {
    if (conversation.state === "active" && conversation.lastActivity < threshold) {
      conversation.state = "waiting_check_in"

      await sendWhatsAppButtonMessage(
        phone,
        "¿Sigues trabajando? Confirma para seguir recibiendo pedidos.",
        [
          { id: "check_in", title: "Sigo aquí" },
          { id: "check_out", title: "Ya no" },
        ]
      )

      conversation.lastActivity = new Date()
    }
  }
}

export function getConversationState(phone: string) {
  return conversations.get(phone)
}

export function getActiveDriversCount() {
  let count = 0
  for (const conversation of conversations.values()) {
    if (conversation.state === "active") count++
  }
  return count
}
