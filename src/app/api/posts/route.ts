import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import { User } from "next-auth";
import { postSchema } from "@/schemas/post.schema";
import { z } from "zod";
import mongoose from "mongoose";
import CommentModel from "@/model/comment.model";
import UserModel from "@/model/user.model";

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

    const body = await request.json()
    const parsed = postSchema.safeParse(body)

    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const titleErrors = tree.properties?.title?.errors || [];
        const descriptionErrors = tree.properties?.description?.errors || [];
        const imageErrors = tree.properties?.imageUrl?.errors || [];
        const imageIdErrors = tree.properties?.imagePublicId?.errors || [];
        const categoryErrors = tree.properties?.category?.errors || [];
        const message = [...titleErrors, ...descriptionErrors, ...imageErrors, ...imageIdErrors, ...categoryErrors].join(", ") || "Validation failed";
        return Response.json({
            success: false,
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    const { title, description, imageUrl, imagePublicId, category } = parsed.data

    try {
        const newPost = await PostModel.create({
            title: title.trim(),
            description: description?.trim(),
            imageUrl,
            imagePublicId: imagePublicId?.trim(),
            category,
            createdBy: new mongoose.Types.ObjectId(user._id)
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

export async function GET(request: Request) {
    await dbConnect()

    const url = new URL(request.url)
    const mine = url.searchParams.get('mine') === 'true'
    const username = url.searchParams.get('username')

    try {

        if (mine) {
            const session = await getServerSession(authOptions)
            if (!session?.user?._id) {
                return Response.json({ 
                    success: false, 
                    message: 'Not Authenticated' 
                }, { 
                    status: 401 
                })
            }
            const posts = await PostModel.find({ createdBy: session.user._id })
                .populate('createdBy', '_id username imageUrl')
                .sort({ createdAt: -1 })
                .lean()

            return Response.json({ 
                success: true, 
                message: "User Posts fetched successfully",
                data: posts 
            }, { 
                status: 200 
            })
        }

        if (username) {
            const user = await UserModel.findOne({ username: username.trim() }).lean()
            if (!user) {
                return Response.json({
                    success: true,
                    message: "Posts fetched successfully",
                    data: []
                }, { status: 200 })
            }
            const postsByUser = await PostModel
                .find({ createdBy: user._id })
                .populate("createdBy", "_id username imageUrl")
                .sort({ createdAt: -1 })
                .lean()

            return Response.json({
                success: true,
                message: "Posts fetched successfully",
                data: postsByUser
            }, { status: 200 })
        }

        const posts = await PostModel
            .find({})
            .populate("createdBy", "_id username imageUrl")
            .sort({ createdAt: -1 })
            .lean()

        return Response.json({
            success: true,
            message: "Posts fetched successfully",
            data: posts
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Fetch All Posts Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })
    }
}

