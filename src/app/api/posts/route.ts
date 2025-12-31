import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import { User } from "next-auth";


export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !user || !user._id) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        })
    }

    const userId = user._id
    const { title, description, imageUrl } = await request.json()

    if (!title || !imageUrl) {
        return Response.json({
            success: false,
            message: "Title and Image URL are required"
        }, {
            status: 400
        })
    }

    try {
        const newPost = await PostModel.create({
            title: title.trim(),
            description: description?.trim(),
            imageUrl: imageUrl,
            createdBy: userId
        })

        return Response.json({
            success: true,
            message: "Post created successfully",
            data: newPost
        }, {
            status: 201
        })
    } catch (error) {
        console.error("Create Post Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}