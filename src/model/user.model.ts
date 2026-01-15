import mongoose, { Document, Schema, Model, Types } from 'mongoose';


export interface User extends Document {
    username : string,
    email : string,
    password?: string,
    isOAuth : boolean,
    createdAt : Date
}

const userSchema: Schema<User> = new Schema({
    username: {
        type: String,
        unique: true,
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
        required: function(this: User): boolean {
            return !this.isOAuth;
        },
        minlength: 8
    },
    isOAuth : {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema)

export default UserModel;