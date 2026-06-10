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

/** Реакция эмодзи к статье (как в iMessage) */
export interface ArticleReaction {
	emoji: string;
	userId: string;
}

export type BlockType = "paragraph" | "h1" | "h2" | "image";

export interface ArticleBlock {
	id: string;
	type: BlockType;
	content: string; // text content or image URL
}

/** public — в общей ленте и у сообщества; community_only — только лента сообщества («только для своих») */
export type ArticleAudience = "public" | "community_only";

export interface Article {
	id: string;
	authorId: string;
	/** Пост в ленте сообщества; если не задано — только в общей ленте */
	communityId?: string;
	/** По умолчанию public */
	audience?: ArticleAudience;
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
	reactions?: ArticleReaction[];
}

/** Сообщество (аналог группы): создатель, админы, участники, блокировки */
export interface Community {
	id: string;
	name: string;
	/** Полное описание на странице клуба */
	description: string;
	/** Кратко о клубе — для карточки и списков (пишет админ при создании/редактировании) */
	aboutShort: string;
	coverUrl: string;
	creatorId: string;
	adminIds: string[];
	memberIds: string[];
	blockedUserIds: string[];
	createdAt: string;
}

export enum ViewState {
	LANDING = "LANDING",
	LOGIN = "LOGIN",
	REGISTER = "REGISTER",
	FEED = "FEED",
	PROFILE = "PROFILE",
	ARTICLE = "ARTICLE",
	EDITOR = "EDITOR",
	PEOPLE = "PEOPLE",
}

export interface AuthState {
	isAuthenticated: boolean;
	currentUser: User | null;
}
