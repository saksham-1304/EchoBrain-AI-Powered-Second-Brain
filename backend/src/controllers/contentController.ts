import { Request, Response } from "express";
import { z } from "zod";
import { ContentService } from "../services/contentService";

// Validation schemas
const createContentSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    link: z.string().url("Invalid URL format"),
    type: z.enum(['youtube', 'tweet', 'link', 'document', 'note'], {
        errorMap: () => ({ message: "Invalid content type" })
    }),
    content: z.string().optional(),
    tags: z.array(z.string()).default([]).transform(tags => 
        tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0)
    )
});

const shareContentSchema = z.object({
    share: z.boolean()
});

const searchSchema = z.object({
    query: z.string().min(1, "Search query is required").max(500, "Query too long")
});

const deleteContentSchema = z.object({
    contentId: z.string().min(1, "Content ID is required")
});

export class ContentController {
    static async createContent(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = createContentSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid input data",
                    errors: parsedBody.error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            const { title, link, type, content, tags } = parsedBody.data;
            // @ts-ignore
            const userId = req.userId;

            const result = await ContentService.createContent({
                title,
                link,
                type,
                content,
                tags,
                userId
            });

            const statusCode = result.success ? 201 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Create content controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async getUserContent(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.userId;
            const result = await ContentService.getUserContent(userId);

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Get user content controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async getContentByType(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.userId;
            const { type } = req.params;

            if (!type) {
                res.status(400).json({
                    success: false,
                    message: "Content type is required"
                });
                return;
            }

            // Validate content type
            const validTypes = ['youtube', 'tweet', 'link', 'document', 'note'];
            if (!validTypes.includes(type)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid content type"
                });
                return;
            }

            const result = await ContentService.getContentByType(userId, type);

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Get content by type controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async deleteContent(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = deleteContentSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid input data",
                    errors: parsedBody.error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            // @ts-ignore
            const userId = req.userId;
            const { contentId } = parsedBody.data;

            const result = await ContentService.deleteContent(contentId, userId);

            const statusCode = result.success ? 200 : 
                result.message.includes("not found") ? 404 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Delete content controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async shareContent(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = shareContentSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid input data",
                    errors: parsedBody.error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            // @ts-ignore
            const userId = req.userId;
            const { share } = parsedBody.data;

            const result = await ContentService.shareContent(userId, share);

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Share content controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async getSharedContent(req: Request, res: Response): Promise<void> {
        try {
            const { shareLink } = req.params;

            if (!shareLink) {
                res.status(400).json({
                    success: false,
                    message: "Share link is required"
                });
                return;
            }

            const result = await ContentService.getSharedContent(shareLink);

            const statusCode = result.success ? 200 : 404;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Get shared content controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async searchContent(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = searchSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid input data",
                    errors: parsedBody.error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            // @ts-ignore
            const userId = req.userId;
            const { query } = parsedBody.data;

            const result = await ContentService.searchContent(query, userId);

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Search content controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async getContentStats(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.userId;
            const result = await ContentService.getContentStats(userId);

            const statusCode = result.success ? 200 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Get content stats controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}
