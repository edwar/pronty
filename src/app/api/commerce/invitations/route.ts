import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Find commerce where user is owner or employee
    let commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce && (session.user as any).commerceId) {
      commerce = await prisma.commerce.findUnique({
        where: { id: (session.user as any).commerceId },
      })
    }

    if (!commerce) {
      return NextResponse.json({ invitations: [], members: [] })
    }

    // Get pending invitations
    const invitations = await prisma.invitation.findMany({
      where: {
        commerceId: commerce.id,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    })

    // Get active team members (owner + employees)
    const members = await prisma.user.findMany({
      where: {
        OR: [
          { id: commerce.userId },
          { commerceId: commerce.id },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({
      invitations,
      members: members.map(m => ({
        ...m,
        isOwner: m.id === commerce.userId,
      })),
    })
  } catch (error) {
    console.error("Error fetching invitations & team members:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Find commerce
    let commerce = await prisma.commerce.findUnique({
      where: { userId: session.user.id },
    })

    if (!commerce && (session.user as any).commerceId) {
      commerce = await prisma.commerce.findUnique({
        where: { id: (session.user as any).commerceId },
      })
    }

    if (!commerce) {
      return NextResponse.json({ error: "Comercio no encontrado" }, { status: 404 })
    }

    const { email } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Correo electrónico inválido" }, { status: 400 })
    }

    // Check if user is already a member or owner
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        OR: [
          { id: commerce.userId },
          { commerceId: commerce.id },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este correo ya pertenece al equipo de este comercio" },
        { status: 400 }
      )
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const invitation = await prisma.invitation.upsert({
      where: {
        commerceId_email: {
          commerceId: commerce.id,
          email: email.toLowerCase().trim(),
        },
      },
      update: {
        token,
        status: "PENDING",
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        commerceId: commerce.id,
        email: email.toLowerCase().trim(),
        token,
        expiresAt,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const inviteUrl = `${appUrl}/register?invite=${token}`

    // Send email notification
    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: `Te han invitado a unirte a ${commerce.name} en Pronty`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #3b82f6; border-radius: 8px; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0;">Pronty</h1>
              <p style="margin: 5px 0 0;">Invitación a Negocio</p>
            </div>
            <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-top: 20px;">
              <h2>¡Hola!</h2>
              <p>El negocio <strong>${commerce.name}</strong> te ha invitado a unirte a su equipo en Pronty para gestionar domicilios y operar el negocio.</p>
              <p>Haz clic en el botón a continuación para registrarte y aceptar la invitación:</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${inviteUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Unirme a ${commerce.name}
                </a>
              </div>
              <p style="font-size: 12px; color: #64748b; text-align: center;">Este enlace vencerá en 7 días.</p>
            </div>
          </body>
        </html>
      `,
    })

    return NextResponse.json(
      {
        message: "Invitación enviada correctamente",
        invitation,
        inviteUrl,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sending invitation:", error)
    return NextResponse.json({ error: "Error interno al enviar la invitación" }, { status: 500 })
  }
}
