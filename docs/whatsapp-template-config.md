# Configuración de Plantilla WhatsApp — Pronty

## Plantilla: `new_order_notification`

### Datos generales

| Campo | Valor |
|-------|-------|
| **Nombre** | `new_order_notification` |
| **Categoría** | **Utility** |
| **Idioma** | Español (Latinoamérica) — código `es` |

---

## Body (cuerpo del mensaje)

```
Nuevo pedido de *{{2}}*

📋 Pedido: *{{1}}*
📍 Recogida: {{3}}
🏠 Entrega: {{4}}
💰 Tarifa: {{5}}
📏 Distancia: {{6}}

¿Deseas aceptar este pedido?
```

---

## Variables (parámetros)

| Posición | Descripción | Tipo | Ejemplo |
|----------|-------------|------|---------|
| `{{1}}` | Número de pedido | text | `ORD-0001` |
| `{{2}}` | Nombre del comercio | text | `Restaurante La Favorita` |
| `{{3}}` | Dirección de recogida | text | `Calle 45 #12-34, Bogotá` |
| `{{4}}` | Dirección de entrega | text | `Av. Principal #89-12, Apto 302` |
| `{{5}}` | Tarifa formateada | text | `$5.000` |
| `{{6}}` | Distancia | text | `3.2 km` |

---

## Botones (Quick Reply)

| Índice | Texto del botón | Payload (enviado por backend) |
|--------|-----------------|-------------------------------|
| 0 | `Aceptar Pedido` | `accept_{orderId}` |
| 1 | `Rechazar` | `decline_{orderId}` |

> **Nota:** En Meta Business Suite solo configuras el texto visible del botón.
> Los payloads se envían dinámicamente desde el código fuente.

---

## Ejemplo de datos para revisión de Meta

Cuando Meta pide ejemplos de las variables, usa estos valores:

| Variable | Valor de ejemplo |
|----------|-----------------|
| `{{1}}` | `ORD-0001` |
| `{{2}}` | `Restaurante La Favorita` |
| `{{3}}` | `Calle 45 #12-34, Bogotá` |
| `{{4}}` | `Av. Principal #89-12, Apto 302` |
| `{{5}}` | `$5.000` |
| `{{6}}` | `3.2 km` |

---

## Validación de categoría Utility

Meta aprueba plantillas Utility solo si son **transaccionales y no promocionales**.

✅ **Cumple porque:**
- Notifica un evento específico (nuevo pedido asignado)
- No contiene ofertas, descuentos ni lenguaje promocional
- El usuario necesita esta información para actuar (aceptar/rechazar)
- No se envía masivamente (solo al domiciliario asignado)

❌ **Evitar:**
- Palabras como "gratis", "descuento", "oferta", "promoción"
- Emojis excesivos
- Texto que parezca marketing o publicidad

---

## Código de ejemplo para crear vía API

```bash
curl -X POST "https://graph.facebook.com/v25.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new_order_notification",
    "language": "es",
    "category": "utility",
    "components": [
      {
        "type": "BODY",
        "text": "Nuevo pedido de *{{2}}*\n\n📋 Pedido: *{{1}}*\n📍 Recogida: {{3}}\n🏠 Entrega: {{4}}\n💰 Tarifa: {{5}}\n📏 Distancia: {{6}}\n\n¿Deseas aceptar este pedido?",
        "example": {
          "body_text": [
            ["ORD-0001", "Restaurante La Favorita", "Calle 45 #12-34, Bogotá", "Av. Principal #89-12, Apto 302", "$5.000", "3.2 km"]
          ]
        }
      },
      {
        "type": "BUTTONS",
        "buttons": [
          {
            "type": "QUICK_REPLY",
            "text": "Aceptar Pedido"
          },
          {
            "type": "QUICK_REPLY",
            "text": "Rechazar"
          }
        ]
      }
    ]
  }'
```

---

## Pasos en Meta Business Suite

1. Ir a **Configuración** → **Cuentas de WhatsApp**
2. Seleccionar la cuenta
3. Ir a **Administrador de WhatsApp**
4. Menú lateral → **Message templates**
5. Click **Create template**
6. Llenar los campos según esta guía
7. Click **Submit** / **Send for review**
8. Esperar aprobación (24-48 horas)

---

## Variables de entorno necesarias

```env
# WhatsApp API
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_ACCESS_TOKEN=tu_access_token

# Email (para cierre de entrega)
RESEND_API_KEY=re_tu_api_key
EMAIL_FROM=Pronty <notificaciones@tudominio.com>
```

---

## Flujo completo optimizado (2 mensajes + 1 email)

```
Mensaje 1 (UTILITY TEMPLATE) — 1 mensaje
├── Contenido: Datos del pedido + botones Aceptar/Rechazar
├── Botones: [Aceptar Pedido] / [Rechazar]
├── Costo: Tarifa Utility (~$0.03-0.05 USD)
└── Si rechaza → Muere aquí (1 solo mensaje gastado)

Mensaje 2 (SERVICE) — solo si acepta
├── Contenido: Detalles de recogida/entrega + 3 botones de acción
├── Botones: [Confirmar Recogida] / [Entregado] / [No se pudo entregar]
├── Costo: Tarifa Service (~$0.005-0.01 USD)
└── Secuencia lógica: Recoger → Entregar/Fallar

Email (cierre) — sin costo WhatsApp
├── Asunto: ¡Pedido #{ID} entregado! Resumen de ganancia
├── Contenido: Desglose de ganancias (base - comisión = ganancia neta)
└── Costo: Gratis (Resend)
```

### Ahorro vs flujo anterior

| Concepto | Antes | Ahora | Ahorro |
|----------|-------|-------|--------|
| Mensajes por pedido completado | 3 WhatsApp | 2 WhatsApp | **33%** |
| Costo estimado/pedido | ~$0.04-0.07 | ~$0.035-0.06 | **~25%** |
| Si rechaza primer domiciliario | 1 mensaje | 1 mensaje | Igual |

### Lógica de botones (Mensaje 2)

El domiciliario debe seguir la secuencia lógica:
1. **"Confirmar Recogida"** → Cambia estado a IN_TRANSIT
2. **"Entregado"** o **"No se pudo entregar"** → Cierra el pedido

Si intenta presionar "Entregado" sin haber recogido, el sistema validará el estado actual.
