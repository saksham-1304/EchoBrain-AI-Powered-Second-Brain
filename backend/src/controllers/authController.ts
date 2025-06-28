import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/authService";

// Validation schemas
const signupSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password must be less than 50 characters")
});

const signinSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(50, "Password must be less than 50 characters")
});

const refreshTokenSchema = z.object({
    token: z.string().min(1, "Token is required")
});

export class AuthController {
    static async signup(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = signupSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid input data",
                    errors: parsedBody.error.errors.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            const { email, username, password } = parsedBody.data;
            const result = await AuthService.signup({ email, username, password });

            const statusCode = result.success ? 201 : 
                result.message.includes("exists") ? 409 : 400;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Signup controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async signin(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = signinSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid input data",
                    errors: parsedBody.error.errors.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            const { email, password } = parsedBody.data;
            const result = await AuthService.signin(email, password);

            const statusCode = result.success ? 200 : 401;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Signin controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = refreshTokenSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({
                    success: false,
                    message: "Invalid input data",
                    errors: parsedBody.error.errors.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
                return;
            }

            const { token } = parsedBody.data;
            const result = await AuthService.refreshToken(token);

            const statusCode = result.success ? 200 : 401;
            res.status(statusCode).json(result);
        } catch (error) {
            console.error("Refresh token controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.userId;
            // @ts-ignore  
            const username = req.username;
            // @ts-ignore
            const email = req.email;

            res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                data: {
                    id: userId,
                    username,
                    email,
                    name: username // Add name field for frontend compatibility
                }
            });
        } catch (error) {
            console.error("Get profile controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}