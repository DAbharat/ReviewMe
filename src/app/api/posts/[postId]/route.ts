import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import { User } from "next-auth";
import mongoose from "mongoose";
import { destroyImage } from "@/lib/cloudinary";
import { updatePostSchema } from "@/schemas/updatePost.schema";
import { z } from "zod";


export async function GET(request: Request) {
    await dbConnect()

    // const session = await getServerSession(authOptions)
    // const user: User = session?.user

    // if (!session || !user) {
    //     return Response.json({
    //         success: false,
    //         message: "Not Authenticated"
    //     }, {
    //         status: 401
    //     })
    // }

    const url = new URL(request.url)
        const parts = url.pathname.split('/').filter(Boolean)
        const postId = parts[parts.length - 1]

        const isValidPostId = mongoose.Types.ObjectId.isValid(postId)

        if (!postId || !isValidPostId) {
            return Response.json({
                success: false,
                message: "Invalid Post ID"
            }, {
                status: 400
            })
        }

    try {
        const posts = await PostModel
            .findById(postId)
            .populate("createdBy", "_id username imageUrl")
            .lean()

        return Response.json({
            success: true,
            message: "User Posts fetched successfully",
            data: posts
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

export async function DELETE(request: Request) {
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
    try {

        const url = new URL(request.url)
        const parts = url.pathname.split('/').filter(Boolean)
        const postId = parts[parts.length - 1]

        const isValidPostId = mongoose.Types.ObjectId.isValid(postId)

        if (!postId || !isValidPostId) {
            return Response.json({
                success: false,
                message: "Invalid Post ID"
            }, {
                status: 400
            })
        }

        const post = await PostModel.findById(postId)

        if (!post) {
            return Response.json({
                success: false,
                message: "Post Not Found"
            }, {
                status: 404
            })
        }

        if (post.createdBy.toString() !== user._id) {
            return Response.json({
                success: false,
                message: "Unauthorized to delete this post"
            }, {
                status: 403
            })
        }

        if (post.imagePublicId) {
            try {
                await destroyImage(post.imagePublicId)
            } catch (cloudErr) {
                console.warn("Cloudinary destroy warning:", cloudErr);
            }
        }

        await PostModel.findByIdAndDelete(postId)

        return Response.json({
            success: true,
            message: "Post deleted successfully",
            postId
        }, {
            status: 200
        })

    } catch (error) {
        console.log("Delete Post Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}

export async function PUT(request: Request) {
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

    const url = new URL(request.url)
    const parts = url.pathname.split('/').filter(Boolean)
    const postId = parts[parts.length - 1]

    const isValidPostId = mongoose.Types.ObjectId.isValid(postId)


    if (!postId || !isValidPostId) {
        return Response.json({
            success: false,
            message: "invalid Post ID"
        }, {
            status: 400
        })
    }

    const body = await request.json()
    const parsed = updatePostSchema.safeParse(body)


    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const titleErrors = tree.properties?.title?.errors || [];
        const imageErrors = tree.properties?.imageUrl?.errors || [];
        const imageIdErrors = tree.properties?.imagePublicId?.errors || [];
        const categoryErrors = tree.properties?.categories?.errors || [];
        const message = [...titleErrors, ...imageErrors, ...imageIdErrors, ...categoryErrors].join(", ") || "Validation failed";

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

        const post = await PostModel.findById(postId)

        if (!post) {
            return Response.json({
                success: false,
                message: "Post Not Found"
            }, {
                status: 404
            })
        }

        if (post.createdBy.toString() !== user._id) {
            return Response.json({
                success: false,
                message: "Unauthorized to update this post"
            }, {
                status: 403
            })
        }

        if (title?.trim()) {
            post.title = title.trim()
        }

        if (typeof description === "string") {
            post.description = description?.trim()
        }

        if (categories?.length) {
            post.categories = categories
        }

        if (imageUrl && imagePublicId) {
            if (post.imagePublicId) {
                try {
                    await destroyImage(post.imagePublicId)
                } catch (cloudErr) {
                    console.warn("Cloudinary destroy warning:", cloudErr);
                }
            }
            post.imageUrl = imageUrl;
            post.imagePublicId = imagePublicId;
        }

        await post.save()

        return Response.json({
            success: true,
            message: "Post updated successfully",
            data: post
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Update Post Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}