import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "global_settings" },
    })
    const settings = config?.value as any
    const phone = settings?.whatsapp?.businessPhone || ""
    return NextResponse.json({ phone })
  } catch {
    return NextResponse.json({ phone: "" })
  }
}
