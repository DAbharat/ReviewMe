import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type PollOptionLabel = "Worth it" | "Not worth it" | "Maybe";

export interface PollOption {
  label: PollOptionLabel;
  votes: number;
}

export interface Post extends Document {
    title : string,
    description : string,
    imageUrl : string,
    category : string,
    poll : PollOption[],
    commentCount: number,
    createdBy: Types.ObjectId,
    createdAt : Date
}

const PollOptionSchema: Schema<PollOption> = new Schema({
    label: {
        type: String,
        enum: [
            "Worth it", "Not Worth it", "Maybe"
        ],
        required: true
    },
    votes: {
        type: Number,
        required: true
    }
})

const PostSchema: Schema<Post> = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: [
            "Product", "Series", "Movie", "App", "Game", "Sport","Technology","Other"
        ],
        default: "Other",
        index: true
    },
    poll: {
        type: [PollOptionSchema],
        required: true,
        default: [
            {
                label: "Worth it", votes: 0
            },
            {
                label: "Not worth it", votes: 0
            },
            {
                label: "Maybe", votes: 0
            }
        ]
    },
    commentCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const PostModel = (mongoose.models.Post as mongoose.Model<Post>) || mongoose.model<Post>("Post", PostSchema)

export default PostModel;