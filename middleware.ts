export { default } from "next-auth/middleware";

export const config = {
    matcher: ["/", "/api/me/:path*", "/api/gift/:path*", "/api/wheel/:path*", "/api/spin/:path*"]
};