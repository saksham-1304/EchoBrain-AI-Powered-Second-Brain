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

            const uniqueId = uuidv4();

            // Create content in database
            const newContent = await ContentModel.create({
                title,
                link,
                type,
                tags,
                content,
                createdAt: getDate(),
                userId: new Types.ObjectId(userId)
            });

            // Insert into vector database (non-blocking)
            VectorService.insertToVectorDB({
                _id: uniqueId,
                content: title,
                url: link,
                type,
                description: content,
                userId,
                contentId: newContent._id as Types.ObjectId
            }).catch(error => {
                console.error("Vector DB insertion failed:", error);
                // Don't fail the request if vector insertion fails
            });

            return {
                success: true,
                message: "Content created successfully",
                data: {
                    id: newContent._id,
                    title: newContent.title,
                    link: newContent.link,
                    type: newContent.type,
                    tags: newContent.tags,
                    createdAt: newContent.createdAt
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

    static async getUserContent(userId: string): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            const contents = await ContentModel.find({ userId })
                .populate("userId", "username")
                .sort({ updatedAt: -1 })
                .lean();

            return {
                success: true,
                message: "Content fetched successfully",
                data: contents
            };
        } catch (error) {
            console.error("Get user content error:", error);
            return {
                success: false,
                message: "Failed to fetch content"
            };
        }
    }

    static async getContentByType(userId: string, type: string): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            const contents = await ContentModel.find({ userId, type })
                .populate("userId", "username")
                .sort({ updatedAt: -1 })
                .lean();

            return {
                success: true,
                message: `${type} content fetched successfully`,
                data: contents
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

            // Delete from database
            const deletedContent = await ContentModel.findOneAndDelete({
                _id: objectId,
                userId
            });

            if (!deletedContent) {
                return {
                    success: false,
                    message: "Content not found or unauthorized"
                };
            }

            // Delete from vector database (non-blocking)
            VectorService.deleteFromVectorDB(objectId).catch(error => {
                console.error("Vector DB deletion failed:", error);
                // Don't fail the request if vector deletion fails
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

            if (share) {
                // Check if link already exists
                const existingLink = await LinkModel.findOne({ userId });
                if (existingLink) {
                    return {
                        success: true,
                        message: "Content already shared",
                        data: { shareLink: existingLink.hash }
                    };
                }

                // Create new share link
                const hash = random(10);
                await LinkModel.create({ 
                    hash, 
                    userId: new Types.ObjectId(userId) 
                });

                return {
                    success: true,
                    message: "Content shared successfully",
                    data: { shareLink: hash }
                };
            } else {
                // Remove share link
                await LinkModel.deleteOne({ userId });

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
                .lean();

            return {
                success: true,
                message: "Shared content fetched successfully",
                data: {
                    contents,
                    owner: contents[0]?.userId
                }
            };
        } catch (error) {
            console.error("Get shared content error:", error);
            return {
                success: false,
                message: "Failed to fetch shared content"
            };
        }
    }

    static async searchContent(query: string, userId: string): Promise<ContentResponse> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: "Invalid user ID"
                };
            }

            if (!query.trim()) {
                return {
                    success: false,
                    message: "Search query cannot be empty"
                };
            }

            const searchResults = await VectorService.searchVectorDB(query, userId);

            return {
                success: true,
                message: "Search completed successfully",
                data: searchResults
            };
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

            const stats = await ContentModel.aggregate([
                { $match: { userId: new Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const totalContent = await ContentModel.countDocuments({ userId });

            return {
                success: true,
                message: "Statistics fetched successfully",
                data: {
                    total: totalContent,
                    byType: stats.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {} as Record<string, number>)
                }
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
