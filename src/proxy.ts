import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ratelimit } from './lib/rateLimit'

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  const url = request.nextUrl

  try {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0].trim() ?? "anonymous"
    const identifier = token?.sub ?? ip

    const { success, limit, remaining, reset } =
      await ratelimit.limit(identifier)

    if (!success) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset ?? ""),
        },
      })
    }
  } catch (err) {
    console.error("Rate limit failed, allowing request", err)
  }

  if (url.pathname === "/") {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  if (url.pathname === "/feed" || url.pathname.startsWith("/feed/")) {
    return NextResponse.next()
  }

  if (
    token &&
    (url.pathname === "/sign-in" || url.pathname === "/sign-up")
  ) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  if (
    !token &&
    url.pathname !== "/sign-in" &&
    url.pathname !== "/sign-up"
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if( !token && url.pathname.startsWith("/profile") ) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if( !token && url.pathname.startsWith("/settings") ) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/",
    "/feed",
    "/settings/:path*",
    "/profile/:path*"
  ]
}