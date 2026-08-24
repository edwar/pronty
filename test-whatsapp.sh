#!/bin/bash

# ============================================
# Test WhatsApp Business API
# ============================================
# Uso:
#   ./test-whatsapp.sh                          # Valores por defecto
#   ./test-whatsapp.sh 573175227672             # Solo teléfono
#   ./test-whatsapp.sh 573175227672 "Mensaje"  # Teléfono y mensaje
#
# Con pnpm:
#   pnpm test:whatsapp
#   pnpm test:whatsapp:phone --phone=573175227672
#   pnpm test:whatsapp:full --phone=573175227672 --message="Pedido #123"
# ============================================

ACCESS_TOKEN="EAAWaS1MXsoQBSbvgR00PUeKwINhEBMKcaAmZC2Wbnd08bcLqzRfkhaATXc34IQNd5EVcUNau24OLUHYwnrjbv0wlCZB4avTVjdh0YMjMLA1TbD95gy05fDXrwL1FmlpD8rTXcAVMYfkxtJBxPWr2MrEABrASt87tZAZCsyitX4hyrsf2Vn0uDzZAkDVYJqV3MPgZDZD"
PHONE_NUMBER_ID="113704504922268"

# Parámetros opcionales
TO_PHONE="${1:-573175227672}"
MESSAGE="${2:-Pedido #TEST-001 de Pronty\nEntrega en: Calle 1 # 11-30\nTarifa: $5.000}"

echo "=========================================="
echo "WhatsApp Business API Test"
echo "=========================================="
echo "Destinatario: $TO_PHONE"
echo "Mensaje: $MESSAGE"
echo "=========================================="

curl -i -X POST \
  "https://graph.facebook.com/v25.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "'"$TO_PHONE"'",
    "type": "interactive",
    "interactive": {
      "type": "button",
      "body": {
        "text": "'"$MESSAGE"'"
      },
      "action": {
        "buttons": [
          {
            "type": "reply",
            "reply": {
              "id": "accept_test_001",
              "title": "Aceptar Pedido"
            }
          },
          {
            "type": "reply",
            "reply": {
              "id": "decline_test_001",
              "title": "Rechazar"
            }
          }
        ]
      }
    }
  }'

echo ""
echo "Respuesta recibida."
