import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
 
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {

    const token = await getToken({ req: request})
    const url = request.nextUrl

    // Redirect root to the public feed
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL('/feed', request.url))
    }

    // Allow the public feed (and any subpaths) to be accessed without login
    if (url.pathname === "/feed" || url.pathname.startsWith("/feed/")) {
      return NextResponse.next()
    }


    if(token && (
        url.pathname === "/sign-in" ||
        url.pathname === "/sign-up"
    )) {
        return NextResponse.redirect(new URL('/feed', request.url))
    }
    if(!token &&
      (
        url.pathname !== "/sign-in" &&
        url.pathname !== "/sign-up"
      )
    ) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/",
    "/feed"
  ]
}