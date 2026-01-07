import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import { User } from "next-auth";
import { postSchema } from "@/schemas/post.schema";
import { z } from "zod";
import mongoose from "mongoose";


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
        const imageErrors = tree.properties?.imageUrl?.errors || [];
        const imageIdErrors = tree.properties?.imagePublicId?.errors || [];
        const categoryErrors = tree.properties?.category?.errors || [];
        const message = [...titleErrors, ...imageErrors, ...imageIdErrors, ...categoryErrors].join(", ") || "Validation failed";

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