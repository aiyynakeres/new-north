export interface User {
  id: string;
  telegramHandle: string;
  fullName: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  tags: string[];
  joinedAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'image';

export interface ArticleBlock {
  id: string;
  type: BlockType;
  content: string; // text content or image URL
}

export interface Article {
  id: string;
  authorId: string;
  title: string;
  preview: string;
  content: string; // Deprecated: mainly used for preview generation or legacy articles
  blocks?: ArticleBlock[]; // The new structured content
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  views: number;
  commentsCount: number; // Keep for list views
  comments?: Comment[]; // The actual comments
}

export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FEED = 'FEED',
  PROFILE = 'PROFILE',
  ARTICLE = 'ARTICLE',
  EDITOR = 'EDITOR',
  PEOPLE = 'PEOPLE'
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}
