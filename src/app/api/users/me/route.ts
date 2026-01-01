import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";

export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if(!session || !user || !user._id) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        })
    }

    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)
    
        if(!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            })
        }
    
        return Response.json({
            success: true,
            message: "User fetched successfully"
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Fetch User Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}