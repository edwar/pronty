import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage, sendWhatsAppButtonMessage } from "./index"
import { sendEmail, getDeliveryConfirmationEmail } from "@/lib/email"

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
    return
  }

  const normalizedMessage = message.toLowerCase().trim()

  // Primera activación: needs_activation → active
  if (driver.conversationStage === "needs_activation") {
    if (!driver.isApproved) {
      return
    }

    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: true,
        isActive: true,
        conversationStage: "active",
        totalConversations: { increment: 1 },
      },
    })

    // Enviar email de confirmación de activación
    if (driver.user?.email) {
      await sendEmail({
        to: driver.user.email,
        subject: "¡Tu cuenta de Pronty está activa!",
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Pronty</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Delivery Profesional</p>
              </div>
              <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">¡Hola ${driver.fullName}! ✅</h2>
                <p style="margin: 0 0 24px; color: #64748b; font-size: 15px;">
                  Tu cuenta de domiciliario está activa y lista para recibir pedidos.
                </p>
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                  Cada vez que recibas un pedido, te llegará por WhatsApp. ¡Éxito!
                </p>
              </div>
              <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 Pronty.</p>
            </body>
          </html>
        `,
      })
    }

    return
  }

  // Activar: "empece" / "activo" / "trabajar"
  if (normalizedMessage === "empece" || normalizedMessage === "activo" || normalizedMessage === "trabajar") {
    if (!driver.isApproved) {
      return
    }

    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: true,
        isActive: true,
        conversationStage: "active",
      },
    })
    return
  }

  // Desactivar: "pare" / "inactivo" / "descanso"
  if (normalizedMessage === "pare" || normalizedMessage === "inactivo" || normalizedMessage === "descanso") {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isAvailable: false,
        isActive: false,
        conversationStage: "inactive",
      },
    })
    return
  }

  // Mensajes de texto no reconocidos son ignorados
  void normalizedMessage
}

export async function handleDriverButtonResponse(phone: string, buttonId: string) {
  console.log(`[WhatsApp] Button response from ${phone}: ${buttonId}`)

  const driver = await findDriverByPhone(phone)

  if (!driver) {
    console.log(`[WhatsApp] Driver not found for phone: ${phone}`)
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

    // Enviar ubicación de recogida con botones de acción
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
        { id: `delivered_${orderId}`, title: "Entregado" },
        { id: `failed_${orderId}`, title: "No se pudo entregar" },
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

    // Actualizar estado a IN_TRANSIT (sin enviar mensaje WhatsApp)
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

    // Si no ha recogido, solo enviar correo informativo (gratis)
    if (order.status !== "IN_TRANSIT") {
      const driverUser = await prisma.user.findUnique({
        where: { id: driver.userId },
      })

      if (driverUser?.email) {
        await sendEmail({
          to: driverUser.email,
          subject: `Instrucciones para pedido #${order.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Hola ${driver.fullName}</h2>
              <p>Intentaste marcar el pedido <strong>#${order.orderNumber}</strong> como entregado, pero primero debes confirmar la recogida.</p>
              <p><strong>Paso a seguir:</strong></p>
              <ol>
                <li>Presiona el botón <strong>"Confirmar Recogida"</strong> en el mensaje de WhatsApp del pedido.</li>
                <li>Una vez recogido, podrás marcar como <strong>"Entregado"</strong> o <strong>"No se pudo entregar"</strong>.</li>
              </ol>
              <p style="color: #666; margin-top: 20px;">Si tienes dudas, contacta al soporte.</p>
              <p style="color: #999; font-size: 12px;">Equipo Pronty</p>
            </div>
          `,
        })
      }

      console.log(`[WhatsApp] Delivery attempt ignored for ${order.orderNumber} - not yet picked up`)
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

    // Enviar WhatsApp de confirmación (servicio, no consume ventana)
    await sendWhatsAppMessage({
      to: phone,
      message: `✅ Pedido #${order.orderNumber} entregado con éxito.\n\nGracias por trabajar con Pronty.`,
    })

    // Enviar email de cierre con resumen de ganancias
    const driverUser = await prisma.user.findUnique({
      where: { id: driver.userId },
    })

    if (driverUser?.email) {
      const emailHtml = getDeliveryConfirmationEmail({
        driverName: driver.fullName,
        orderNumber: order.orderNumber,
        baseFee: Number(order.baseFee),
        commission,
        netEarning,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        deliveredAt: new Date(),
      })

      await sendEmail({
        to: driverUser.email,
        subject: `¡Pedido #${order.orderNumber} entregado! Resumen de ganancia`,
        html: emailHtml,
      })
    }

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

    // Si no ha recogido, solo enviar correo informativo (gratis)
    if (order.status !== "IN_TRANSIT") {
      const driverUser = await prisma.user.findUnique({
        where: { id: driver.userId },
      })

      if (driverUser?.email) {
        await sendEmail({
          to: driverUser.email,
          subject: `Instrucciones para pedido #${order.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Hola ${driver.fullName}</h2>
              <p>Intentaste reportar una falla en el pedido <strong>#${order.orderNumber}</strong>, pero primero debes confirmar la recogida.</p>
              <p><strong>Paso a seguir:</strong></p>
              <ol>
                <li>Presiona el botón <strong>"Confirmar Recogida"</strong> en el mensaje de WhatsApp del pedido.</li>
                <li>Una vez recogido, podrás marcar como <strong>"Entregado"</strong> o <strong>"No se pudo entregar"</strong>.</li>
              </ol>
              <p style="color: #666; margin-top: 20px;">Si tienes dudas, contacta al soporte.</p>
              <p style="color: #999; font-size: 12px;">Equipo Pronty</p>
            </div>
          `,
        })
      }

      console.log(`[WhatsApp] Failed delivery attempt ignored for ${order.orderNumber} - not yet picked up`)
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
      message: `📦 Pedido #${order.orderNumber} marcado como "No entregado". El comercio será notificado.`,
    })

    // Enviar email de cierre con resumen de ganancias
    const driverUser = await prisma.user.findUnique({
      where: { id: driver.userId },
    })

    if (driverUser?.email) {
      const emailHtml = getDeliveryConfirmationEmail({
        driverName: driver.fullName,
        orderNumber: order.orderNumber,
        baseFee: Number(order.baseFee),
        commission,
        netEarning,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        deliveredAt: new Date(),
      })

      await sendEmail({
        to: driverUser.email,
        subject: `Pedido #${order.orderNumber} - Entrega no completada`,
        html: emailHtml,
      })
    }

    console.log(`[WhatsApp] Order ${order.orderNumber} delivery failed by ${driver.fullName}`)
    return
  }

  console.log(`[WhatsApp] Unknown button: ${buttonId}`)
}
