import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import * as Cloudinary from "@/lib/cloudinary";
import CommentModel from "@/model/comment.model";
import PostModel from "@/model/post.model";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { objectIdSchema } from "@/schemas/_helper.schema";



export async function GET(request: Request) {
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

    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            })
        }

        return Response.json({
            success: true,
            message: "User fetched successfully"
        }, {
            status: 200
        })
    } catch (error) {
        console.error("Fetch User Error:", error)
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        })
    }
}

export async function DELETE(request: NextRequest, context: any) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !user || !user._id) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, {
            status: 401
        });
    }

    const mongooseSession = await mongoose.startSession();
    try {
        mongooseSession.startTransaction();

        const userId = new mongoose.Types.ObjectId(String(user._id));

        const posts = await PostModel.find({
            createdBy: userId
        })
        .select("_id imagePublicId")
        .session(mongooseSession)
        .lean();

        const userExists = await UserModel.exists({ 
            _id: userId 
        })
        .session(mongooseSession);

        if (!userExists) {
            throw new Error("USER_NOT_FOUND");
        }

        await CommentModel.deleteMany({
            userId
        })
        .session(mongooseSession);

        await PostModel.deleteMany({
            createdBy: userId
        })
        .session(mongooseSession);

        await UserModel.deleteOne({
            _id: userId
        })
        .session(mongooseSession);

        await mongooseSession.commitTransaction();
        mongooseSession.endSession();

        for (const p of posts) {
            if (p.imagePublicId) {
                try {
                    await Cloudinary.destroyImage(p.imagePublicId);
                } catch (err) {
                    console.log("Error deleting image from Cloudinary:", err);
                }
            }
        }

        return Response.json({
            success: true,
            message: "User and associated data deleted successfully"
        }, {
            status: 200
        });

    } catch (error: any) {
        console.log("Error deleting user:", error);

        try {
            await mongooseSession.abortTransaction();
        } finally {
            mongooseSession.endSession();
        }

        if (error.message === "USER_NOT_FOUND") {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            });
        }
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}