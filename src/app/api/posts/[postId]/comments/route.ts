import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbconnect";
import PostModel from "@/model/post.model";
import CommentModel from "@/model/comment.model";
import { User } from "next-auth";
import { commentSchema } from "@/schemas/comment.schema";
import { z } from "zod";


export async function POST(request: Request) {
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

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    const tree = z.treeifyError(parsed.error);
    const contentErrors = tree.properties?.content?.errors || [];
    const message = contentErrors.join(", ") || "Validation failed";

    return Response.json({ 
        success: false, 
        message, 
        errors: tree 
    }, { 
        status: 400 
    });
  }

  const { postId, content } = parsed.data;

  try {
    const post = await PostModel.findById(postId)

    if(!post) {
      return Response.json({
        success: false,
        message: "post not found"
      }, {
        status: 404
      })
    }

    const createComment = await CommentModel.create({
      postId,
      userId: user._id,
      content: content.trim()
    })

    await PostModel.updateOne(
      {
        _id: postId
      },
      {
        $inc: {
          commentCount: 1
        }
      }
    )

    return Response.json({
      success: true,
      message: "Comment created successfully",
      data: createComment
    }, {
      status: 200
    })

  } catch (error) {
    console.error("Error creating comment:", error);
    return Response.json({
      success: false,
      message: "Internal Server Error"
    }, {
      status: 500
    })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
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