import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token no proporcionado" }, { status: 400 })
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        commerce: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json({ valid: false, error: "Invitación no encontrada" }, { status: 404 })
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json({ valid: false, error: "La invitación ya no está pendiente" }, { status: 400 })
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "La invitación ha expirado" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      commerceName: invitation.commerce.name,
      commerceId: invitation.commerce.id,
    })
  } catch (error) {
    console.error("Error validating invitation token:", error)
    return NextResponse.json({ valid: false, error: "Error al validar la invitación" }, { status: 500 })
  }
}
