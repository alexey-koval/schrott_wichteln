import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token, req }) => {
            const pathname = req.nextUrl.pathname;

            // Public routes
            if (pathname.startsWith("/login")) return true;
            if (pathname.startsWith("/register")) return true;
            if (pathname.startsWith("/api/auth")) return true;
            if (pathname.startsWith("/api/register")) return true;

            // Santa page: admin only
            if (pathname.startsWith("/santa")) {
                return token?.isAdmin === true;
            }

            // Participant page (/) requires normal login
            if (pathname === "/" || pathname.startsWith("/api/")) {
                return !!token;
            }

            return true;
        }
    }
});

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"]
};