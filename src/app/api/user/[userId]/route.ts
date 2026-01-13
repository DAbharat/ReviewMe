import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import CommentModel from "@/model/comment.model";
import PostModel from "@/model/post.model";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { objectIdSchema } from "@/schemas/_helper.schema";


export async function DELETE(request: NextRequest, context: any) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    const params = await (context?.params ?? {})
    const parsed = objectIdSchema.safeParse(params.userId)
    if (!parsed.success) {
        return Response.json({
            success: false,
            message: "Invalid user ID"
        }, {
            status: 400
        })
    }

    if(!session || !user || !user._id || user._id !== params.userId) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, {
            status: 401
        })
    }

    const mongooseSession = await mongoose.startSession()

    try {
        mongooseSession.startTransaction()

        await CommentModel.deleteMany({
            userId: params.userId
        }, {
            session: mongooseSession
        })

        await PostModel.deleteMany({
            createdBy: params.userId
        }, {
            session: mongooseSession
        })

        await UserModel.deleteOne({
            _id: params.userId
        }, {
            session: mongooseSession
        })

        await mongooseSession.commitTransaction()
        mongooseSession.endSession()

        return Response.json({
            success: true,
            message: "User and associated data deleted successfully"
        }, {
            status: 200
        })

    } catch (error) {
        
        console.log("Error deleting user:", error)
        await mongooseSession.abortTransaction()
        mongooseSession.endSession()

        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}