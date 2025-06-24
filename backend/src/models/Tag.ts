import { Schema, model } from "mongoose";

interface ITag {
    title: string;
}

const tagSchema = new Schema<ITag>({
    title: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
});

export const TagModel = model<ITag>("Tag", tagSchema);
export type { ITag };
