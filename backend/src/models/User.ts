import { Schema, model } from "mongoose";

interface IUser {
    email: string;
    username: string;
    password: string;
}

const userSchema = new Schema<IUser>({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    }
}, {
    timestamps: true
});

export const UserModel = model<IUser>("User", userSchema);
export type { IUser };
