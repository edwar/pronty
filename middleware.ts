import { NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/", "/login", "/register", "/drivers/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Omitir archivos estáticos y API
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // 2. Obtener la cookie de sesión (soporta tanto HTTP como HTTPS/Vercel)
  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value

  const hasSession = !!sessionToken

  // 3. Caso de Rutas Públicas (login, register, etc.)
  if (publicRoutes.includes(pathname)) {
    if (hasSession) {
      try {
        // Pasa TODAS las cookies de la petición entrante para evitar que falten tokens
        const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          const userRole = data?.session?.user?.role
          if (data?.session?.user) {
            const targetPath = userRole === "ADMIN_MASTER" ? "/admin" : "/dashboard"
            return NextResponse.redirect(new URL(targetPath, request.url))
          }
        }
      } catch {
        // Sesión inválida o expirada -> permitir acceso a ruta pública
      }
    }
    return NextResponse.next()
  }

  // 4. Caso de Rutas Protegidas sin cookie
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 5. Validar sesión y roles en Rutas Protegidas
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const data = await response.json()
    const userRole = data?.session?.user?.role

    if (!data?.session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (pathname.startsWith("/admin") && userRole !== "ADMIN_MASTER") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (pathname === "/dashboard" && userRole === "ADMIN_MASTER") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}