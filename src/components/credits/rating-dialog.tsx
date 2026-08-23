"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  driverName: string
  onRated: () => void
}

export function RatingDialog({
  open,
  onOpenChange,
  orderId,
  driverName,
  onRated,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Selecciona una calificación")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/ratings/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      onRated()
      onOpenChange(false)
      setRating(0)
      setComment("")
    } catch (err: any) {
      setError(err.message || "Error al enviar la calificación")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calificar domiciliario</DialogTitle>
          <DialogDescription>
            ¿Cómo fue tu experiencia con <span className="font-medium text-foreground">{driverName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    star <= (hoveredStar || rating)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {rating === 1 && "Mala experiencia"}
            {rating === 2 && "Regular"}
            {rating === 3 && "Buena"}
            {rating === 4 && "Muy buena"}
            {rating === 5 && "Excelente"}
            {rating === 0 && "Selecciona una calificación"}
          </p>
        </div>

        <Textarea
          placeholder="Comentario opcional..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar calificación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
