import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./security";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username }
                });
                if (!user) return null;

                const ok = await verifyPassword(credentials.password, user.passwordHash);
                if (!ok) return null;

                return { id: user.id, name: user.username };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.uid = (user as any).id;
            return token;
        },
        async session({ session, token }) {
            (session as any).uid = token.uid;
            return session;
        }
    },
    pages: {
        signIn: "/login"
    }
};