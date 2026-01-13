import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import { User } from "next-auth";
import { postSchema } from "@/schemas/post.schema";
import { z } from "zod";
import mongoose, { SortOrder } from "mongoose";
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
        const categoryErrors = tree.properties?.categories?.errors || [];
        const message = [...titleErrors, ...descriptionErrors, ...imageErrors, ...imageIdErrors, ...categoryErrors].join(", ") || "Validation failed";
        return Response.json({
            success: false,
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    const { title, description, imageUrl, imagePublicId, categories } = parsed.data

    try {
        const newPost = await PostModel.create({
            title: title.trim(),
            description: description?.trim(),
            imageUrl,
            imagePublicId: imagePublicId?.trim(),
            categories: categories && categories.length ? categories : ["Other"],
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

  const mine = url.searchParams.get("mine") === "true"
  const username = url.searchParams.get("username")?.trim()
  const search = url.searchParams.get("search")?.trim()

  const query: any = {}

  try {

    if (search) {
      query.$text = { $search: search }
    }

    if (mine) {
      const session = await getServerSession(authOptions)
      if (!session?.user?._id) {
        return Response.json(
          { success: false, message: "Not Authenticated" },
          { status: 401 }
        )
      }
      query.createdBy = session.user._id
    }

    if (username) {
      const user = await UserModel.findOne({ username }).lean()
      if (!user) {
        return Response.json({
          success: true,
          message: "Posts fetched successfully",
          data: []
        })
      }
      query.createdBy = user._id
    }

    const sort: Record<string, SortOrder | { $meta: "textScore" }> = search
  ? { score: { $meta: "textScore" } }
  : { createdAt: -1 }

    const projection = search
      ? { score: { $meta: "textScore" } }
      : {}

    const posts = await PostModel.find(query, projection)
      .populate("createdBy", "_id username imageUrl")
      .sort(sort)
      .lean()

    return Response.json({
      success: true,
      message: "Posts fetched successfully",
      data: posts
    })
  } catch (error) {
    console.error("Fetch Posts Error:", error)
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}


