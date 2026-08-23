"use client"

import Link from "next/link"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "@/lib/auth-client"
import { useUser } from "@/hooks/use-user"

export function Header() {
  const { user, isAdmin } = useUser()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case "ADMIN_MASTER":
        return "Administrador"
      case "COMMERCER":
        return "Comerciante"
      case "DRIVER":
        return "Domiciliario"
      default:
        return "Usuario"
    }
  }

  return (
    <header className="flex h-14 items-center justify-end border-b border-border/60 bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "Usuario"} />
              <AvatarFallback className="text-xs font-medium">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name ?? "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {getRoleLabel(user?.role)}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={isAdmin ? "/admin/profile" : "/profile"} className="flex w-full items-center gap-2">
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={isAdmin ? "/admin/settings" : "/settings"} className="flex w-full items-center gap-2">
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
