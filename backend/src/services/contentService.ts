import { Types } from "mongoose";
import { ContentModel, LinkModel } from "../models";
import { VectorService } from "./vectorService";
import { getDate } from "../utils/getDate";
import { random } from "../utils/randomHash";
import { v4 as uuidv4 } from "uuid";

export interface ContentData {
    title: string;
    link: string;
    type: string;
    content?: string;
    tags: string[];
    userId: string;
}

export interface ContentResponse {
    success: boolean;
    message: string;
    data?: any;
    errors?: any;
}

// Cache for frequently accessed data
const contentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
    const cached = contentCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    contentCache.delete(key);
    return null;
};

const setCachedData = (key: string, data: any) => {
    contentCache.set(key, { data, timestamp: Date.now() });
};

export class ContentService {
    static async createContent(contentData: ContentData): Promise<ContentResponse> {
        try {
            const { title, link, type, content, tags, userId } = contentData;
            
            // Validate ObjectId
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            // Enhanced validation
            if (!title.trim() || title.length > 500) {
                return {
                    success: false,
                    message: "Title must be between 1 and 500 characters"
                };
            }

            if (!link.trim() || link.length > 2000) {
                return {
                    success: false,
                    message: "Link must be between 1 and 2000 characters"
                };
            }

            // Check for duplicate content
            const existingContent = await ContentModel.findOne({
                userId: new Types.ObjectId(userId),
                link: link.trim()
            });

            if (existingContent) {
                return {
                    success: false,
                    message: "Content with this link already exists"
                };
            }

            const uniqueId = uuidv4();

            // Create content in database with transaction
            const session = await ContentModel.startSession();
            let newContent;

            try {
                await session.withTransaction(async () => {
                    newContent = await ContentModel.create([{
                        title: title.trim(),
                        link: link.trim(),
                        type,
                        tags: tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0),
                        content: content?.trim(),
                        createdAt: getDate(),
                        userId: new Types.ObjectId(userId)
                    }], { session });
                });
            } finally {
                await session.endSession();
            }

            if (!newContent || !newContent[0]) {
                throw new Error("Failed to create content");
            }

            // Clear user's content cache
            contentCache.delete(`user_content_${userId}`);
            contentCache.delete(`user_stats_${userId}`);

            // Insert into vector database (non-blocking with better error handling)
            VectorService.insertToVectorDB({
                _id: uniqueId,
                content: title,
                url: link,
                type,
                description: content,
                userId,
                contentId: newContent[0]._id as Types.ObjectId
            }).catch(error => {
                console.error("Vector DB insertion failed:", error);
                // Log to monitoring service in production
            });

            return {
                success: true,
                message: "Content created successfully",
                data: {
                    id: newContent[0]._id,
                    title: newContent[0].title,
                    link: newContent[0].link,
                    type: newContent[0].type,
                    tags: newContent[0].tags,
                    createdAt: newContent[0].createdAt
                }
            };
        } catch (error: any) {
            console.error("Create content error:", error);
            
            // Handle duplicate key errors
            if (error.code === 11000) {
                return {
                    success: false,
                    message: "Content with this link already exists"
                };
            }

            return {
                success: false,
                message: "Failed to create content",
                errors: error.message
            };
        }
    }

    static async getUserContent(userId: string, page: number = 1, limit: number = 20): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            // Check cache first
            const cacheKey = `user_content_${userId}_${page}_${limit}`;
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
                return {
                    success: true,
                    message: "Content fetched successfully (cached)",
                    data: cachedData
                };
            }

            const skip = (page - 1) * limit;

            // Use aggregation for better performance
            const [contents, totalCount] = await Promise.all([
                ContentModel.aggregate([
                    { $match: { userId: new Types.ObjectId(userId) } },
                    { $sort: { updatedAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user',
                            pipeline: [{ $project: { username: 1 } }]
                        }
                    },
                    {
                        $addFields: {
                            userId: { $arrayElemAt: ['$user', 0] }
                        }
                    },
                    { $unset: 'user' }
                ]),
                ContentModel.countDocuments({ userId: new Types.ObjectId(userId) })
            ]);

            const result = {
                contents,
                pagination: {
                    page,
                    limit,
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit),
                    hasNext: page < Math.ceil(totalCount / limit),
                    hasPrev: page > 1
                }
            };

            // Cache the result
            setCachedData(cacheKey, result);

            return {
                success: true,
                message: "Content fetched successfully",
                data: result
            };
        } catch (error) {
            console.error("Get user content error:", error);
            return {
                success: false,
                message: "Failed to fetch content"
            };
        }
    }

    static async getContentByType(userId: string, type: string, page: number = 1, limit: number = 20): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            const validTypes = ['youtube', 'tweet', 'link', 'document', 'note'];
            if (!validTypes.includes(type)) {
                return {
                    success: false,
                    message: "Invalid content type"
                };
            }

            const skip = (page - 1) * limit;

            const [contents, totalCount] = await Promise.all([
                ContentModel.find({ userId: new Types.ObjectId(userId), type })
                    .populate("userId", "username")
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                ContentModel.countDocuments({ userId: new Types.ObjectId(userId), type })
            ]);

            return {
                success: true,
                message: `${type} content fetched successfully`,
                data: {
                    contents,
                    pagination: {
                        page,
                        limit,
                        total: totalCount,
                        pages: Math.ceil(totalCount / limit),
                        hasNext: page < Math.ceil(totalCount / limit),
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            console.error("Get content by type error:", error);
            return {
                success: false,
                message: "Failed to fetch content"
            };
        }
    }

    static async deleteContent(contentId: string, userId: string): Promise<ContentResponse> {
        try {
            // Validate ObjectIds
            if (!Types.ObjectId.isValid(contentId) || !Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid content ID or user ID"
                };
            }

            const objectId = new Types.ObjectId(contentId);

            // Use transaction for consistency
            const session = await ContentModel.startSession();
            let deletedContent;

            try {
                await session.withTransaction(async () => {
                    deletedContent = await ContentModel.findOneAndDelete({
                        _id: objectId,
                        userId: new Types.ObjectId(userId)
                    }, { session });
                });
            } finally {
                await session.endSession();
            }

            if (!deletedContent) {
                return {
                    success: false,
                    message: "Content not found or unauthorized"
                };
            }

            // Clear caches
            contentCache.delete(`user_content_${userId}`);
            contentCache.delete(`user_stats_${userId}`);

            // Delete from vector database (non-blocking)
            VectorService.deleteFromVectorDB(objectId).catch(error => {
                console.error("Vector DB deletion failed:", error);
            });

            return {
                success: true,
                message: "Content deleted successfully"
            };
        } catch (error) {
            console.error("Delete content error:", error);
            return {
                success: false,
                message: "Failed to delete content"
            };
        }
    }

    static async shareContent(userId: string, share: boolean): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            const userObjectId = new Types.ObjectId(userId);

            if (share) {
                // Check if link already exists
                const existingLink = await LinkModel.findOne({ userId: userObjectId });
                if (existingLink) {
                    return {
                        success: true,
                        message: "Content already shared",
                        data: { shareLink: existingLink.hash }
                    };
                }

                // Create new share link with better hash
                const hash = random(12); // Longer hash for better security
                await LinkModel.create({ 
                    hash, 
                    userId: userObjectId 
                });

                return {
                    success: true,
                    message: "Content shared successfully",
                    data: { shareLink: hash }
                };
            } else {
                // Remove share link
                await LinkModel.deleteOne({ userId: userObjectId });

                return {
                    success: true,
                    message: "Content sharing disabled"
                };
            }
        } catch (error) {
            console.error("Share content error:", error);
            return {
                success: false,
                message: "Failed to update sharing settings"
            };
        }
    }

    static async getSharedContent(shareLink: string): Promise<ContentResponse> {
        try {
            if (!shareLink || shareLink.length < 10) {
                return {
                    success: false,
                    message: "Invalid share link"
                };
            }

            // Check cache first
            const cacheKey = `shared_content_${shareLink}`;
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
                return {
                    success: true,
                    message: "Shared content fetched successfully (cached)",
                    data: cachedData
                };
            }

            const link = await LinkModel.findOne({ hash: shareLink });
            if (!link) {
                return {
                    success: false,
                    message: "Invalid share link"
                };
            }

            const contents = await ContentModel.find({ userId: link.userId })
                .populate("userId", "username")
                .sort({ updatedAt: -1 })
                .limit(100) // Limit shared content for performance
                .lean();

            const result = {
                contents,
                owner: contents[0]?.userId,
                shareLink
            };

            // Cache shared content for longer (since it changes less frequently)
            setCachedData(cacheKey, result);

            return {
                success: true,
                message: "Shared content fetched successfully",
                data: result
            };
        } catch (error) {
            console.error("Get shared content error:", error);
            return {
                success: false,
                message: "Failed to fetch shared content"
            };
        }
    }

    static async searchContent(query: string, userId: string, page: number = 1, limit: number = 10): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            if (!query.trim() || query.length > 500) {
                return {
                    success: false,
                    message: "Search query must be between 1 and 500 characters"
                };
            }

            // Try vector search first, fallback to text search
            try {
                const searchResults = await VectorService.searchVectorDB(query, userId, page, limit);
                return {
                    success: true,
                    message: "Search completed successfully",
                    data: searchResults
                };
            } catch (vectorError) {
                console.warn("Vector search failed, falling back to text search:", vectorError);
                
                // Fallback to MongoDB text search
                const skip = (page - 1) * limit;
                const searchRegex = new RegExp(query.trim(), 'i');
                
                const [contents, totalCount] = await Promise.all([
                    ContentModel.find({
                        userId: new Types.ObjectId(userId),
                        $or: [
                            { title: searchRegex },
                            { content: searchRegex },
                            { tags: { $in: [searchRegex] } }
                        ]
                    })
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                    ContentModel.countDocuments({
                        userId: new Types.ObjectId(userId),
                        $or: [
                            { title: searchRegex },
                            { content: searchRegex },
                            { tags: { $in: [searchRegex] } }
                        ]
                    })
                ]);

                return {
                    success: true,
                    message: "Search completed successfully (text search)",
                    data: {
                        query,
                        results: contents,
                        pagination: {
                            page,
                            limit,
                            total: totalCount,
                            pages: Math.ceil(totalCount / limit)
                        }
                    }
                };
            }
        } catch (error) {
            console.error("Search content error:", error);
            return {
                success: false,
                message: "Search failed. Please try again."
            };
        }
    }

    static async getContentStats(userId: string): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            // Check cache first
            const cacheKey = `user_stats_${userId}`;
            const cachedData = getCachedData(cacheKey);
            if (cachedData) {
                return {
                    success: true,
                    message: "Statistics fetched successfully (cached)",
                    data: cachedData
                };
            }

            const userObjectId = new Types.ObjectId(userId);

            // Enhanced statistics with aggregation
            const [stats, recentActivity] = await Promise.all([
                ContentModel.aggregate([
                    { $match: { userId: userObjectId } },
                    {
                        $group: {
                            _id: "$type",
                            count: { $sum: 1 },
                            avgTagsPerContent: { $avg: { $size: "$tags" } },
                            latestCreated: { $max: "$createdAt" }
                        }
                    }
                ]),
                ContentModel.find({ userId: userObjectId })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('title type createdAt')
                    .lean()
            ]);

            const totalContent = await ContentModel.countDocuments({ userId: userObjectId });
            const totalTags = await ContentModel.aggregate([
                { $match: { userId: userObjectId } },
                { $unwind: "$tags" },
                { $group: { _id: "$tags" } },
                { $count: "uniqueTags" }
            ]);

            const result = {
                total: totalContent,
                byType: stats.reduce((acc, item) => {
                    acc[item._id] = {
                        count: item.count,
                        avgTags: Math.round(item.avgTagsPerContent * 10) / 10,
                        latest: item.latestCreated
                    };
                    return acc;
                }, {} as Record<string, any>),
                uniqueTags: totalTags[0]?.uniqueTags || 0,
                recentActivity
            };

            // Cache the result
            setCachedData(cacheKey, result);

            return {
                success: true,
                message: "Statistics fetched successfully",
                data: result
            };
        } catch (error) {
            console.error("Get content stats error:", error);
            return {
                success: false,
                message: "Failed to fetch statistics"
            };
        }
    }
}