import { prisma } from "@/lib/prisma"

const WHATSAPP_API_URL = "https://graph.facebook.com/v25.0"

function formatPhoneForWhatsApp(phone: string): string {
  // Remove spaces, dashes, parentheses, and leading +
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, "")
  // If starts with 0, remove it (local format)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1)
  }
  return cleaned
}

async function getWhatsAppConfig() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "global_settings" },
    })
    const settings = config?.value as any
    return {
      phoneNumberId: settings?.whatsapp?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: settings?.whatsapp?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN,
      enabled: settings?.whatsapp?.enabled ?? false,
    }
  } catch {
    return {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      enabled: false,
    }
  }
}

interface SendWhatsAppMessageProps {
  to: string
  message: string
}

export async function sendWhatsAppMessage({ to, message }: SendWhatsAppMessageProps) {
  const { phoneNumberId, accessToken, enabled } = await getWhatsAppConfig()

  if (!enabled || !phoneNumberId || !accessToken) {
    console.error("WhatsApp credentials not configured")
    return { success: false, error: "WhatsApp not configured" }
  }

  const formattedTo = formatPhoneForWhatsApp(to)
  console.log(`[WhatsApp] Sending message to ${formattedTo}`)

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedTo,
          type: "text",
          text: { body: message },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("[WhatsApp] API error:", data)
      return { success: false, error: data.error?.message || "Error sending message" }
    }

    console.log("[WhatsApp] Message sent successfully")
    return { success: true, data }
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function sendWhatsAppButtonMessage(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  const { phoneNumberId, accessToken, enabled } = await getWhatsAppConfig()

  if (!enabled || !phoneNumberId || !accessToken) {
    console.error("WhatsApp credentials not configured")
    return { success: false, error: "WhatsApp not configured" }
  }

  const formattedTo = formatPhoneForWhatsApp(to)
  console.log(`[WhatsApp] Sending button message to ${formattedTo}`)

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedTo,
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
      console.error("[WhatsApp] API error:", data)
      return { success: false, error: data.error?.message || "Error sending button message" }
    }

    console.log("[WhatsApp] Button message sent successfully")
    return { success: true, data }
  } catch (error) {
    console.error("[WhatsApp] Error sending button message:", error)
    return { success: false, error: "Failed to send button message" }
  }
}

interface TemplateParameter {
  type: "text" | "image" | "document" | "video"
  text?: string
  image?: { link: string }
  document?: { link: string; filename: string }
  video?: { link: string }
}

interface TemplateButtonPayload {
  type: "quick_reply"
  index: number
  parameters: { type: "payload"; payload: string }[]
}

export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  bodyParameters: TemplateParameter[],
  buttonPayloads?: TemplateButtonPayload[]
) {
  const { phoneNumberId, accessToken, enabled } = await getWhatsAppConfig()

  if (!enabled || !phoneNumberId || !accessToken) {
    console.error("WhatsApp credentials not configured")
    return { success: false, error: "WhatsApp not configured" }
  }

  const formattedTo = formatPhoneForWhatsApp(to)
  console.log(`[WhatsApp] Sending template "${templateName}" to ${formattedTo}`)

  const components: any[] = []

  if (bodyParameters.length > 0) {
    components.push({
      type: "body",
      parameters: bodyParameters,
    })
  }

  if (buttonPayloads && buttonPayloads.length > 0) {
    for (const btn of buttonPayloads) {
      components.push({
        type: "button",
        sub_type: "quick_reply",
        index: btn.index,
        parameters: btn.parameters,
      })
    }
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedTo,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("[WhatsApp] Template API error:", data)
      return { success: false, error: data.error?.message || "Error sending template message" }
    }

    console.log("[WhatsApp] Template message sent successfully")
    return { success: true, data }
  } catch (error) {
    console.error("[WhatsApp] Error sending template message:", error)
    return { success: false, error: "Failed to send template message" }
  }
}
