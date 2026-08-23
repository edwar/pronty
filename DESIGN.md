# Design System - Pronty

## Visual World

**Refined Tech Moderno** — Inspiración en Stripe Dashboard y Vercel. Limpio, con profundidad sutil, tipografía con presencia, y espaciado generoso. Profesional pero acogedor.

## Color Strategy

**Restrained** — Neutros cálidos con acento azul para acciones primarias. Verde para éxitos, ámbar para alertas. Colores desaturados que se sienten naturales, no artificiales.

### Palette

| Role | Token | Usage |
|------|-------|-------|
| **Primary** | `--primary` | Botones primarios, links, acciones |
| **Success** | `--success` | Estados exitosos, entregas |
| **Warning** | `--warning` | Alertas, pendientes |
| **Error** | `--destructive` | Errores, cancelaciones |

### Neutrals

| Role | Token | Usage |
|------|-------|-------|
| **Background** | `--background` | Fondo principal — blanco cálido |
| **Card** | `--card` | Cards, paneles |
| **Muted** | `--muted` | Sidebars, secciones alternas, badges |
| **Border** | `--border` | Bordes sutiles (0.6 opacity) |
| **Text** | `--foreground` | Texto principal — negro suave |
| **Muted Text** | `--muted-foreground` | Texto secundario, labels, captions |

## Typography

### Font Family

```css
--font-sans: 'DM Sans', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;
```

**DM Sans** — Limpia, moderna, ligeramente geométrica. Más personalidad que Inter pero igual de legible. Solo pesos 400-700.

### Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 3-4.5rem | 700 | Títulos de página, hero |
| H1 | 1.875rem | 700 | Headers de sección |
| H2 | 1.5rem | 600 | Sub-headers |
| Body | 1rem | 400 | Texto de cuerpo |
| Small | 0.875rem | 400 | Texto secundario |
| Caption | 0.75rem | 400 | Captions, labels |
| Mono | various | 500 | Datos, números, IDs de pedido |

## Spacing

Basado en 4px con unidades generosas. Separación entre secciones: 24-32px. Padding de cards: 20-24px.

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| Cards | `1rem` (16px) | Cards principales |
| Buttons | `0.5rem` (8px) | Botones, inputs |
| Badges | `9999px` | Badges, pills |
| Small | `0.5rem` (8px) | Elementos internos |

## Shadows

Sombras sutiles con tinte del color de fondo. Solo en hover y elementos elevados.

| Token | Usage |
|-------|-------|
| `shadow-sm` | Cards en reposo (sutil) |
| `shadow-md` | Cards en hover |
| `shadow-lg` | Overlays, dropdowns |
| `shadow-primary/5` | Sombras con tinte azul |

## Components

### Cards

```css
background: var(--card);
border: 1px solid oklch(from var(--border) l c h / 0.6);
border-radius: 1rem;
padding: 1.5rem;
```

Cards con borde sutil y sombra en hover. Sin sombra fuerte en reposo.

### Buttons

Variantes: `default` (primary), `outline`, `secondary`, `ghost`, `destructive`. 
Altura: 32px (default), 36px (sm), 40px (lg).

### Status Badges

Badges redondeados con variantes de color. Tamaño pequeño (10-11px).

## Layout

### Sidebar

- Width: 240px (desktop), collapsed to 64px
- Background: `muted/40` — casi transparente
- Border right: 1px sutil
- Active state: `primary/10` con sombra sutil

### Content Area

- Max width: 1200px
- Padding: 24px (desktop), 16px (mobile)

## Motion

- Duration: 200ms para interacciones
- Easing: `ease-out` estándar
- Transiciones sutiles en hover y focus

## Iconography

**Lucide React** — Consistente, limpio.

## Anti-patterns (NO hacer)

- ❌ Sombras fuertes o decorativas
- ❌ Gradientes saturados
- ❌ Bordes de 2px o más
- ❌ Texto uppercase en todas partes
- ❌ Colores saturados como fondo
- ❌ Motion decorativa
- ❌ Border-radius 0 (brutalismo)
