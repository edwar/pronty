# Product

## Platform

web

## Users

Multi-usuario: Dueño de negocio (configura, administra, revisa métricas) + Empleados (operan diariamente, cargan pedidos, gestionan entregas). Ambos roles acceden al panel web desde cualquier dispositivo con navegador moderno. Domiciliarios operan 100% por WhatsApp sin instalar apps.

## Product Purpose

Pronty es un sistema profesional de delivery que reemplaza los grupos informales de WhatsApp para negocios de municipios pequeños en Latinoamérica. Ofrece trazabilidad en tiempo real, control de créditos, gestión profesional de domiciliarios y un bot de WhatsApp para repartidores (sin necesidad de app). El éxito se mide cuando un negocio local puede competir en profesionalismo con plataformas grandes como Rappi/iFood, manteniendo la cercanía y simplicidad que sus clientes esperan.

## Positioning

A diferencia de WhatsApp informal (sin control, sin trazabilidad, caótico para alto volumen) y apps grandes como Rappi/iFood (que no llegan a municipios pequeños, cobran comisiones altas, imponen restricciones), Pronty ofrece un sistema profesional, accesible y diseñado específicamente para negocios locales con volumen variable de pedidos. El domiciliario no instala nada: opera 100% por WhatsApp.

## Operating Context

- Negocios con 5-100+ pedidos diarios (volumen variable)
- Múltiples usuarios por comercio (dueño + empleados)
- Domiciliarios que operan 100% por WhatsApp (sin app)
- Pagos manuales o integrados (MercadoPago)
- Municipios pequeños de Latinoamérica (Colombia, México, etc.)
- Asignación directa a domiciliario específico O broadcast a grupo activo
- Sistema de créditos prepago (1 crédito = 1 solicitud de domicilio)
- Comisión opcional al domiciliario por cada carrera completada
- Múltiples sucursales por negocio con horarios y tarifas propias
- Cálculo automático de tarifa por distancia (Haversine)

## Capabilities

### Panel de Comercio
- Gestión multi-usuario (dueño + empleados)
- Creación de pedidos con asignación directa o broadcast
- Selección de sucursal de origen (auto-llenado de dirección y coordenadas)
- Cálculo automático de tarifa por distancia
- Estados en tiempo real vía Pusher
- Monedero de créditos con historial
- Dashboard con métricas y pedidos recientes
- Configuración de negocio (nombre, teléfono, WhatsApp)
- Gestión de sucursales (dirección, coordenadas, horarios, prefijo)
- Upload de imagen de perfil (Vercel Blob)

### Bot de WhatsApp para Domiciliarios
- Registro público con email obligatorio
- Activación vía email con link `wa.me` (el domiciliario envía el primer mensaje)
- Sistema conversacional con estados persistidos en BD
- Botones interactivos para aceptar/rechazar pedidos
- Confirmación de recogida y entrega
- Reporte de entrega fallida
- Check-in periódico con mensajes de renovación
- Expiración de conversación con advertencia previa
- Monedero e historial de ganancias

### Panel de Administración Master
- Control global de comercios, domiciliarios y reportes
- Aprobación manual de domiciliarios (envía email de activación)
- Configuración de paquetes de créditos
- Tarifas base y precio por km configurables
- Integración con MercadoPago para pagos
- Gestión de administradores del sistema
- Configuración de WhatsApp Business API

### Geolocalización
- Coordenadas geográficas en comercios y sucursales
- Coordenadas en pedidos (recogida y entrega)
- Cálculo de distancia con fórmula de Haversine
- Tarifa automática: Base + (km × Precio/km)
- Links de Google Maps en mensajes de WhatsApp

### Sucursales
- Múltiples sucursales por negocio
- Dirección, teléfono, ciudad, coordenadas por sucursal
- Prefijo de pedidos personalizado (ej: NORTE-0001)
- Horarios de atención por sucursal
- Sucursal por defecto para pedidos rápidos

## Constraints

- Domiciliarios no instalan apps (todo por WhatsApp)
- Multi-tenant desde inicio (múltiples comercios)
- Hosting serverless (Vercel + Neon)
- Base de datos: PostgreSQL (Neon)
- Autenticación: better-auth

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS, shadcn/ui
- **Database:** Prisma ORM + Neon PostgreSQL
- **Auth:** better-auth
- **Email:** Resend
- **WhatsApp:** Meta Cloud API
- **Real-time:** Pusher
- **Payments:** MercadoPago
- **Storage:** Vercel Blob (imágenes de perfil)

## Database Models

- **User** — Credenciales y roles (ADMIN_MASTER, COMMERCER, DRIVER)
- **Commerce** — Negocio, créditos, datos de contacto
- **Branch** — Sucursales con dirección, coords, horarios, prefijo
- **Driver** — Domiciliario, estado, ciudad, conversación
- **Order** — Pedido con origen (branch), destino, tarifa, distancia
- **Transaction** — Historial financiero de créditos
- **DriverEarning** — Comisiones ganadas por domiciliario
- **DriverNotification** — Notificaciones a domiciliarios
- **WhatsAppLog** — Logs de mensajes WhatsApp
- **SystemConfig** — Configuración global de la plataforma

## Brand

- **Nombre:** Pronty
- **Tono:** Moderno, confiable, cercano ("del barrio pero profesional")
- **Geografía:** Latinoamérica general
