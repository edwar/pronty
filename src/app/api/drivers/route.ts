import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, phone, email, vehicleType, licensePlate, zone } = body

    if (!fullName || !phone || !email || !vehicleType || !zone) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "El email no es válido" },
        { status: 400 }
      )
    }

    const existingPhone = await prisma.driver.findUnique({
      where: { phone },
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: "Este teléfono ya está registrado como domiciliario" },
        { status: 400 }
      )
    }

    const existingUserWithRole = await prisma.user.findFirst({
      where: { phone, role: "DRIVER" },
    })

    if (existingUserWithRole) {
      return NextResponse.json(
        { error: "Este teléfono ya está registrado como domiciliario" },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: fullName,
        phone,
        role: "DRIVER",
        emailVerified: false,
      },
    })

    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        phone,
        fullName,
        vehicleType: vehicleType || "MOTORCYCLE",
        licensePlate: licensePlate || null,
        zone: zone || null,
        isAvailable: true,
        isActive: false,
        isApproved: false,
      },
    })

    return NextResponse.json(
      { message: "Solicitud enviada correctamente", driverId: driver.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating driver:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
