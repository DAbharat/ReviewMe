import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface Comment extends Document {
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    content: string,
    createdAt: Date,
}

const CommentSchema: Schema<Comment> = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const CommentModel = (mongoose.models.Comment as mongoose.Model<Comment>) || mongoose.model<Comment>("Comment", CommentSchema)

export default CommentModel;