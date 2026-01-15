import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types/ApiResponse";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json()

        if(!username || !email || !password) {
            const error: ApiResponse = { 
                success: false, 
                message: "Username, email, and password are required.", 
                data: null 
            }
            return Response.json(error, { 
                status: 400 
            })
        }

        const existingUserVerifiedUsingUsername = await UserModel.findOne({ username })

        if (existingUserVerifiedUsingUsername) {
            const error: ApiResponse = { success: false, message: "Username is already taken.", data: null }
            return Response.json(error, { status: 401 })
        }

        const existingUserVerifiedUsingEmail = await UserModel.findOne({
            email,
        })

        if (existingUserVerifiedUsingEmail) {
            const error: ApiResponse = { success: false, message: "User with this email already exists.", data: null }
            return Response.json(error, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            isOAuth: false,
            createdAt: new Date()
        })
        await newUser.save()

        const response: ApiResponse = {
            success: true,
            message: "User registered successfully",
            data: null
        }
        return Response.json(response, { status: 200 })


    } catch (error) {
        console.error("Sign Up Error:", error)
        const err: ApiResponse = { success: false, message: "Internal Server Error", data: null }
        return Response.json(err, { status: 500 })
    }
}