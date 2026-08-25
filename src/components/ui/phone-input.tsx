"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
  { code: "+57", country: "CO", name: "Colombia", abbr: "Col", flag: "🇨🇴" },
  { code: "+1", country: "US", name: "Estados Unidos", abbr: "USA", flag: "🇺🇸" },
  { code: "+52", country: "MX", name: "México", abbr: "Mex", flag: "🇲🇽" },
  { code: "+54", country: "AR", name: "Argentina", abbr: "Arg", flag: "🇦🇷" },
  { code: "+56", country: "CL", name: "Chile", abbr: "Chi", flag: "🇨🇱" },
  { code: "+51", country: "PE", name: "Perú", abbr: "Per", flag: "🇵🇪" },
  { code: "+593", country: "EC", name: "Ecuador", abbr: "Ecu", flag: "🇪🇨" },
  { code: "+598", country: "UY", name: "Uruguay", abbr: "Uru", flag: "🇺🇾" },
  { code: "+595", country: "PY", name: "Paraguay", abbr: "Par", flag: "🇵🇾" },
  { code: "+591", country: "BO", name: "Bolivia", abbr: "Bol", flag: "🇧🇴" },
  { code: "+58", country: "VE", name: "Venezuela", abbr: "Ven", flag: "🇻🇪" },
  { code: "+507", country: "PA", name: "Panamá", abbr: "Pan", flag: "🇵🇦" },
  { code: "+506", country: "CR", name: "Costa Rica", abbr: "CR", flag: "🇨🇷" },
  { code: "+503", country: "SV", name: "El Salvador", abbr: "ES", flag: "🇸🇻" },
  { code: "+504", country: "HN", name: "Honduras", abbr: "Hon", flag: "🇭🇳" },
  { code: "+505", country: "NI", name: "Nicaragua", abbr: "Nca", flag: "🇳🇮" },
  { code: "+502", country: "GT", name: "Guatemala", abbr: "Gua", flag: "🇬🇹" },
  { code: "+1809", country: "DO", name: "Rep. Dominicana", abbr: "RD", flag: "🇩🇴" },
  { code: "+53", country: "CU", name: "Cuba", abbr: "Cub", flag: "🇨🇺" },
  { code: "+34", country: "ES", name: "España", abbr: "Esp", flag: "🇪🇸" },
  { code: "+55", country: "BR", name: "Brasil", abbr: "Bra", flag: "🇧🇷" },
  { code: "+44", country: "GB", name: "Reino Unido", abbr: "UK", flag: "🇬🇧" },
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
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const newParsed = parsePhoneValue(value)
    if (newParsed.countryCode !== countryCode) setCountryCode(newParsed.countryCode)
    if (newParsed.number !== number) setNumber(newParsed.number)
  }, [value])

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCountries = useMemo(() => {
    if (!search) return countryCodes
    const lower = search.toLowerCase()
    return countryCodes.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.abbr.toLowerCase().includes(lower) ||
        c.code.includes(lower) ||
        c.country.toLowerCase().includes(lower)
    )
  }, [search])

  const handleChangeCountry = (code: string) => {
    setCountryCode(code)
    onValueChange(`${code} ${number}`.trim())
    setIsOpen(false)
    setSearch("")
  }

  const handleChangeNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s-]/g, "")
    setNumber(raw)
    onValueChange(`${countryCode} ${raw}`.trim())
  }

  const currentCountry = countryCodes.find((c) => c.code === countryCode)

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="flex">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex w-[85px] shrink-0 items-center justify-center gap-1 rounded-l-lg border border-r-0 border-input bg-transparent py-2 text-sm transition-colors hover:bg-muted focus:z-10 focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {currentCountry ? (
            <>
              <span className="text-sm leading-none">{currentCountry.flag}</span>
              <span className="text-xs font-medium">{currentCountry.code}</span>
            </>
          ) : (
            countryCode
          )}
        </button>
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

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 z-[9999] mt-1 w-[260px] rounded-lg border border-border bg-popover shadow-md"
        >
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto p-1">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No se encontraron países</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleChangeCountry(country.code)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
                    countryCode === country.code ? "bg-accent" : ""
                  }`}
                >
                  <span className="text-sm leading-none">{country.flag}</span>
                  <span className="text-xs text-muted-foreground font-medium w-7">{country.abbr}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">{country.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
