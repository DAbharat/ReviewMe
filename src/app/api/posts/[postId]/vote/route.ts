import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import { User } from "next-auth";
import { z } from "zod";
import mongoose from "mongoose";
import { voteSchema } from "@/schemas/vote.schema";
import VoteModel from "@/model/vote.model";

export async function POST(request: Request,
    { params } : {
        params: {
            postId: string
        }
    }
) {
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

    const body = await request.json()
    const { postId: paramPostId } = await params

    let postId = paramPostId
    const isValidParamId = mongoose.Types.ObjectId.isValid(postId)

    if(!postId || !isValidParamId) {

        const bodyPostId = body?.postId
        if (bodyPostId && mongoose.Types.ObjectId.isValid(bodyPostId)) {
            postId = bodyPostId
            console.warn('vote route: using postId from body because param was invalid', { paramPostId, bodyPostId })
        } else {
            return Response.json({
                success: false,
                message: "Invalid post Id"
            }, {
                status: 400
            })
        }
    }

    const parsed = voteSchema.safeParse(body)

    if(!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const optionErrors = tree.properties?.option?.errors || []
        const message = [...optionErrors ].join(", ") || "Invalid request data"
        return Response.json({
            success: false,
            message,
            errors: tree
        }, {
            status: 400
        })
    }

    const { option } = parsed.data

    try {
        const userId = new mongoose.Types.ObjectId(user._id)
        const post = await PostModel.findById(postId)

        if(!post) {
            return Response.json({
                success: false,
                message: "Post not found"
            }, {
                status: 404
            })
        }

        const isOptionValid = post.poll.some(p => p.label === option)

        if(!isOptionValid) {
            return Response.json({
                success: false,
                message: "Invalid vote option"
            }, {
                status: 400
            })
        }

        let existingVote;

        try {

            existingVote = await VoteModel.findOne({
            postId,
            userId
        })

        if (existingVote) {
            return Response.json({
                success: false,
                message: "User has already voted on this post"
            }, {
                status: 400
            })
        }

        const createVote = await VoteModel.create({
                    postId,
                    userId,
                    option
        })

        await PostModel.updateOne(
                    {
                        _id: postId,
                        "poll.label": option
                    },
                    {
                        $inc: {
                            "poll.$.votes": 1
                        }
                    }
        )

        return Response.json({
            success: true,
            message: "Vote recorded successfully",
            data: createVote
        }, {
            status: 200
        })

        } catch (error: any) {

             if(error?.code === 11000) {
                    existingVote = await VoteModel.findOne({
                        postId,
                        userId
                    })
                } else throw error
        }

    } catch (error) {
        console.error("Error recording vote:", error);
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}