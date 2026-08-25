import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        commerce: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      commerce: user.commerce || null,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Error al obtener el perfil" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, avatarUrl, commerce } = body

    // Check phone uniqueness within the same role
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone, role: session.user.role as any, id: { not: session.user.id } },
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: "El teléfono ya está en uso por otro usuario con el mismo rol" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
    })

    if (commerce && session.user.role === "COMMERCER") {
      const existingCommerce = await prisma.commerce.findUnique({
        where: { userId: session.user.id },
      })

      if (existingCommerce) {
        await prisma.commerce.update({
          where: { userId: session.user.id },
          data: {
            name: commerce.name || undefined,
            description: commerce.description || undefined,
            phone: commerce.phone || undefined,
            whatsapp: commerce.whatsapp || undefined,
          },
        })
      } else if (commerce.name) {
        const slug = commerce.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        await prisma.commerce.create({
          data: {
            userId: session.user.id,
            name: commerce.name,
            slug,
            description: commerce.description || null,
            phone: commerce.phone || null,
            whatsapp: commerce.whatsapp || null,
          },
        })
      }
    }

    return NextResponse.json({ message: "Perfil actualizado correctamente" })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 }
    )
  }
}
