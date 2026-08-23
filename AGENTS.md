<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Convenciones del proyecto

## Inputs numéricos

Nunca usar `Number(e.target.value) || 0` directamente en inputs numéricos: deja ceros a la izquierda (escribir "200" sobre un "0" produce "0200"). Para inputs controlados usar el componente `NumberInput` de `src/components/ui/number-input.tsx` (estado string + `inputMode="numeric"` + strip de ceros a la izquierda):

```tsx
import { NumberInput } from "@/components/ui/number-input"

<NumberInput
  value={value}
  onValueChange={(v) => update(v)}
/>
```

Para casos sin estado controlado, usar el helper `parseNumericInput` de `src/lib/utils.ts`.

Reglas:
- Campo vacío → `0`
- `onFocus` selecciona todo: si el campo tiene "0" y se escribe "1", el 0 se reemplaza por "1" (escribir "200" queda "200", nunca "0200")
- Ceros a la izquierda se eliminan (`0200` → `200`)
- Si se necesita mínimo distinto de 0: `onValueChange={(v) => update(v || min)}`
