import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Next.js 16 renombró `middleware` a `proxy`. Protege el panel: sin sesión
// redirige a /auth/login y las rutas de administración exigen rol admin.
const adminOnly = ["/dashboard/users", "/dashboard/categories", "/dashboard/subscriptions"];

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const isAdminRoute = adminOnly.some((route) => pathname.startsWith(route));
    if (isAdminRoute && req.nextauth.token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
