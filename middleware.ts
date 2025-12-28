import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token, req }) => {
            const p = req.nextUrl.pathname;

            // Public pages (participants)
            if (p === "/") return true;

            // Public auth endpoints
            if (p.startsWith("/api/auth")) return true;

            // Public participant submit endpoint
            if (p.startsWith("/api/gift")) return true;

            // Login page itself is public
            if (p.startsWith("/login")) return true;

            // Everything Santa-related requires admin
            if (p.startsWith("/santa") || p.startsWith("/api/wheel") || p.startsWith("/api/spin")) {
                return token?.isAdmin === true;
            }

            // Default: allow
            return true;
        }
    }
});

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"]
};