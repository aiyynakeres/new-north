import type { Article, Community, LeaderboardEntry, RegisterInput, User } from "../types";
import { mockApi } from "./mockApi";

const BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

async function request<T>(url: string, options?: RequestInit): Promise<T> {
	const token = localStorage.getItem("token");
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options?.headers as Record<string, string>),
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const res = await fetch(`${BASE}${url}`, { ...options, headers });
	const text = await res.text();
	if (!res.ok) throw new Error(text || res.statusText);
	if (!text) return undefined as unknown as T;
	return JSON.parse(text);
}

const httpApi = {
	// Auth
	requestCode: (telegramHandle: string) =>
		request<{ ok: boolean }>("/auth/request-code", {
			method: "POST",
			body: JSON.stringify({ telegramHandle }),
		}),

	verifyCode: (telegramHandle: string, code: string) =>
		request<{ user: User; token: string }>("/auth/verify-code", {
			method: "POST",
			body: JSON.stringify({ telegramHandle, code }),
		}),

	register: (input: RegisterInput) =>
		request<{ user: User; token: string }>("/auth/register", {
			method: "POST",
			body: JSON.stringify(input),
		}),

	getMe: () => request<User>("/auth/me"),
	getSession: () => request<User | null>("/auth/me").catch(() => null),
	clearSession: () => localStorage.removeItem("token"),

	// Users
	getUsers: () => request<User[]>("/users"),
	getUser: (id: string) => request<User>(`/users/${id}`),
	updateProfile: (id: string, data: Partial<User>) =>
		request<User>(`/users/${id}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		}),

	followUser: (id: string, maybeTargetId?: string) =>
		request<void>(`/users/${maybeTargetId ?? id}/follow`, { method: "POST" }),
	unfollowUser: (id: string, maybeTargetId?: string) =>
		request<void>(`/users/${maybeTargetId ?? id}/follow`, { method: "DELETE" }),
	getFollowing: (id: string) => request<User[]>(`/users/${id}/following`),
	isFollowing: (id: string) => request<{ following: boolean }>(`/users/${id}/is-following`),

	// Leaderboard
	getLeaderboard: () => request<LeaderboardEntry[]>("/authors/leaderboard"),

	// Articles
	getFeed: () => request<Article[]>("/feed"),

	getArticleById: (id: string) => request<Article>(`/articles/${id}`),

	saveArticle: (article: Article) => {
		const isNew = article.updatedAt === undefined;
		if (isNew) {
			return request<Article>("/articles", {
				method: "POST",
				body: JSON.stringify(article),
			});
		}
		return request<Article>(`/articles/${article.id}`, {
			method: "PUT",
			body: JSON.stringify(article),
		});
	},

	deleteArticle: (id: string) => request<void>(`/articles/${id}`, { method: "DELETE" }),

	addComment: (articleId: string, text: string) =>
		request<Article>(`/articles/${articleId}/comments`, {
			method: "POST",
			body: JSON.stringify({ text }),
		}),

	toggleReaction: (articleId: string, emoji: string) =>
		request<Article>(`/articles/${articleId}/reactions`, {
			method: "POST",
			body: JSON.stringify({ emoji }),
		}),

	getCommunities: () => request<Community[]>("/communities"),

	getCommunityById: (id: string) => request<Community>(`/communities/${id}`),

	createCommunity: (
		data: { name: string; description: string; aboutShort?: string },
		_creator?: User,
	) =>
		request<Community>("/communities", {
			method: "POST",
			body: JSON.stringify(data),
		}),

	getCommunityMembers: (id: string) => request<User[]>(`/communities/${id}/members`),

	joinCommunity: (id: string, _userId?: string) =>
		request<{ ok: boolean; error?: string }>(`/communities/${id}/join`, {
			method: "POST",
		}),

	leaveCommunity: (id: string, _userId?: string) =>
		request<{ ok: boolean; error?: string }>(`/communities/${id}/leave`, { method: "POST" }),

	promoteMember: (communityId: string, userId: string) =>
		request<{ ok: boolean }>(`/communities/${communityId}/promote`, {
			method: "POST",
			body: JSON.stringify({ targetUserId: userId }),
		}),

	blockUser: (communityId: string, userId: string) =>
		request<{ ok: boolean; error?: string }>(`/communities/${communityId}/block`, {
			method: "POST",
			body: JSON.stringify({ targetUserId: userId }),
		}),

	getCommunitiesForMember: (_userId: string) => request<Community[]>(`/communities/my`),

	getCommunityArticles: (communityId: string) =>
		request<Article[]>(`/communities/${communityId}/articles`),

	getUserArticles: (userId: string) => request<Article[]>(`/users/${userId}/articles`),

	// Aliases (legacy callers)
	getAuthorsLeaderboard: () => httpApi.getLeaderboard(),
	getCommunitiesByMemberCount: () => httpApi.getCommunities(),
	getUserById: (id: string) => httpApi.getUser(id),
	getArticlesForProfile: (userId: string, _viewerId?: string) => httpApi.getUserArticles(userId),
	isFollowingUser: async (_currentUserId: string, targetId: string) =>
		(await httpApi.isFollowing(targetId)).following,
	saveUser: (data: Partial<User>) => {
		if (!data.id) throw new Error("User ID is required");
		return httpApi.updateProfile(data.id, data);
	},
	verifyAuthCode: async (telegramHandle: string, code: string) => {
		const res = await httpApi.verifyCode(telegramHandle, code);
		if (res) localStorage.setItem("token", res.token);
		return res?.user ?? null;
	},
	getArticlesByCommunityId: (communityId: string) => httpApi.getCommunityArticles(communityId),
	promoteCommunityAdmin: (communityId: string, _currentUserId: string, targetId: string) =>
		httpApi.promoteMember(communityId, targetId),
	blockUserFromCommunity: (communityId: string, _currentUserId: string, targetId: string) =>
		httpApi.blockUser(communityId, targetId),
	getArticles: () => httpApi.getFeed(),
	toggleArticleReaction: (articleId: string, _currentUserId: string, emoji: string) =>
		httpApi.toggleReaction(articleId, emoji),
};

export const isMockMode =
	import.meta.env.VITE_USE_MOCKS === "true" ||
	(import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== "false");

const READ_METHODS = new Set([
	"getMe",
	"getSession",
	"getUser",
	"getUsers",
	"getFollowing",
	"isFollowing",
	"getLeaderboard",
	"getFeed",
	"getArticleById",
	"getCommunities",
	"getCommunityById",
	"getCommunityMembers",
	"getCommunitiesForMember",
	"getCommunityArticles",
	"getUserArticles",
	"getAuthorsLeaderboard",
	"getCommunitiesByMemberCount",
	"getUserById",
	"getArticlesForProfile",
	"isFollowingUser",
	"getArticlesByCommunityId",
	"getArticles",
]);

const inFlightReads = new Map<string, Promise<unknown>>();

/**
 * Shares concurrent calls to read-only methods. React StrictMode invokes
 * effects twice in development, which otherwise fires duplicate requests.
 */
function dedupeReadMethods<T extends object>(target: T): T {
	return new Proxy(target, {
		get(obj, prop, receiver) {
			const value = Reflect.get(obj, prop, receiver);
			if (typeof prop !== "string" || typeof value !== "function" || !READ_METHODS.has(prop)) {
				return value;
			}
			return (...args: unknown[]) => {
				const key = `${prop}:${JSON.stringify(args)}`;
				const pending = inFlightReads.get(key);
				if (pending) return pending;
				const request = Promise.resolve(value.apply(obj, args)).finally(() => {
					if (inFlightReads.get(key) === request) inFlightReads.delete(key);
				});
				inFlightReads.set(key, request);
				return request;
			};
		},
	});
}

export const api = dedupeReadMethods(isMockMode ? mockApi : httpApi) as typeof httpApi;
