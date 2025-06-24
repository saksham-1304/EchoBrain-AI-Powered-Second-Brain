import { Schema, model, Types } from "mongoose";

interface ILink {
    hash: string;
    userId: Types.ObjectId;
}

const linkSchema = new Schema<ILink>({
    hash: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }
}, {
    timestamps: true
});

export const LinkModel = model<ILink>("Link", linkSchema);
export type { ILink };
