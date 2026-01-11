import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import CommentModel from "@/model/comment.model";
import { User } from "next-auth";
import mongoose from "mongoose";
import { updateCommentSchema } from "@/schemas/updateComment.schema";
import z from "zod";


export async function GET(request: Request, context: any) {
    const rawParams = context?.params
    const params = rawParams instanceof Promise ? await rawParams : rawParams
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

  try {
        const comments = await CommentModel.find({ postId: params.postId })
      .populate("userId", "username _id")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ 
        success: true, 
        message: "Comments fetched successfully", 
        data: comments }, 
        { 
            status: 200 
        });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return Response.json({ 
        success: false, 
        message: "Internal Server Error" 
    }, { 
        status: 500 
    });
  }
}


export async function DELETE(request: Request, context: any) {
    const rawParams = context?.params
    const params = rawParams instanceof Promise ? await rawParams : rawParams
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

        return Response.json({
            success: true,
            message: "Comment deleted successfully",
            data: commentId
        }, {
            status: 200
        })

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

export async function PUT(request: Request, context: any) {
    const rawParams = context?.params
    const params = rawParams instanceof Promise ? await rawParams : rawParams
    await dbConnect()

    const sessionAuth = await getServerSession(authOptions)
    const user: User = await sessionAuth?.user

    if(!sessionAuth || !user || !user._id) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        })
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

    const body = await request.json()
    const parsed = updateCommentSchema.safeParse(body)

    if(!parsed.success) {
        const tree = z.treeifyError(parsed.error)
        const contentErrors = tree.properties?.content?.errors || []
        const message = contentErrors.join(", ") || "Validation failed"

        return Response.json({
            success: false,
            message,
            errors: tree
        }, {
            status: 400
        })
    }

        const { content } = parsed.data

    try {

        const updateComment = await CommentModel.findById(commentId)
        if(!updateComment || updateComment.postId.toString() !== postId) {
            return Response.json({
                success: false,
                message: "Comment not found"
            }, {
                status: 404
            })
        }

        if(updateComment.userId.toString() !== user._id) {
            return Response.json({
                success: false,
                message: "Unauthorized to update this comment"
            }, {
                status: 403
            })
        }

        updateComment.content = content;
        await updateComment.save();

        return Response.json({
            success: true,
            message: "Comment updated successfully",
            data: updateComment
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Error updating comment:", error);
        return Response.json({
            success: false,
            message: "Error updating comment"
        }, {
            status: 500
        })
    }
    
}