import {
  Article,
  ArticleReaction,
  Comment,
  Community,
  LeaderboardEntry,
  RegisterInput,
  User,
} from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text);
}

export const api = {
  // Auth
  requestCode: (telegramHandle: string) =>
    request<{ ok: boolean }>('/auth/request-code', {
      method: 'POST',
      body: JSON.stringify({ telegramHandle }),
    }),

  verifyCode: (telegramHandle: string, code: string) =>
    request<{ user: User; token: string }>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ telegramHandle, code }),
    }),

  register: (input: RegisterInput) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getMe: () => request<User>('/auth/me'),
  getSession: () => request<User | null>('/auth/me').catch(() => null),
  clearSession: () => localStorage.removeItem('token'),

  // Users
  getUsers: () => request<User[]>('/users'),
  getUser: (id: string) => request<User>(`/users/${id}`),
  updateProfile: (id: string, data: Partial<User>) =>
    request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  followUser: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: 'POST' }),
  unfollowUser: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: 'DELETE' }),
  getFollowing: (id: string) => request<User[]>(`/users/${id}/following`),
  isFollowing: (id: string) =>
    request<{ following: boolean }>(`/users/${id}/is-following`),

  // Leaderboard
  getLeaderboard: () => request<LeaderboardEntry[]>('/authors/leaderboard'),

  // Articles
  getFeed: () => request<Article[]>('/feed'),

  getArticleById: (id: string) => request<Article>(`/articles/${id}`),

  saveArticle: (article: Article) => {
    const isNew = article.createdAt === undefined || article.id.startsWith('a');
    if (isNew) {
      return request<Article>('/articles', {
        method: 'POST',
        body: JSON.stringify(article),
      });
    }
    return request<Article>(`/articles/${article.id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    });
  },

  deleteArticle: (id: string) =>
    request<void>(`/articles/${id}`, { method: 'DELETE' }),

  addComment: (articleId: string, text: string) =>
    request<Comment>(`/articles/${articleId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  toggleReaction: (articleId: string, emoji: string) =>
    request<ArticleReaction>(`/articles/${articleId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  getCommunities: () => request<Community[]>('/communities'),

  getCommunityById: (id: string) => request<Community>(`/communities/${id}`),

  createCommunity: (data: { name: string; description: string; aboutShort?: string }) =>
    request<Community>('/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCommunityMembers: (id: string) => request<User[]>(`/communities/${id}/members`),

  joinCommunity: (id: string) =>
    request<{ ok: boolean; error?: string }>(`/communities/${id}/join`, {
      method: 'POST',
    }),

  leaveCommunity: (id: string) =>
    request<{ ok: boolean }>(`/communities/${id}/leave`, { method: 'POST' }),

  promoteMember: (communityId: string, userId: string) =>
    request<{ ok: boolean }>(`/communities/${communityId}/promote`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId: userId }),
    }),

  blockUser: (communityId: string, userId: string) =>
    request<{ ok: boolean }>(`/communities/${communityId}/block`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId: userId }),
    }),

  getCommunitiesForMember: (userId: string) =>
    request<Community[]>(`/communities/my`),

  getCommunityArticles: (communityId: string) =>
    request<Article[]>(`/communities/${communityId}/articles`),

  getUserArticles: (userId: string) =>
    request<Article[]>(`/users/${userId}/articles`),
};
