// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
} as const;

// Content Types
export const CONTENT_TYPES = {
    YOUTUBE: 'youtube',
    TWEET: 'tweet',
    LINK: 'link',
    DOCUMENT: 'document',
    NOTE: 'note'
} as const;

// API Response Messages
export const MESSAGES = {
    // Auth messages
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    INVALID_CREDENTIALS: 'Invalid username or password',
    USER_EXISTS: 'Username already exists',
    TOKEN_REQUIRED: 'Authorization token is required',
    INVALID_TOKEN: 'Invalid or expired token',
    
    // Content messages
    CONTENT_CREATED: 'Content created successfully',
    CONTENT_FETCHED: 'Content fetched successfully',
    CONTENT_DELETED: 'Content deleted successfully',
    CONTENT_NOT_FOUND: 'Content not found or unauthorized',
    CONTENT_SHARED: 'Content shared successfully',
    CONTENT_SHARING_DISABLED: 'Content sharing disabled',
    
    // Search messages
    SEARCH_SUCCESS: 'Search completed successfully',
    SEARCH_FAILED: 'Search failed. Please try again.',
    
    // General messages
    INVALID_INPUT: 'Invalid input data',
    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Route not found',
    SERVER_HEALTHY: 'Server is healthy'
} as const;

// JWT Configuration
export const JWT_CONFIG = {
    EXPIRES_IN: '7d',
    ISSUER: 'SecondBrain',
    AUDIENCE: 'SecondBrain-Users'
} as const;

// Database Configuration
export const DB_CONFIG = {
    SALT_ROUNDS: 12,
    CONNECTION_TIMEOUT: 30000,
    BUFFER_MAX_ENTRIES: 0
} as const;

// Vector Database Configuration
export const VECTOR_CONFIG = {
    COLLECTION_NAME: 'test_collection',
    SEARCH_LIMIT: 10,
    EMBEDDING_DIMENSION: 768
} as const;

// Rate Limiting
export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
    MESSAGE: 'Too many requests from this IP, please try again later.'
} as const;

// Validation Constraints
export const VALIDATION = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 15,
        PATTERN: /^[a-zA-Z0-9_]+$/
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        MAX_LENGTH: 50
    },
    EMAIL: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 50
    },
    TITLE: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 200
    },
    SEARCH_QUERY: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 500
    },
    SHARE_HASH_LENGTH: 10
} as const;

// Content parsing timeouts
export const PARSING_CONFIG = {
    YOUTUBE_TIMEOUT: 10000,
    TWITTER_TIMEOUT: 8000,
    WEBSITE_TIMEOUT: 15000,
    PUPPETEER_TIMEOUT: 20000
} as const;

// CORS Configuration
export const CORS_CONFIG = {
    DEVELOPMENT_ORIGINS: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173'
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization']
} as const;
