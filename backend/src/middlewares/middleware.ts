import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

export const userMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: "Authorization header is required"
            });
            return;
        }

        // Extract token from "Bearer TOKEN" format
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });
            return;
        }

        const decodedUser = AuthService.verifyToken(token);

        if (decodedUser && decodedUser.id) {
            // @ts-ignore
            req.userId = decodedUser.id;
            // @ts-ignore
            req.username = decodedUser.username;
            // @ts-ignore
            req.email = decodedUser.email;
            next();
        } else {
            res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
    } catch (error) {
        console.error("Authentication middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

// Optional middleware for routes that may or may not require authentication
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : authHeader;

            if (token) {
                const decodedUser = AuthService.verifyToken(token);
                if (decodedUser && decodedUser.id) {
                    // @ts-ignore
                    req.userId = decodedUser.id;
                    // @ts-ignore
                    req.username = decodedUser.username;
                    // @ts-ignore
                    req.email = decodedUser.email;
                }
            }
        }

        next();
    } catch (error) {
        console.error("Optional auth middleware error:", error);
        // Don't fail the request, just proceed without auth
        next();
    }
};