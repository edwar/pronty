import { NextRequest, NextResponse } from "next/server"
import { handleDriverMessage, handleDriverButtonResponse } from "@/lib/whatsapp/driver-conversation"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "pronty-verify-token"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[WhatsApp Webhook] Received:", JSON.stringify(body, null, 2))

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Invalid object" }, { status: 400 })
    }

    const entries = body.entry || []

    for (const entry of entries) {
      const changes = entry.changes || []

      console.log("[WhatsApp Webhook] Changes:", JSON.stringify(changes, null, 2))

      for (const change of changes) {
        if (change.field !== "messages") continue

        const messages = change.value?.messages || []

        for (const message of messages) {
          const phone = message.from

          if (message.type === "text") {
            const text = message.text?.body
            if (phone && text) {
              await handleDriverMessage(phone, text)
            }
          } else if (message.type === "interactive") {
            const buttonId = message.interactive?.button_reply?.id
            if (phone && buttonId) {
              await handleDriverButtonResponse(phone, buttonId)
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
