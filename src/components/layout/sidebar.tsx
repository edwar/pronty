"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  CreditCard, 
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart3,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useUser } from "@/hooks/use-user"
import { Logo } from "@/components/logo"

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

const commercantNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/orders", icon: ShoppingBag },
  { name: "Créditos", href: "/credits", icon: CreditCard },
]

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Usuarios", href: "/admin/users", icon: Users },
  { name: "Comercios", href: "/admin/commerces", icon: ShoppingBag },
  { name: "Domiciliarios", href: "/admin/drivers", icon: UserCheck },
  { name: "Pedidos", href: "/admin/orders", icon: Package },
  { name: "Reportes", href: "/admin/reports", icon: BarChart3 },
]

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin, user } = useUser()

  const navigation = isAdmin ? adminNavigation : commercantNavigation

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/60 bg-muted/40 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className={cn(
        "flex h-14 items-center border-b border-border/60",
        collapsed ? "justify-center px-2" : "px-5"
      )}>
        {collapsed ? (
          <Logo variant="icon" className="h-8 w-8" />
        ) : (
          <div className="flex items-center gap-2.5">
            <Logo variant="icon" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight">Pronty</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="border-b border-border/60 px-5 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            {isAdmin ? "Panel de Administración" : "Panel de Negocio"}
          </p>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 p-2">
        {navigation.map((item, index) => {
          const isActive =
            index === 0
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.name}>{linkContent}</div>
        })}
      </nav>

      <div className="border-t border-border/60 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full justify-start text-sm text-muted-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Colapsar
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
