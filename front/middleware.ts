import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("access_token")?.value;

    // Redirection de la page d'accueil vers le dashboard
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Gestion de la page d'authentification
    if (pathname === "/auth") {
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // Vérification de l'authentification pour les routes protégées
    if (!token) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/auth",
        "/dashboard/:path*",
        "/documents/:path*",
        "/profile/:path*"
    ],
};