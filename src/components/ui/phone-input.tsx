"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PhoneInputProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  required?: boolean
}

const countryCodes = [
  { code: "+57", country: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "+1", country: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "+52", country: "MX", name: "México", flag: "🇲🇽" },
  { code: "+54", country: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "+51", country: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "+593", country: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "+598", country: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "+595", country: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "+591", country: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "+58", country: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "+507", country: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "+506", country: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "+503", country: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "+504", country: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "+505", country: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "+502", country: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "+1809", country: "DO", name: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "+53", country: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "+34", country: "ES", name: "España", flag: "🇪🇸" },
  { code: "+55", country: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "+44", country: "GB", name: "Reino Unido", flag: "🇬🇧" },
]

function parsePhoneValue(value: string): { countryCode: string; number: string } {
  if (!value) return { countryCode: "+57", number: "" }

  for (const country of countryCodes.sort((a, b) => b.code.length - a.code.length)) {
    if (value.startsWith(country.code)) {
      return {
        countryCode: country.code,
        number: value.slice(country.code.length).trim(),
      }
    }
  }

  return { countryCode: "+57", number: value.replace(/^\+/, "") }
}

export function PhoneInput({
  value,
  onValueChange,
  placeholder = "300 123 4567",
  disabled = false,
  className,
  id,
}: PhoneInputProps) {
  const parsed = parsePhoneValue(value)
  const [countryCode, setCountryCode] = useState(parsed.countryCode)
  const [number, setNumber] = useState(parsed.number)

  useEffect(() => {
    const newParsed = parsePhoneValue(value)
    if (newParsed.countryCode !== countryCode) setCountryCode(newParsed.countryCode)
    if (newParsed.number !== number) setNumber(newParsed.number)
  }, [value])

  const handleChangeCountry = (newCode: string | null) => {
    if (!newCode) return
    setCountryCode(newCode)
    onValueChange(`${newCode} ${number}`.trim())
  }

  const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s-]/g, "")
    setNumber(raw)
    onValueChange(`${countryCode} ${raw}`.trim())
  }

  const currentCountry = countryCodes.find(c => c.code === countryCode)

  return (
    <div className={`flex ${className ?? ""}`}>
      <Select value={countryCode} onValueChange={handleChangeCountry} disabled={disabled}>
        <SelectTrigger className="w-[90px] shrink-0 rounded-r-none border-r-0 focus:z-10">
          <SelectValue>
            {currentCountry ? (
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">{currentCountry.flag}</span>
                <span className="text-sm font-medium">{currentCountry.code}</span>
              </span>
            ) : countryCode}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-[200px]">
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2 w-full">
                <span className="text-base leading-none">{country.flag}</span>
                <span className="flex-1 text-sm">{country.name}</span>
                <span className="text-sm text-muted-foreground font-medium">{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        value={number}
        onChange={handleChangeNumber}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-w-0 rounded-l-none focus:z-10"
      />
    </div>
  )
}
