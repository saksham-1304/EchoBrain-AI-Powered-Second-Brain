import { Response } from 'express';
import { HTTP_STATUS, MESSAGES } from './constants';

export interface ApiError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const createError = (message: string, statusCode: number): AppError => {
    return new AppError(message, statusCode);
};

export const sendErrorResponse = (res: Response, error: ApiError | Error, defaultMessage: string = MESSAGES.INTERNAL_ERROR): void => {
    const statusCode = (error as ApiError).statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || defaultMessage;
    
    console.error('Error:', {
        message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

export const sendSuccessResponse = (res: Response, data: any, message: string, statusCode: number = HTTP_STATUS.OK): void => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
    return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Common error types
export const createValidationError = (message: string) => createError(message, HTTP_STATUS.BAD_REQUEST);
export const createAuthError = (message: string = MESSAGES.INVALID_TOKEN) => createError(message, HTTP_STATUS.UNAUTHORIZED);
export const createForbiddenError = (message: string) => createError(message, HTTP_STATUS.FORBIDDEN);
export const createNotFoundError = (message: string) => createError(message, HTTP_STATUS.NOT_FOUND);
export const createConflictError = (message: string) => createError(message, HTTP_STATUS.CONFLICT);
