import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";


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
        }),

        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username",
                    type: "text"
                },
                email: {
                    label: "Email",
                    type: "text"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(credentials): Promise<any> {
                await dbConnect()

                if (!credentials?.password) {
                    throw new Error("Password is required")
                }

                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {
                                email: credentials?.email
                            },
                            {
                                username: credentials?.username
                            }
                        ]
                    })

                    if (!user) {
                        throw new Error("No user found with the given email or username")
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                    if (isPasswordValid) {
                        return user
                    } else {
                        throw new Error("Invalid password")
                    }

                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                const maybeId = (user as any)?._id?.toString() || (user as any)?.id || token.sub
                if (maybeId) token._id = maybeId
                token.username = (user as any)?.username || token.username
                token.email = (user as any)?.email || token.email
            }
            return token;
        },
        async session({ session, token }) {
            session.user = session.user || ({} as any)

            if (token) {
                session.user._id = (token as any)._id || (token as any).sub || session.user._id
                session.user.username = (token as any).username || session.user.username
                session.user.email = (token as any).email || session.user.email
            }
            return session;
        }
    },
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt"
    }
}