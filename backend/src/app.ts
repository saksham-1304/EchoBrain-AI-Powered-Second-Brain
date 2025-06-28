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

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL, `http://localhost:${process.env.PORT || 3004}`].filter(Boolean)
      : [
          'http://localhost:3000', 
          'http://localhost:3001', 
          'http://localhost:5173', 
          'http://localhost:4173',
          `http://localhost:${process.env.PORT || 3004}`,
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000'
        ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Body parsing middleware
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
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// API Routes
app.use("/api/v1", router);

// Serve static files from frontend dist folder (directly from frontend/dist)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
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

    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            success: false,
            message: 'CORS policy violation',
            origin: req.headers.origin
        });
        return;
    }

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
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${frontendDistPath}`);
});

export default app;