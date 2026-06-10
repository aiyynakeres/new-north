import type { Article, ArticleReaction, Comment, Community, User } from '../types';

const BASE_URL = '';

function token(): string | null {
  return localStorage.getItem('nn_token');
}

function setToken(t: string) {
  localStorage.setItem('nn_token', t);
}

function clearToken() {
  localStorage.removeItem('nn_token');
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const t = token();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // --- Auth ---
  async requestAuthCode(telegramHandle: string) {
    await req('/api/auth/request-code', { method: 'POST', body: JSON.stringify({ telegramHandle }) });
  },

  async verifyAuthCode(telegramHandle: string, code: string): Promise<User | undefined> {
    try {
      const res = await req<{ user: User; token: string }>('/api/auth/verify-code', {
        method: 'POST', body: JSON.stringify({ telegramHandle, code }),
      });
      setToken(res.token);
      return res.user;
    } catch {
      return undefined;
    }
  },

  async register(telegramHandle: string, fullName: string, bio: string, tags: string[]): Promise<{ user: User; token: string }> {
    const res = await req<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST', body: JSON.stringify({ telegramHandle, fullName, bio, tags }),
    });
    setToken(res.token);
    return res;
  },

  async getSession(): Promise<User | null> {
    const t = token();
    if (!t) return null;
    try {
      return await req<User>('/api/auth/me');
    } catch {
      clearToken();
      return null;
    }
  },

  setSession(_user: User) {
    // Token already stored by verifyAuthCode/register; this is a no-op for API mode.
  },

  clearSession() {
    clearToken();
  },

  isAuthCodeValid(_code: string): boolean {
    return true; // server validates
  },

  // --- Users ---
  async getUserByTelegramHandle(handle: string): Promise<User | undefined> {
    const users = await req<User[]>('/api/users');
    return users.find(u => u.telegramHandle === handle);
  },

  async getUserById(id: string): Promise<User | undefined> {
    try {
      return await req<User>(`/api/users/${id}`);
    } catch {
      return undefined;
    }
  },

  async saveUser(user: User) {
    await req(`/api/users/${user.id}`, { method: 'PATCH', body: JSON.stringify(user) });
  },

  async getUsers(): Promise<User[]> {
    return req<User[]>('/api/users');
  },

  // --- Articles ---
  async getArticles(): Promise<Article[]> {
    return req<Article[]>('/api/feed');
  },

  async getArticleById(id: string): Promise<Article | undefined> {
    try {
      return await req<Article>(`/api/articles/${id}`);
    } catch {
      return undefined;
    }
  },

  async saveArticle(article: Article) {
    if (article.id && article.id.startsWith('a')) {
      // check if it exists
      try {
        await req(`/api/articles/${article.id}`, { method: 'PUT', body: JSON.stringify(article) });
        return;
      } catch { /* fall through to create */ }
    }
    await req('/api/articles', { method: 'POST', body: JSON.stringify(article) });
  },

  async deleteArticle(id: string) {
    await req(`/api/articles/${id}`, { method: 'DELETE' });
  },

  async getArticlesForProfile(authorId: string, _viewerId: string | undefined): Promise<Article[]> {
    const qs = _viewerId ? `?viewer=${_viewerId}` : '';
    return req<Article[]>(`/api/users/${authorId}/articles${qs}`);
  },

  async getArticlesByCommunityId(communityId: string): Promise<Article[]> {
    return req<Article[]>(`/api/communities/${communityId}/articles`);
  },

  canViewArticle(_article: Article, _viewer: User | null): boolean {
    return true;
  },

  canEditArticle(_userId: string | undefined, _article: Article): boolean {
    return true; // server enforces this
  },

  // --- Comments ---
  async addComment(articleId: string, comment: Comment): Promise<Article | null> {
    try {
      return await req<Article>(`/api/articles/${articleId}/comments`, {
        method: 'POST', body: JSON.stringify({ text: comment.text }),
      });
    } catch {
      return null;
    }
  },

  // --- Reactions ---
  async toggleArticleReaction(articleId: string, userId: string, emoji: string): Promise<Article | null> {
    try {
      return await req<Article>(`/api/articles/${articleId}/reactions`, {
        method: 'POST', body: JSON.stringify({ emoji }),
      });
    } catch {
      return null;
    }
  },

  // --- Communities ---
  async getCommunities(): Promise<Community[]> {
    return req<Community[]>('/api/communities');
  },

  async getCommunityById(id: string): Promise<Community | undefined> {
    try {
      return await req<Community>(`/api/communities/${id}`);
    } catch {
      return undefined;
    }
  },

  async getCommunitiesByMemberCount(): Promise<Community[]> {
    return req<Community[]>('/api/communities');
  },

  async getCommunitiesForMember(userId: string): Promise<Community[]> {
    return req<Community[]>(`/api/communities/my`);
  },

  async createCommunity(input: { name: string; aboutShort: string; description: string }, _creator: User): Promise<Community> {
    return req<Community>('/api/communities', {
      method: 'POST', body: JSON.stringify(input),
    });
  },

  async joinCommunity(communityId: string, _userId: string): Promise<{ ok: boolean; error?: string }> {
    try {
      return await req<{ ok: boolean; error?: string }>(`/api/communities/${communityId}/join`, { method: 'POST' });
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },

  async leaveCommunity(communityId: string, _userId: string): Promise<{ ok: boolean; error?: string }> {
    try {
      return await req<{ ok: boolean; error?: string }>(`/api/communities/${communityId}/leave`, { method: 'POST' });
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },

  async promoteCommunityAdmin(communityId: string, _actorId: string, targetUserId: string): Promise<{ ok: boolean; error?: string }> {
    try {
      return await req<{ ok: boolean; error?: string }>(`/api/communities/${communityId}/promote`, {
        method: 'POST', body: JSON.stringify({ userId: targetUserId }),
      });
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },

  async blockUserFromCommunity(communityId: string, _actorId: string, targetUserId: string): Promise<{ ok: boolean; error?: string }> {
    try {
      return await req<{ ok: boolean; error?: string }>(`/api/communities/${communityId}/block`, {
        method: 'POST', body: JSON.stringify({ userId: targetUserId }),
      });
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },

  // --- Following ---
  async isFollowingUser(followerId: string, targetUserId: string): Promise<boolean> {
    try {
      const res = await req<{ following: boolean }>(`/api/users/${targetUserId}/is-following`);
      return res.following;
    } catch {
      return false;
    }
  },

  async followUser(followerId: string, targetUserId: string) {
    await req(`/api/users/${targetUserId}/follow`, { method: 'POST' });
  },

  async unfollowUser(followerId: string, targetUserId: string) {
    await req(`/api/users/${targetUserId}/follow`, { method: 'DELETE' });
  },

  // --- Leaderboard ---
  async getAuthorsLeaderboard(): Promise<{ user: User; articleCount: number }[]> {
    return req('/api/authors/leaderboard');
  },
};
