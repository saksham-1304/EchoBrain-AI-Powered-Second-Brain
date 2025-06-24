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

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB database (local or cloud)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd EchoBrain-AI-Powered-Second-Brain
\`\`\`

### 2. Install Dependencies
\`\`\`bash
# Install dependencies for both frontend and backend
npm run install:all
\`\`\`

### 3. Environment Configuration

#### Backend Environment
Create a \`.env\` file in the \`backend\` directory:

\`\`\`env
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
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
\`\`\`

#### Frontend Environment
Create a \`.env\` file in the \`frontend\` directory:

\`\`\`env
VITE_API_URL=http://localhost:3004/api/v1
\`\`\`

### 4. Database Setup
1. Create a MongoDB database (local or MongoDB Atlas)
2. Update the \`MONGO_URI\` in your backend \`.env\` file
3. The application will automatically create the necessary collections

### 5. Running the Application

#### Development Mode
\`\`\`bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
\`\`\`

#### Production Mode
\`\`\`bash
# Build the application
npm run build

# Start the production server
npm start
\`\`\`

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3004/api/v1
- **Health Check**: http://localhost:3004/health

## API Endpoints

### Authentication
- \`POST /api/v1/auth/signup\` - User registration
- \`POST /api/v1/auth/signin\` - User login
- \`GET /api/v1/auth/profile\` - Get user profile (protected)
- \`POST /api/v1/auth/refresh\` - Refresh JWT token

### Content Management
- \`POST /api/v1/content\` - Create new content (protected)
- \`GET /api/v1/content/home\` - Get user's content (protected)
- \`GET /api/v1/content/stats\` - Get content statistics (protected)
- \`DELETE /api/v1/content\` - Delete content (protected)
- \`POST /api/v1/content/search\` - Semantic search (protected)

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Sign In**: Log in to access your personalized dashboard
3. **Add Content**: Upload links, documents, or create notes
4. **Search**: Use the AI-powered search to find relevant content
5. **Organize**: Tag and categorize your content for better organization

## Testing the Backend

You can test the backend API connection using the included test script:

\`\`\`bash
cd backend
node test-api.js
\`\`\`

## Troubleshooting

### Common Issues

1. **Connection Refused Error**
   - Ensure the backend is running on port 3004
   - Check if MongoDB is connected properly
   - Verify environment variables are set correctly

2. **CORS Errors**
   - Make sure \`FRONTEND_URL\` in backend \`.env\` matches your frontend URL
   - Check that CORS is properly configured in \`backend/src/app.ts\`

3. **Authentication Issues**
   - Ensure \`SECRET_KEY\` is set in backend environment
   - Check that JWT tokens are being stored correctly in localStorage
   - Verify API endpoints are accessible

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Ensure all required environment variables are set
   - Check for TypeScript compilation errors

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Commit your changes: \`git commit -am 'Add some feature'\`
4. Push to the branch: \`git push origin feature-name\`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Open an issue on the repository with detailed information about the problem

---

Built with ❤️ using the MERN stack
