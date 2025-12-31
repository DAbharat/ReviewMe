import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import PostModel from "@/model/post.model";
import { User } from "next-auth";
import mongoose from "mongoose";


export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
        const user: User = session?.user
    
        if(!session || !user) {
            return Response.json({
                success: false,
                message: "Not Authenticated"
            }, {
                status: 401
            })
        }
    
    const userId = new mongoose.Types.ObjectId(user._id)
    
    try {
        const user = await UserModel.aggregate([
            {
                $match: {
                    _id: userId
                }
            },
            { 
                $unwind: "$posts"
            },
            {
                $sort: {
                    "posts.createdAt": -1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    posts: {
                        $push: "$posts"
                    }
                }
            }
        ])
        if(!user) {
            return Response.json({
                success: false,
                message: "User Not Found"
            }, {
                status: 404
            })
        }

        return Response.json({
                success: true,
                messages: user[0].posts
            }, {
                status: 200
            })
    } catch (error) {
        console.error("Fetch User Posts Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}