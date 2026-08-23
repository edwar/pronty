# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Multi-usuario: Dueño de negocio (configura, administra, revisa métricas) + Empleados (operan diariamente, cargan pedidos, gestionan entregas). Ambos roles acceden al panel web desde cualquier dispositivo con navegador moderno.

## Product Purpose

Pronty es un sistema profesional de delivery que reemplaza los grupos informales de WhatsApp para negocios de municipios pequeños en Latinoamérica. Ofrece trazabilidad en tiempo real, control de créditos, gestión profesional de domiciliarios y un bot de WhatsApp para repartidores (sin necesidad de app). El éxito se mide cuando un negocio local puede competir en profesionalismo con plataformas grandes como Rappi/iFood, manteniendo la cercanía y simplicidad que sus clientes esperan.

## Positioning

A diferencia de WhatsApp informal (sin control, sin trazabilidad, caótico para alto volumen) y apps grandes como Rappi/iFood (que no llegan a municipios pequeños, cobran comisiones altas, imponen restricciones), Pronty ofrece un sistema profesional, accesible y diseñado específicamente para negocios locales con volumen variable de pedidos. El domiciliario no instala nada: opera 100% por WhatsApp.

## Operating Context

- Negocios con 5-100+ pedidos diarios (volumen variable)
- Múltiples usuarios por comercio (dueño + empleados)
- Domiciliarios que operan 100% por WhatsApp (sin app)
- Pagos manuales (transferencia/efectivo) - el admin registra créditos
- Municipios pequeños de Latinoamérica (Colombia, México, etc.)
- Asignación directa a domiciliario específico O broadcast a grupo activo
- Sistema de créditos prepago (1 crédito = 1 solicitud de domicilio)
- Comisión opcional al domiciliario por cada carrera completada

## Capabilities and Constraints

### Core MVP (Fase 1)
- Panel web multi-usuario (dueño configura, empleados operan)
- Sistema de créditos prepago con paquetes
- Creación de pedidos con asignación directa o broadcast
- Bot WhatsApp para domiciliarios (notificaciones, aceptar pedidos, ver estado, consultar saldo)
- Tiempo real para estados de pedidos (SSE)
- Gestión de domiciliarios con registro público y aprobación manual
- Dashboard con métricas y pedidos recientes
- Historial de pedidos y transacciones
- Admin Master: gestión global de comercios, domiciliarios, tarifas, créditos

### Constraints
- Sin pasarela de pago integrada (pagos manuales)
- Domiciliarios no instalan apps (todo por WhatsApp)
- Multi-tenant desde inicio (múltiples comercios)
- Un solo municipio/zona para MVP piloto
- Hosting serverless (Vercel + Neon)

## Brand Commitments

- Nombre: **Pronty**
- Tono: Moderno, confiable, cercano ("del barrio pero profesional")
- Geografía: Latinoamérica general
- Sin nombre de dominio confirmado aún

## Evidence on Hand

- No hay assets visuales existentes (proyecto nuevo)
- Stack tecnológico confirmado: Next.js 16 + Prisma + Neon + better-auth
- Proyectos de referencia del mismo desarrollador: atenea, meti, perseus (mismo stack)

## Product Principles

1. **Simplicidad sobre complejidad** - Si WhatsApp funciona para el usuario, Pronty debe ser más fácil. La curva de aprendizaje debe ser mínima.
2. **Velocidad** - Desde crear un pedido hasta que el domiciliario lo tome debe ser instantáneo. Cada segundo cuenta en delivery.
3. **Transparencia** - Todo visible: estados del pedido, créditos disponibles, ganancias del domiciliario, historial completo.
4. **Accesible** - Domiciliarios no instalan apps. Todo por WhatsApp con botones interactivos. El comercio carga pedidos desde cualquier navegador.
5. **Profesional** - Hacer que un negocio pequeño se vea grande. Trazabilidad, reportes, gestión que competiría con plataformas grandes.

## Accessibility & Inclusion

- Responsive: funciona en desktop, tablet y móvil
- Accesibilidad básica: contraste suficiente, navegación por teclado, labels en formularios
- Multi-idioma potencial (español primario, portugués futuro)
