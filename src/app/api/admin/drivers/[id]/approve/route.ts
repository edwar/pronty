import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, getDriverActivationEmail } from "@/lib/email"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!driver) {
      return NextResponse.json(
        { error: "Domiciliario no encontrado" },
        { status: 404 }
      )
    }

    // Obtener configuración de WhatsApp Business
    const config = await prisma.systemConfig.findUnique({
      where: { key: "global_settings" },
    })
    const settings = config?.value as any
    const businessPhone = settings?.whatsapp?.businessPhone

    // Actualizar estado del domiciliario
    await prisma.driver.update({
      where: { id },
      data: {
        isApproved: true,
        conversationStage: "needs_activation",
      },
    })

    // Enviar email de activación si hay phone configurado
    if (businessPhone && driver.user.email) {
      const activationMessage = `Hola, soy ${driver.fullName} y quiero activar mi cuenta en Pronty`
      const whatsappLink = `https://wa.me/${businessPhone}?text=${encodeURIComponent(activationMessage)}`

      await sendEmail({
        to: driver.user.email,
        subject: "Activa tu cuenta de domiciliario en Pronty",
        html: getDriverActivationEmail(driver.fullName, whatsappLink),
      })
    }

    return NextResponse.json({ message: "Domiciliario aprobado correctamente" })
  } catch (error) {
    console.error("Error approving driver:", error)
    return NextResponse.json(
      { error: "Error al aprobar el domiciliario" },
      { status: 500 }
    )
  }
}
