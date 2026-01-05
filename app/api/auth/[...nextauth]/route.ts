
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail } from "@/lib/db-utils";
import bcrypt from "bcryptjs";

const handler = NextAuth({
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await findUserByEmail(credentials.email);

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password as string);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email as string,
                };
            }
        })
    ],
    pages: {
        signIn: '/auth/login', // We'll handle UI in the main page for now to keep it simple
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };
