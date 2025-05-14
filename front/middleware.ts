import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const protectedPaths = ["/documents", "/dashboard", "/profile", "/"]
    const { pathname } = request.nextUrl

    console.log(pathname)
    // Ici, on lit le cookie httpOnly côté serveur
    const token = request.cookies.get("access_token")?.value;
    console.log("Middleware called for path:", pathname);
    console.log("Token found:", !!token, token ? token.substring(0, 10) + "..." : "");

    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname === "/auth" && !token) {
        return NextResponse.next();
    }

    if (pathname === "/auth" && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // if (!protectedPaths.some((path) => pathname.startsWith(path)))
    //     return NextResponse.next();

    // console.log(token)

    if (!token) {

        console.log("Pas de token, redirection vers auth");

        // Pas de cookie, donc pas authentifié
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Optionnel : tu pourrais ici décoder/valider le JWT si tu veux aller plus loin


    return NextResponse.next();
}

export const config = {
    matcher: ["/documents", "/dashboard/:path*", "/profile/:path*", "/", "/auth"],
};