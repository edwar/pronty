import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage, sendWhatsAppButtonMessage } from "./index"

type ConversationState =
  | "idle"
  | "waiting_confirmation"
  | "active"
  | "inactive"
  | "waiting_check_in"

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
  let conversation = conversations.get(phone)

  if (!conversation) {
    conversation = {
      driverId: driver.id,
      phone,
      state: "idle",
      lastActivity: new Date(),
    }
    conversations.set(phone, conversation)
  }

  conversation.lastActivity = new Date()

  if (normalizedMessage === "hola" || normalizedMessage === "inicio" || normalizedMessage === "start") {
    conversation.state = "waiting_confirmation"
    await sendWhatsAppButtonMessage(
      phone,
      `¡Hola ${driver.fullName}! ¿Quieres empezar a trabajar?`,
      [
        { id: "activate", title: "Sí, activarme" },
        { id: "deactivate", title: "No, estoy descansando" },
      ]
    )
    return
  }

  if (normalizedMessage === "activate" || normalizedMessage === "sí" || normalizedMessage === "si" || normalizedMessage === "estoy activo") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: true, isActive: true },
    })

    conversation.state = "active"

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! Ya estás activo y recibirás pedidos. Te enviaré un mensaje cada 30 minutos para confirmar que sigues trabajando.`,
    })
    return
  }

  if (normalizedMessage === "deactivate" || normalizedMessage === "no" || normalizedMessage === "estoy descansando") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: false, isActive: false },
    })

    conversation.state = "inactive"

    await sendWhatsAppMessage({
      to: phone,
      message: `Entendido ${driver.fullName}. Has sido desactivado. Cuando quieras volver a trabajar, envíame "Hola".`,
    })
    return
  }

  if (normalizedMessage === "check_in" || normalizedMessage === "sigo aquí" || normalizedMessage === "sigo trabajando") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: true, isActive: true },
    })

    conversation.state = "active"
    conversation.lastActivity = new Date()

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! Sigue recibiendo pedidos. Te volveré a contactar en 30 minutos.`,
    })
    return
  }

  if (normalizedMessage === "check_out" || normalizedMessage === "ya no" || normalizedMessage === "descanso") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: false, isActive: false },
    })

    conversation.state = "inactive"

    await sendWhatsAppMessage({
      to: phone,
      message: `Ok ${driver.fullName}, has sido desactivado. Descansa bien. Cuando quieras volver, envíame "Hola".`,
    })
    return
  }

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

  // Handle order accept/decline buttons
  if (buttonId.startsWith("accept_")) {
    const orderId = buttonId.replace("accept_", "")
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    // Accept the order
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

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Pedido #${order.orderNumber} aceptado! Dirígete a:\n\n📍 Recogida: ${order.pickupAddress}\n🏠 Entrega: ${order.deliveryAddress}`,
    })

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

    // Decline the order - put it back to searching
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

  // Handle activation buttons
  if (buttonId === "activate") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: true, isActive: true },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! Ya estás activo y recibirás pedidos.`,
    })
    return
  }

  if (buttonId === "deactivate") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: false, isActive: false },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `Has sido desactivado. Cuando quieras volver a trabajar, envíame "Hola".`,
    })
    return
  }

  // Handle check-in buttons
  if (buttonId === "check_in") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: true, isActive: true },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `¡Perfecto ${driver.fullName}! Sigue recibiendo pedidos.`,
    })
    return
  }

  if (buttonId === "check_out") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { isAvailable: false, isActive: false },
    })

    await sendWhatsAppMessage({
      to: phone,
      message: `Has sido desactivado. Descansa bien.`,
    })
    return
  }

  console.log(`[WhatsApp] Unknown button: ${buttonId}`)
}

export async function sendCheckInMessages() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

  for (const [phone, conversation] of conversations.entries()) {
    if (conversation.state === "active" && conversation.lastActivity < thirtyMinutesAgo) {
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
