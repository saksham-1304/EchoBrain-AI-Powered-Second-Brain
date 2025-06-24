import { Schema, model, Types } from "mongoose";

interface IContent {
    title: string;
    type: string;
    link: string;
    tags: string[];
    content?: string;
    userId: Types.ObjectId;
    createdAt?: string;
}

const contentSchema = new Schema<IContent>({
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 200
    },
    type: { 
        type: String, 
        required: true,
        enum: ['youtube', 'tweet', 'link', 'document', 'note']
    },
    link: { 
        type: String, 
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    content: {
        type: String,
        trim: true
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    createdAt: {
        type: String
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
contentSchema.index({ userId: 1, type: 1 });
contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ tags: 1 });

export const ContentModel = model<IContent>("Content", contentSchema);
export type { IContent };
