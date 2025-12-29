import mongoose, { Document, Schema, Model, Types } from 'mongoose';


export interface User extends Document {
    username : string,
    email : string,
    password : string,
    isVerified : boolean,
    verifyCode : string,
    verifyCodeExpiry : Date,
    createdAt : Date
}

const userSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifyCode: {
        type: String
    },
    verifyCodeExpiry: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema)

export default UserModel;