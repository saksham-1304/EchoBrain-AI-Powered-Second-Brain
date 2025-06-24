import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/database";
import { router } from "./routes/v1";

// Load environment variables first
dotenv.config();

// Create Express application
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, `http://localhost:${process.env.PORT || 3004}`].filter(Boolean)
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', `http://localhost:${process.env.PORT || 3004}`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use("/api/v1", router);

// Serve static files from frontend dist folder
const frontendDistPath = path.join(__dirname, '../dist','frontend','dist');
app.use(express.static(frontendDistPath));

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req: express.Request, res: express.Response) => {
    // Don't serve React app for API routes or health endpoint
    if (req.path.startsWith('/api/') || req.path === '/health') {
        res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} not found`,
            availableRoutes: [
                'GET /health',
                'POST /api/v1/auth/signup',
                'POST /api/v1/auth/signin',
                'GET /api/v1/auth/profile',
                'POST /api/v1/content',
                'GET /api/v1/content/home',
                'POST /api/v1/content/search'
            ]
        });
        return;
    }
    
    // Serve React app
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api/v1`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
