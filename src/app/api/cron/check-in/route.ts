import { NextRequest, NextResponse } from "next/server"
import { sendCheckInMessages } from "@/lib/whatsapp/driver-conversation"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await sendCheckInMessages()
    return NextResponse.json({ status: "ok", message: "Check-in messages sent" })
  } catch (error) {
    console.error("Error sending check-in messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
