"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

type NumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  value: number
  onValueChange: (value: number) => void
}

function formatNumber(n: number): string {
  return n.toLocaleString("es-CO")
}

function parseFormattedNumber(s: string): number {
  const cleaned = s.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "")
  return Number(cleaned) || 0
}

export function NumberInput({ value, onValueChange, ...props }: NumberInputProps) {
  const [display, setDisplay] = useState(() => formatNumber(value))

  useEffect(() => {
    const parsed = parseFormattedNumber(display)
    if (parsed !== value) {
      setDisplay(formatNumber(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={display}
      onFocus={(e) => {
        e.target.select()
      }}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "")
        const num = Number(cleaned) || 0
        setDisplay(formatNumber(num))
        onValueChange(num)
      }}
    />
  )
}
