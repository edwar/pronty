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

export async function handleDriverMessage(phone: string, message: string) {
  const driver = await prisma.driver.findUnique({
    where: { phone },
    include: { user: true },
  })

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
