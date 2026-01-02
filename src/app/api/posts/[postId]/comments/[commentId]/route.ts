import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import CommentModel from "@/model/comment.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(
    request: Request,
    {
        params,
    }: {
        params: {
            postId: string;
            commentId: string;
        };
    }
) {
    await dbConnect();

    const sessionAuth = await getServerSession(authOptions);
    const user: User = sessionAuth?.user;

    if (!sessionAuth || !user || !user._id) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        });
    }

    const { postId, commentId } = params;
    const isValidPostId = mongoose.Types.ObjectId.isValid(postId)
    const isValidCommentId = mongoose.Types.ObjectId.isValid(commentId)

    if (!postId || !commentId || !isValidPostId || !isValidCommentId) {
        return Response.json({
            success: false,
            message: "Invalid postId or commentId"
        }, {
            status: 400
        });
    }

    try {
        const comment = await CommentModel.findById(commentId);

        if(!comment || comment.postId.toString() !== postId) {
            return Response.json({
                success: false,
                message: "Comment not found"
            }, {
                status: 404
            })
        }

        if(comment.userId.toString() !== user._id) {
            return Response.json({
                success: false,
                message: "Unauthorized to delete this comment"
            }, {
                status: 403
            })
        }

        await CommentModel.findByIdAndDelete(commentId)
        await PostModel.updateOne({
            _id: postId,
            commentCount: {
                $gt: 0
            }
        },
            {
                $inc: {
                    commentCount: -1
                }
            }
        )

    } catch (error) {
        console.error("Error deleting comment:", error);
        return Response.json({
            success: false,
            message: "Error deleting comment"
        }, {
            status: 500
        })
    }
}