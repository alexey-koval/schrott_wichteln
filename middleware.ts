export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        /*
         * Protect everything except:
         * - auth pages
         * - public APIs
         */
        "/((?!login|register|api/register|api/auth).*)"
    ]
};