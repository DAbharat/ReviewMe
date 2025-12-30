import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function getEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env var ${name}`);
    return v;
}

const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {

            if(user) {
                token._id = user._id?.toString();
                token.username = user.username;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token}) {

            if(token) {
                session.user._id = token._id;
                session.user.username = token.username;
                session.user.email = token.email;
            }
            return session;
        }
    },
    pages: {
        signIn: "/signin",
    },
    session: {
        strategy: "jwt"
    }
}