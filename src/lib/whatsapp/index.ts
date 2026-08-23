const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

interface SendWhatsAppMessageProps {
  to: string
  message: string
}

export async function sendWhatsAppMessage({ to, message }: SendWhatsAppMessageProps) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error("WhatsApp credentials not configured")
    return { success: false, error: "WhatsApp not configured" }
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("WhatsApp API error:", data)
      return { success: false, error: data.error?.message || "Error sending message" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function sendWhatsAppButtonMessage(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error("WhatsApp credentials not configured")
    return { success: false, error: "WhatsApp not configured" }
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: bodyText },
            action: {
              buttons: buttons.map(btn => ({
                type: "reply",
                reply: { id: btn.id, title: btn.title },
              })),
            },
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("WhatsApp API error:", data)
      return { success: false, error: data.error?.message || "Error sending button message" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending WhatsApp button message:", error)
    return { success: false, error: "Failed to send button message" }
  }
}
