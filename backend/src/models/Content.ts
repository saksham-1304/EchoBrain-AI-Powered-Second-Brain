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
        maxlength: 500,
        index: true // Add index for search performance
    },
    type: { 
        type: String, 
        required: true,
        enum: ['youtube', 'tweet', 'link', 'document', 'note'],
        index: true // Add index for filtering
    },
    link: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 2000
    },
    tags: {
        type: [String],
        default: [],
        index: true // Add index for tag-based searches
    },
    content: {
        type: String,
        trim: true,
        maxlength: 50000 // Limit content size
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true // Critical index for user-based queries
    },
    createdAt: {
        type: String
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
contentSchema.index({ userId: 1, type: 1 });
contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, updatedAt: -1 });
contentSchema.index({ tags: 1, userId: 1 });

// Text index for search functionality
contentSchema.index({ 
    title: 'text', 
    content: 'text', 
    tags: 'text' 
}, {
    weights: {
        title: 10,
        content: 5,
        tags: 8
    }
});

// Unique constraint to prevent duplicate links per user
contentSchema.index({ userId: 1, link: 1 }, { unique: true });

// Pre-save middleware for data validation and processing
contentSchema.pre('save', function(next) {
    // Normalize tags
    if (this.tags) {
        this.tags = this.tags
            .map(tag => tag.toLowerCase().trim())
            .filter(tag => tag.length > 0 && tag.length <= 50)
            .slice(0, 20); // Limit number of tags
    }
    
    // Ensure title is not empty
    if (!this.title || this.title.trim().length === 0) {
        return next(new Error('Title is required'));
    }
    
    next();
});

// Instance methods
contentSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    return {
        id: obj._id,
        title: obj.title,
        type: obj.type,
        link: obj.link,
        tags: obj.tags,
        content: obj.content,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

// Static methods
contentSchema.statics.findByUserId = function(userId: Types.ObjectId, options: any = {}) {
    const { page = 1, limit = 20, type, sortBy = 'updatedAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    const query: any = { userId };
    if (type) query.type = type;
    
    return this.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean();
};

contentSchema.statics.searchByText = function(userId: Types.ObjectId, searchText: string, options: any = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    return this.find({
        userId,
        $text: { $search: searchText }
    }, {
        score: { $meta: 'textScore' }
    })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const ContentModel = model<IContent>("Content", contentSchema);
export type { IContent };