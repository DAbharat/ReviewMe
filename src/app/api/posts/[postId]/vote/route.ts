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

    const { postId } = params
    const isValidPostId = mongoose.Types.ObjectId.isValid(postId)

    if(!postId || !isValidPostId) {
        return Response.json({
            success: false,
            message: "Invalid post Id"
        }, {
            status: 400
        })
    }

    const body = await request.json()
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

        let existingVote = await VoteModel.findOne({
            postId,
            userId
        })

        if(!existingVote) {
            try {
                await VoteModel.create({
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
            } catch (error: any) {
                if(error?.code === 11000) {
                    existingVote = await VoteModel.findOne({
                        postId,
                        userId
                    })
                } else throw error
            }
        } else if (existingVote && existingVote.option !== option) {
            await PostModel.updateOne(
                {
                    _id: postId,
                    "poll.label": existingVote.option
                },
                {
                    $inc: {
                        "poll.$.votes": -1
                    }
                }
            )

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

            existingVote.option = option
            await existingVote.save()
        }

        return Response.json({
            success: true,
            message: "Vote recorded successfully"
        }, {
            status: 200
        })

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