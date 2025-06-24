// Re-export all models for easy importing
export { UserModel, type IUser } from './User';
export { ContentModel, type IContent } from './Content';
export { LinkModel, type ILink } from './Link';
export { TagModel, type ITag } from './Tag';

// Re-export database connection
export { connectDB } from '../config/database';
