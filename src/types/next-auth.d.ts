import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface User {
        _id?: string,
        username?: string,
        email?: string,
    }
    interface Session {
        user: {
            _id?: string,
            username?: string,
            email?: string,
        } & Default["user"]
    }
    interface JWT {
        _id?: string,
        username?: string,
        email?: string,
    }
}