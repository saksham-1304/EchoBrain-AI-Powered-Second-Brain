import { z } from "zod";

// Common validation schemas
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const urlSchema = z.string().url("Invalid URL format");

export const usernameSchema = z.string()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be less than 15 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const passwordSchema = z.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters");

export const emailSchema = z.string()
    .min(5, "Email must be at least 5 characters")
    .max(50, "Email must be less than 50 characters")
    .email("Invalid email format");

export const contentTypeSchema = z.enum(['youtube', 'tweet', 'link', 'document', 'note'], {
    errorMap: () => ({ message: "Invalid content type" })
});

export const tagsSchema = z.array(z.string()).default([]).transform(tags => 
    tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0)
);

// Utility functions
export const validateObjectId = (id: string): boolean => {
    return objectIdSchema.safeParse(id).success;
};

export const validateUrl = (url: string): boolean => {
    return urlSchema.safeParse(url).success;
};

export const validateEmail = (email: string): boolean => {
    return emailSchema.safeParse(email).success;
};

// Custom error formatter
export const formatZodErrors = (errors: z.ZodError) => {
    return errors.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
    }));
};
