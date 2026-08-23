import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || session.user.role !== "ADMIN_MASTER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN_MASTER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json(
      { error: "Error al obtener la lista de administradores" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || session.user.role !== "ADMIN_MASTER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, password, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Los campos Nombre, Email y Contraseña son obligatorios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está en uso" },
        { status: 400 }
      )
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: "El teléfono ya está en uso" },
          { status: 400 }
        )
      }
    }

    // Programmatically sign up user via better-auth API
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    })

    if (!response || !response.user) {
      return NextResponse.json(
        { error: "Error al crear el usuario administrador" },
        { status: 500 }
      )
    }

    // Force role to ADMIN_MASTER and update phone via Prisma
    const updatedUser = await prisma.user.update({
      where: { id: response.user.id },
      data: {
        role: "ADMIN_MASTER",
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: "Administrador creado correctamente",
        user: updatedUser,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      { error: error.message || "Error interno al crear el administrador" },
      { status: 500 }
    )
  }
}
