"use client"

import { useEffect, useState, useCallback } from "react"
import { MapPin, Loader2, Crosshair } from "lucide-react"

interface LocationPickerProps {
  lat: number | null
  lng: number | null
  onLocationChange: (lat: number, lng: number) => void
  className?: string
  height?: string
}

// Default fallback: Bogotá, Colombia
const DEFAULT_LAT = 4.711
const DEFAULT_LNG = -74.072

export function LocationPicker({
  lat,
  lng,
  onLocationChange,
  className = "",
  height = "300px",
}: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [MapComponent, setMapComponent] = useState<React.ComponentType | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        () => {
          // Fallback to default if geolocation fails
          setUserLocation([DEFAULT_LAT, DEFAULT_LNG])
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      setUserLocation([DEFAULT_LAT, DEFAULT_LNG])
    }
  }, [])

  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    onLocationChange(newLat, newLng)
  }, [onLocationChange])

  useEffect(() => {
    if (!userLocation) return

    // Dynamically import map components to avoid SSR issues with Leaflet
    const loadMap = async () => {
      // @ts-expect-error - leaflet types work at runtime
      const L = await import("leaflet")
      await import("leaflet/dist/leaflet.css")

      // Fix default marker icon issue in Next.js
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      // @ts-expect-error - react-leaflet types work at runtime
      const { MapContainer, TileLayer, Marker, useMapEvents } = await import("react-leaflet")

      function LocationMarker({ position }: { position: [number, number] | null }) {
        const map = useMapEvents({
          click(e: { latlng: { lat: number; lng: number } }) {
            handleLocationChange(e.latlng.lat, e.latlng.lng)
          },
        })

        useEffect(() => {
          if (position) {
            map.setView(position, map.getZoom())
          }
        }, [position, map])

        return position ? (
          <Marker position={position} />
        ) : null
      }

      function MapView() {
        const center: [number, number] = lat && lng ? [lat, lng] : userLocation

        return (
          <MapContainer
            center={center}
            zoom={lat && lng ? 15 : 13}
            style={{ height, width: "100%", borderRadius: "0.5rem" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={lat && lng ? [lat, lng] : null} />
          </MapContainer>
        )
      }

      setMapComponent(() => MapView)
      setIsLoading(false)
    }

    loadMap()
  }, [userLocation, lat, lng, height, handleLocationChange])

  const handleCenterOnUser = () => {
    if (userLocation) {
      onLocationChange(userLocation[0], userLocation[1])
    }
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading ? (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50"
          style={{ height }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : MapComponent ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <MapComponent />
          <div className="absolute bottom-2 left-2 z-[999] flex items-center gap-2">
            <div className="rounded-md bg-background/95 px-2 py-1 text-xs shadow-md border border-border">
              <MapPin className="inline h-3 w-3 mr-1 text-primary" />
              {lat && lng ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : "Haz clic en el mapa para ubicar"}
            </div>
            <button
              type="button"
              onClick={handleCenterOnUser}
              className="rounded-md bg-background/95 p-1.5 shadow-md border border-border hover:bg-muted transition-colors"
              title="Mi ubicación"
            >
              <Crosshair className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
