# EchoBrain - AI-Powered Second Brain

A full-stack MERN application that serves as your AI-powered second brain for storing, organizing, and retrieving information.

## Features

- **Authentication**: Email/password-based user authentication with JWT tokens
- **Content Management**: Store and organize different types of content (links, documents, notes, etc.)
- **AI-Powered Search**: Semantic search capabilities powered by vector databases
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** for data storage
- **JWT** for authentication
- **Qdrant** for vector search
- **Google Gemini AI** for content processing
- **TypeScript** for type safety

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Router** for navigation
- **TanStack Query** for data fetching

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB database (local or cloud)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EchoBrain-AI-Powered-Second-Brain
```

### 2. Environment Configuration

#### Backend Environment
Create a `.env` file in the `backend` directory:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secret (generate a strong secret key)
SECRET_KEY=your_super_secret_jwt_key_here_make_it_long_and_complex

# Google Gemini AI API (optional)
GEMINI_KEY=your_gemini_api_key_here

# Qdrant Vector Database Configuration (optional)
QDRANT_URL=https://your-qdrant-cluster-url
QDRANT_KEY=your_qdrant_api_key_here

# YouTube Data API v3 (optional)
YT_API=your_youtube_api_key_here

# Twitter API Bearer Token (optional)
TWEET_BEARER=your_twitter_bearer_token_here

# Server Configuration
PORT=3004
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3004
```

### 3. Build and Run

```bash
# Build the entire application (installs dependencies and builds frontend)
npm run build

# Start the production server (builds backend and serves the app)
npm start
```

### 4. Access the Application
- **Application**: http://localhost:3004
- **API**: http://localhost:3004/api/v1
- **Health Check**: http://localhost:3004/health

## Development

For development, you can run the frontend and backend separately:

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Content Management
- `POST /api/v1/content` - Create new content (protected)
- `GET /api/v1/content/home` - Get user's content (protected)
- `GET /api/v1/content/stats` - Get content statistics (protected)
- `DELETE /api/v1/content` - Delete content (protected)
- `POST /api/v1/content/search` - Semantic search (protected)

## Production Deployment

The application is designed to run as a single server that serves both the API and the frontend:

1. **Build**: `npm run build` - Installs dependencies and builds the frontend
2. **Start**: `npm start` - Builds the backend, copies frontend assets, and starts the server

The backend automatically serves the React frontend from the `/dist` folder and handles API routes under `/api/v1`.

## Environment Variables

### Required
- `MONGO_URI` - MongoDB connection string
- `SECRET_KEY` - JWT secret key

### Optional
- `GEMINI_KEY` - Google Gemini AI API key
- `QDRANT_URL` - Qdrant vector database URL
- `QDRANT_KEY` - Qdrant API key
- `YT_API` - YouTube Data API key
- `TWEET_BEARER` - Twitter API bearer token
- `PORT` - Server port (default: 3004)
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Node.js version is 16 or higher
   - Clear node_modules and run `npm run build` again
   - Check that all required environment variables are set

2. **Database Connection**
   - Verify MongoDB URI is correct
   - Ensure database is accessible from your network
   - Check MongoDB Atlas IP whitelist if using cloud database

3. **Port Conflicts**
   - Change the PORT environment variable if 3004 is in use
   - Ensure no other services are running on the same port

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using the MERN stack