import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types/ApiResponse";
import { ApiError } from "next/dist/server/api-utils";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json()

        const existingUserVerifiedUsingUsername = await UserModel.findOne({ username })

        if (existingUserVerifiedUsingUsername) {
            return new ApiError(401, "Username is already taken.")
        }

        const existingUserVerifiedUsingEmail = await UserModel.findOne({
            email,
        })

        if (existingUserVerifiedUsingEmail) {
            return new ApiError(400, "User with this email already exists.")
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        })
        await newUser.save()

        const response: ApiResponse = {
            success: true,
            message: "User registered successfully"
        }
        return Response.json(response, { status: 200 })


    } catch (error) {
        console.error("Sign Up Error:", error)
        return new ApiError(500, "Internal Server Error")
    }
}