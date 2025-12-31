import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/auth/signUp.schema";
import { ApiResponse } from "@/types/ApiResponse";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {

    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get("username")
        }
        const result = UsernameQuerySchema.safeParse(queryParam)

        if (!result.success) {
            const formattedError = z.treeifyError(result.error)
            const usernameErrors = formattedError.properties?.username?.errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid username"
            }, {
                status: 400
            })
        }

        const { username } = result.data

        const existingUser = await UserModel.findOne({
            username
        })

        if (existingUser) {
            return Response.json({
                success: false,
                message: "Username is already taken",
                data: {
                    isUnique: false
                }
            }, { status: 200 })
        }

        const response: ApiResponse<{ isUnique: boolean }> = {
            success: true,
            message: "Username is available",
            data: {
                isUnique: true
            }
        }

        return Response.json(
            response,
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("Error checking username uniqueness:", error)
        return Response.json(
            {
                success: false,
                message: "Internal Server Error"
            },
            {
                status: 500
            }
        )
    }
}