This is a [Next.js](https://nextjs.org/) project for BigBrain - AI-Powered Team Documentation.

## 📋 Overview

**BigBrain** is a full-stack modern web application combining document management, vector embeddings, and conversational AI to power intelligent team documentation systems. Teams can centralize documentation, run semantic searches, and interact with content through AI-powered chat interfaces.

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component primitives
- **React Hook Form + Zod** - Forms & validation
- **Lucide React** - Icon library
- **Next Themes** - Dark/light modes

### Backend
- **Convex** - Real-time backend with vector DB & storage
- **OpenAI API** - Text embeddings (1536D) & LLM
- **Clerk + Svix** - OAuth & organization webhooks

## 🎯 Data Model

- **Documents** - Organization documents with vector embeddings
- **Notes** - Personal notes with semantic search
- **Chats** - Document-specific conversation history
- **Memberships** - Organization to user relationships

## 📡 API Overview

### Core Endpoints (via Convex)
- **Documents API** - CRUD operations, upload, search
- **Notes API** - Create, read, update, delete, search
- **Chat API** - Send message, get history
- **Search API** - Vector similarity search with filters
- **Memberships API** - Organization access management

### Webhooks
- **Clerk Org Changes** - User added/removed from org (via Svix)

## 🔄 Architecture

### Vector Search Pipeline
1. Documents ingested and chunked
2. OpenAI generates 1536-dimensional embeddings
3. Embeddings indexed in Convex vector DB
4. Semantic similarity search with org/user filtering

### Authentication Flow
1. Clerk OAuth handles user login
2. Organization membership via Clerk webhooks (Svix)
3. Token-based access control
4. Protected Convex mutations & queries

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Clerk account with OAuth setup
- OpenAI API key
- Convex account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
CLERK_HOSTNAME=your_hostname
NEXT_PUBLIC_CONVEX_URL=your_url
OPENAI_API_KEY=your_key
```

3. Run development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables Reference

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_HOSTNAME=clerk_hostname

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud

# OpenAI
OPENAI_API_KEY=sk-...

# Optional for webhooks
SVIX_SIGNING_SECRET=whsec_...
```

## 📁 Project Structure

```
app/                  # Next.js app with dashboard
├── dashboard/
│   ├── documents/    # Document management
│   ├── notes/        # Note-taking
│   ├── search/       # Semantic search
│   └── settings/     # User settings
convex/              # Backend functions
├── schema.ts         # Data models
├── documents.ts      # Doc operations
├── notes.ts          # Notes & embeddings
├── chats.ts          # Chat history
├── search.ts         # Vector search
└── http.ts           # Webhooks
components/          # React components
lib/                 # Utilities
```

## 🎨 Key Features

### 📄 Document Management
- Upload & organize team documents
- Automatic embedding generation
- Organization-level access control
- Full metadata tracking

### 🔍 Semantic Search
- 1536-dimensional vector search
- Cross-document knowledge discovery
- Real-time indexing
- Org & user-filtered results

### 🤖 AI Chat Interface
- Per-document Q&A
- Context-aware AI responses
- Conversation history
- Real-time streaming

### 📝 Notes System
- Quick note creation
- Vector-indexed full-text search
- Org sharing capabilities
- Instant search

## 🔧 Development

```bash
npm run dev     # Development server (hot reload)
npm run build   # Production build
npm start       # Start production server
npm run lint    # Run ESLint & TypeScript
```

### Development Best Practices
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Zod for runtime validation
- Write reusable Radix UI components
- Keep Convex functions focused
- Test authentication flows with Clerk

## 🧪 Testing & QA

- Client components tested with React Testing Library
- Convex functions with unit tests
- Integration tests for auth flows
- Manual testing on staging environment
- Browser compatibility testing

## 🔐 Security

- **Authentication**: Clerk OAuth with JWT tokens
- **Authorization**: Organization-based access control
- **Data Isolation**: User/org-specific data filtering
- **API Security**: Protected Convex mutations
- **Webhooks**: Svix-signed Clerk webhooks
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Built-in rate limiting
- **HTTPS**: Required for all connections

## 🚢 Deployment

### Deployment Platforms
- **Vercel** (recommended) - Zero-config Next.js deployment
- **AWS** - EC2, Elastic Beanstalk, or Amplify
- **Google Cloud** - App Engine or Cloud Run
- **Azure** - App Service or Container Instances

### Environment Configuration
Required for all deployments:
- Clerk OAuth credentials
- OpenAI API key
- Convex URL & API key
- Database connection strings

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS policies
- [ ] Enable HTTPS
- [ ] Set up monitoring & logging
- [ ] Configure rate limiting
- [ ] Run security audit

## � Troubleshooting

### Embedding Generation Fails
- Verify OpenAI API key is valid
- Check rate limits with OpenAI
- Ensure documents are in supported format

### Authentication Issues
- Verify Clerk keys in environment
- Check OAuth callback URLs
- Clear browser cookies if stuck

### Vector Search Returns No Results
- Ensure embeddings were generated
- Check org/user permissions
- Verify vector index is populated

### Convex Connection Problems
- Verify NEXT_PUBLIC_CONVEX_URL
- Check network connectivity
- Review Convex dashboard logs
## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript conventions
- Write meaningful commit messages
- Update documentation for new features
- Test your changes before submitting
- Maintain code style with ESLint

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
## �📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [OpenAI API](https://platform.openai.com/docs)

---

**Last Updated**: February 14, 2026  
**Status**: Active Development 🚀
