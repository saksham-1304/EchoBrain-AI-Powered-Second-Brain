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
    refreshToken?: string;
    user?: any;
    errors?: any;
}

// Password validation utility
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push("Password must contain at least one special character");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);
    
    if (!record || now > record.resetTime) {
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (record.count >= maxAttempts) {
        return false;
    }
    
    record.count++;
    return true;
};

export class AuthService {
    static async signup(userData: UserData): Promise<AuthResponse> {
        try {
            const { email, username, password } = userData;

            // Rate limiting check
            if (!checkRateLimit(`signup_${email}`, 3, 60 * 60 * 1000)) {
                return {
                    success: false,
                    message: "Too many signup attempts. Please try again later."
                };
            }

            // Enhanced password validation
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                return {
                    success: false,
                    message: "Password does not meet security requirements",
                    errors: passwordValidation.errors
                };
            }

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

            // Hash password with stronger salt rounds
            const hashedPassword = await bcrypt.hash(password, 14);

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
    }

    static async signin(email: string, password: string): Promise<AuthResponse> {
        try {
            // Rate limiting check
            if (!checkRateLimit(`signin_${email}`, 5, 15 * 60 * 1000)) {
                return {
                    success: false,
                    message: "Too many login attempts. Please try again later."
                };
            }

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

            // Generate JWT tokens with enhanced claims
            const tokenPayload = {
                id: user._id,
                email: user.email,
                username: user.username,
                iat: Math.floor(Date.now() / 1000),
                type: 'access'
            };

            const refreshTokenPayload = {
                id: user._id,
                email: user.email,
                iat: Math.floor(Date.now() / 1000),
                type: 'refresh'
            };

            const token = jwt.sign(
                tokenPayload,
                process.env.SECRET_KEY!,
                { 
                    expiresIn: "1h",
                    issuer: "SecondBrain",
                    audience: "SecondBrain-Users"
                }
            );

            const refreshToken = jwt.sign(
                refreshTokenPayload,
                process.env.SECRET_KEY!,
                { 
                    expiresIn: "7d",
                    issuer: "SecondBrain",
                    audience: "SecondBrain-Users"
                }
            );

            // Clear rate limit on successful login
            rateLimitStore.delete(`signin_${email}`);

            return {
                success: true,
                message: "Login successful",
                token,
                refreshToken,
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
            const decoded = jwt.verify(token, process.env.SECRET_KEY!, {
                issuer: "SecondBrain",
                audience: "SecondBrain-Users"
            });

            // Validate token type
            if (typeof decoded === 'object' && decoded.type !== 'access') {
                return null;
            }

            return decoded;
        } catch (error: any) {
            console.error("Token verification error:", error.message);
            return null;
        }
    }

    static async refreshToken(token: string): Promise<AuthResponse> {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY!, {
                issuer: "SecondBrain",
                audience: "SecondBrain-Users"
            });

            if (typeof decoded !== 'object' || decoded.type !== 'refresh') {
                return {
                    success: false,
                    message: "Invalid refresh token"
                };
            }

            // Check if user still exists
            const user = await UserModel.findById(decoded.id).lean();
            if (!user) {
                return {
                    success: false,
                    message: "User not found"
                };
            }

            // Generate new access token
            const newTokenPayload = {
                id: user._id,
                email: user.email,
                username: user.username,
                iat: Math.floor(Date.now() / 1000),
                type: 'access'
            };

            const newToken = jwt.sign(
                newTokenPayload,
                process.env.SECRET_KEY!,
                { 
                    expiresIn: "1h",
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