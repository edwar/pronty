import { NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/", "/login", "/register", "/drivers/register"]
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get("better-auth.session_token")
  const hasSession = !!sessionCookie?.value

  if (publicRoutes.includes(pathname)) {
    if (hasSession) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
          headers: {
            cookie: `better-auth.session_token=${sessionCookie.value}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data?.session?.user) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        }
      } catch {
        // cookie exists but session is invalid → allow public route
      }
    }
    return NextResponse.next()
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: `better-auth.session_token=${sessionCookie.value}`,
      },
    })

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const data = await response.json()
    const userRole = data?.session?.user?.role

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
