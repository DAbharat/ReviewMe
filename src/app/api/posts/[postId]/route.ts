import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import { User } from "next-auth";
import mongoose from "mongoose";
import { destroyImage } from "@/lib/cloudinary";


export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    if (!session || !user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        })
    }

    try {
        const posts = await PostModel
        .find({
            createdBy: user._id
        })
        .sort({
            createdAt: -1
        })
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
        const { postId } = await request.json()

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
            message: "Internal Sever Error"
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

    try {
        const { postId, title, description, category, imageUrl, imagePublicId } = await request.json()
        const isValidPostId = mongoose.Types.ObjectId.isValid(postId)

        if (!postId || !isValidPostId) {
            return Response.json({
                success: false,
                message: "invalid Post ID"
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
                message: "Unauthorized to update this post"
            }, {
                status: 403
            })
        }

        if (typeof title === "string" && title.trim().length > 0) {
            post.title = title.trim()
        }

        if (typeof description === "string" && description !== undefined) {
            post.description = description.trim()
        }

        if (typeof category === "string" && category.trim().length > 0) {
            post.category = category.trim()
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