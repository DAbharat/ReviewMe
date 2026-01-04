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
                token._id = user._id?.toString();
                token.username = user.username;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {

            if (token) {
                session.user._id = token._id;
                session.user.username = token.username;
                session.user.email = token.email;
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