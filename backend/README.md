# SecondBrain Backend

A powerful backend API for SecondBrain application with AI-powered content management, vector search capabilities, and intelligent content parsing.

## 🚀 Features

- **AI-Powered Content Management**: Automatically parse and analyze content from YouTube videos, tweets, and websites
- **Vector Search**: Semantic search using Google's Gemini AI and Qdrant vector database
- **Multi-Platform Support**: Handle content from YouTube, Twitter/X, and regular websites
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Content Sharing**: Generate shareable links for content collections
- **Real-time Statistics**: Track content statistics and usage analytics
- **Type Safety**: Built with TypeScript for enhanced development experience

## 🛠 Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Vector Database**: Qdrant for semantic search
- **AI/ML**: Google Gemini AI for embeddings and content generation
- **Authentication**: JWT with bcrypt for password hashing
- **Content Parsing**: Puppeteer for web scraping, YouTube API, Twitter API
- **Validation**: Zod for request validation
- **CORS**: Configured for cross-origin requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SecondBrain_Backend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables in `.env`:
   ```env
   # Database Configuration
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   
   # JWT Secret (generate a strong secret key)
   SECRET_KEY=your_super_secret_jwt_key_here_make_it_long_and_complex
   
   # Google Gemini AI API
   GEMINI_KEY=your_gemini_api_key_here
   
   # Qdrant Vector Database Configuration
   QDRANT_URL=https://your-qdrant-cluster-url
   QDRANT_KEY=your_qdrant_api_key_here
   
   # YouTube Data API v3
   YT_API=your_youtube_api_key_here
   
   # Twitter API Bearer Token
   TWEET_BEARER=your_twitter_bearer_token_here
   
   # Server Configuration
   PORT=3004
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run start:prod
   ```

## 🏗 Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # MongoDB connection
│   ├── googleai.ts  # Google AI configuration
│   └── qdrant.ts    # Qdrant vector DB configuration
├── controllers/     # Request handlers
│   ├── authController.ts
│   └── contentController.ts
├── middlewares/     # Express middlewares
│   └── middleware.ts
├── models/          # Database models
│   ├── User.ts
│   ├── Content.ts
│   ├── Link.ts
│   ├── Tag.ts
│   └── index.ts
├── routes/          # API routes
│   ├── v1/
│   │   └── index.ts
│   ├── authRoutes.ts
│   └── contentRoutes.ts
├── services/        # Business logic
│   ├── authService.ts
│   ├── contentService.ts
│   ├── contentParserService.ts
│   └── vectorService.ts
├── utils/           # Utility functions
│   ├── checkURLtype.ts
│   ├── getDate.ts
│   ├── linkType.ts
│   ├── parseWebsiteData.ts
│   ├── randomHash.ts
│   └── tweetParse.ts
├── app.ts           # Express app configuration
└── index.ts         # Application entry point
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/profile` - Get user profile (protected)

### Content Management
- `POST /api/v1/content` - Create new content (protected)
- `GET /api/v1/content/home` - Get user's content (protected)
- `GET /api/v1/content/stats` - Get content statistics (protected)
- `GET /api/v1/content/:type` - Get content by type (protected)
- `DELETE /api/v1/content` - Delete content (protected)
- `POST /api/v1/content/share` - Share/unshare content (protected)
- `POST /api/v1/content/search` - Semantic search (protected)

### Public Endpoints
- `GET /api/v1/content/shared/:shareLink` - Access shared content
- `GET /health` - Health check

## 💾 Database Models

### User Model
```typescript
interface IUser {
    username: string;
    password: string;
}
```

### Content Model
```typescript
interface IContent {
    title: string;
    type: 'youtube' | 'tweet' | 'link' | 'document' | 'note';
    link: string;
    tags: string[];
    content?: string;
    userId: ObjectId;
    createdAt?: string;
}
```

### Link Model (for sharing)
```typescript
interface ILink {
    hash: string;
    userId: ObjectId;
}
```

## 🔍 Content Types Supported

1. **YouTube Videos**: Automatically extracts video metadata, title, description, and channel information
2. **Twitter/X Posts**: Parses tweet content, author information, and engagement metrics
3. **Web Pages**: Scrapes website metadata, title, description, and main content
4. **Documents**: User-uploaded or manually created content
5. **Notes**: Simple text-based notes

## 🤖 AI Features

- **Semantic Search**: Uses Google Gemini AI to generate embeddings for content
- **Intelligent Responses**: AI-powered answers based on user's content library
- **Content Analysis**: Automatic parsing and understanding of different content types
- **Vector Storage**: Efficient storage and retrieval using Qdrant vector database

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing using bcrypt with salt rounds
- Input validation using Zod schemas
- CORS configuration for secure cross-origin requests
- Environment variable protection for sensitive data

## 📊 Available Scripts

```bash
npm run build       # Build TypeScript to JavaScript
npm run start       # Start production server
npm run dev         # Build and start development server
npm run watch       # Watch for TypeScript changes
npm run start:dev   # Start with nodemon for auto-restart
npm run start:prod  # Start in production mode
npm run clean       # Clean build directory
npm run rebuild     # Clean and rebuild
```

## 🚀 Deployment

### Prerequisites
- Node.js >= 16.0.0
- MongoDB database
- Qdrant vector database instance
- Google AI API key
- YouTube Data API key (optional)
- Twitter API credentials (optional)

### Production Setup
1. Set `NODE_ENV=production` in your environment
2. Configure your production database URLs
3. Set strong JWT secrets
4. Configure CORS for your production domain
5. Set up process management (PM2, Docker, etc.)

## 🔧 Configuration

### Environment Variables
All configuration is handled through environment variables. See `.env.example` for required variables.

### CORS Configuration
The application is configured to accept requests from:
- Development: `localhost:3000`, `localhost:3001`, `localhost:5173`
- Production: URLs specified in `FRONTEND_URL`

## 🐛 Error Handling

The application includes comprehensive error handling:
- Global error handler middleware
- Structured error responses
- Proper HTTP status codes
- Development vs production error details

## 📝 API Response Format

All API responses follow a consistent format:

```typescript
{
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}
```

## 🧪 Health Check

The application provides a health check endpoint at `/health` that returns:
- Server status
- Environment information
- Timestamp
- Available routes

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Google AI Documentation](https://ai.google.dev/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by the SecondBrain Team
