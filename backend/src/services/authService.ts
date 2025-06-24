import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models";

export interface UserData {
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: any;
    errors?: any;
}

export class AuthService {    static async signup(userData: UserData): Promise<AuthResponse> {
        try {
            const { email, username, password } = userData;

            // Check if user already exists by email or username
            const existingUser = await UserModel.findOne({ 
                $or: [
                    { email: email.toLowerCase() },
                    { username: username.toLowerCase() }
                ]
            });
            
            if (existingUser) {
                if (existingUser.email === email.toLowerCase()) {
                    return {
                        success: false,
                        message: "Email already exists"
                    };
                } else {
                    return {
                        success: false,
                        message: "Username already exists"
                    };
                }
            }

            // Validate password strength
            if (password.length < 6) {
                return {
                    success: false,
                    message: "Password must be at least 6 characters long"
                };
            }

            // Hash password with stronger salt rounds
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user
            const newUser = await UserModel.create({
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: hashedPassword
            });

            return {
                success: true,
                message: "User created successfully",
                user: { 
                    id: newUser._id, 
                    email: newUser.email,
                    username: newUser.username 
                }
            };
        } catch (error: any) {
            console.error("Signup error:", error);
            
            // Handle duplicate key errors
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                return {
                    success: false,
                    message: `${field === 'email' ? 'Email' : 'Username'} already exists`
                };
            }

            return {
                success: false,
                message: "Failed to create user",
                errors: error.message
            };
        }
    }    static async signin(email: string, password: string): Promise<AuthResponse> {
        try {
            // Find user by email (case insensitive)
            const user = await UserModel.findOne({ 
                email: email.toLowerCase() 
            }).lean();
            
            if (!user) {
                return {
                    success: false,
                    message: "Invalid email or password"
                };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: "Invalid email or password"
                };
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user._id,
                    email: user.email,
                    username: user.username 
                },
                process.env.SECRET_KEY!,
                { 
                    expiresIn: "7d",
                    issuer: "SecondBrain",
                    audience: "SecondBrain-Users"
                }
            );

            return {
                success: true,
                message: "Login successful",
                token,
                user: { 
                    id: user._id,
                    email: user.email,
                    username: user.username 
                }
            };
        } catch (error) {
            console.error("Signin error:", error);
            return {
                success: false,
                message: "Login failed. Please try again."
            };
        }
    }

    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, process.env.SECRET_KEY!, {
                issuer: "SecondBrain",
                audience: "SecondBrain-Users"
            });
        } catch (error: any) {
            console.error("Token verification error:", error.message);
            return null;
        }
    }

    static async refreshToken(token: string): Promise<AuthResponse> {
        try {
            const decoded = this.verifyToken(token);
            if (!decoded) {
                return {
                    success: false,
                    message: "Invalid token"
                };
            }

            // Check if user still exists
            const user = await UserModel.findById(decoded.id).lean();
            if (!user) {
                return {
                    success: false,
                    message: "User not found"
                };
            }            // Generate new token
            const newToken = jwt.sign(
                { 
                    id: user._id,
                    email: user.email,
                    username: user.username 
                },
                process.env.SECRET_KEY!,
                { 
                    expiresIn: "7d",
                    issuer: "SecondBrain",
                    audience: "SecondBrain-Users"
                }
            );

            return {
                success: true,
                message: "Token refreshed successfully",
                token: newToken,
                user: { 
                    id: user._id,
                    email: user.email,
                    username: user.username 
                }
            };
        } catch (error) {
            console.error("Refresh token error:", error);
            return {
                success: false,
                message: "Failed to refresh token"
            };
        }
    }
}
