export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/write",
    "/write/:path*",
    "/settings/:path*",
    "/bookmarks/:path*",
    "/admin/:path*",
  ],
};
