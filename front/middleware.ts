import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const protectedPaths = ["/dashboard", "/profile", "/"]
    const { pathname } = request.nextUrl

    // console.log(pathname)
    // Ici, on lit le cookie httpOnly côté serveur
    const token = request.cookies.get("access_token")?.value;

    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname === "/auth" && !token) {
        return NextResponse.next();
    }

    if (pathname === "/auth" && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!protectedPaths.some((path) => pathname.startsWith(path)))
        return NextResponse.next();

    // console.log(token)

    if (!token) {
        // Pas de cookie, donc pas authentifié
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Optionnel : tu pourrais ici décoder/valider le JWT si tu veux aller plus loin


    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/", "/auth"],
};