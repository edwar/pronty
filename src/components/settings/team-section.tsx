"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, UserPlus, Mail, Copy, Check, Clock, ShieldCheck, Loader2 } from "lucide-react"

interface TeamMember {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  isOwner: boolean
  createdAt: string
}

interface PendingInvitation {
  id: string
  email: string
  token: string
  status: string
  createdAt: string
  expiresAt: string
}

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Invite Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/commerce/invitations")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al cargar la información del equipo")
      setMembers(data.members || [])
      setInvitations(data.invitations || [])
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al cargar el equipo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setInviteEmail("")
    setFormError(null)
    setLastInviteLink(null)
    setCopied(false)
    setDialogOpen(true)
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!inviteEmail || !inviteEmail.includes("@")) {
      setFormError("Por favor ingresa un correo electrónico válido")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/commerce/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Error al enviar la invitación")
      }

      setLastInviteLink(data.inviteUrl)
      fetchTeamData()
    } catch (err: any) {
      setFormError(err.message || "Error al procesar la invitación")
    } finally {
      setSending(false)
    }
  }

  const handleCopyLink = () => {
    if (lastInviteLink) {
      navigator.clipboard.writeText(lastInviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Equipo y Colaboradores
            </CardTitle>
            <CardDescription>
              Invita a miembros de tu equipo para que puedan solicitar domicilios y operar el negocio.
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleOpenDialog} className="h-8">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Invitar Miembro
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando información del equipo...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Integrantes activos */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Miembros del Negocio ({members.length})
                </h4>
                <div className="rounded-md border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Rol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-medium">
                            {member.name || "Sin nombre"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{member.email}</TableCell>
                          <TableCell className="text-muted-foreground">{member.phone || "—"}</TableCell>
                          <TableCell>
                            {member.isOwner ? (
                              <Badge variant="default" className="text-[10px] bg-primary">
                                Dueño
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                Colaborador
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Invitaciones pendientes */}
              {invitations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Invitaciones Pendientes ({invitations.length})
                  </h4>
                  <div className="rounded-md border border-border/60 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Correo Invitado</TableHead>
                          <TableHead>Enviado el</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((inv) => (
                          <TableRow key={inv.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-medium">{inv.email}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(inv.createdAt).toLocaleDateString("es-CO", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="warning" className="text-[10px] flex items-center w-fit gap-1">
                                <Clock className="h-3 w-3" />
                                Pendiente
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invitar Miembro al Negocio
            </DialogTitle>
            <DialogDescription>
              Envía una invitación por correo para sumar a un colaborador a tu negocio.
            </DialogDescription>
          </DialogHeader>

          {!lastInviteLink ? (
            <form onSubmit={handleSendInvite} className="space-y-4 py-2">
              {formError && (
                <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Correo Electrónico del Colaborador</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colaborador@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Se le enviará un correo con las instrucciones para unirse.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={sending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Invitación"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-success/10 p-3 text-xs text-success flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">¡Invitación enviada!</p>
                  <p className="mt-0.5">Se ha enviado el correo a {inviteEmail}. También puedes copiar el enlace directo:</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Enlace directo de invitación</Label>
                <div className="flex gap-2">
                  <Input value={lastInviteLink} readOnly className="text-xs font-mono text-muted-foreground" />
                  <Button size="sm" onClick={handleCopyLink} variant="outline" className="shrink-0">
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" onClick={() => setDialogOpen(false)}>
                  Listo
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
