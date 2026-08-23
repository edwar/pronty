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

export function NumberInput({ value, onValueChange, ...props }: NumberInputProps) {
  const [display, setDisplay] = useState(() => String(value))

  useEffect(() => {
    if (Number(display) !== value) {
      setDisplay(String(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={display}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "")
        setDisplay(cleaned || "0")
        onValueChange(Number(cleaned) || 0)
      }}
    />
  )
}
