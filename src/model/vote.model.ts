import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type VoteOption = "Worth it" | "Not worth it" | "Maybe";

export interface Vote extends Document {
    postId: Types.ObjectId,
    userId: Types.ObjectId,
    option: VoteOption,
    createdAt: Date
}

const VoteSchema: Schema<Vote> = new Schema({
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
    option: {
        type: String,
        enum: [
            "Worth it", "Not worth it", "Maybe"
        ],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const VoteModel = (mongoose.models.Vote as mongoose.Model<Vote>) || mongoose.model<Vote>("Vote", VoteSchema)

export default VoteModel;