import { User, Article, Comment, Community, ArticleAudience, ArticleReaction } from '../types';

const USERS_KEY = 'new_north_users';
const ARTICLES_KEY = 'new_north_articles';
const COMMUNITIES_KEY = 'new_north_communities';
const FOLLOWING_KEY = 'new_north_following';
const SESSION_KEY = 'new_north_session';
const AUTH_CODE = '123456';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    telegramHandle: 'admin_north',
    fullName: 'Ayaan North',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    bannerUrl: 'https://picsum.photos/1200/400?random=1',
    bio: 'Founder of New-North. Love coding and hiking in Lena Pillars.',
    tags: ['coding', 'startup', 'yakutia'],
    joinedAt: new Date().toISOString()
  },
  {
    id: 'u2',
    telegramHandle: 'lena_dev',
    fullName: 'Lena Petrov',
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    bannerUrl: 'https://picsum.photos/1200/400?random=4',
    bio: 'Фронтенд и горы. Пишу о коде и путешествиях по Якутии.',
    tags: ['frontend', 'travel'],
    joinedAt: new Date().toISOString()
  }
];

const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'c1',
    name: 'Клуб New-North',
    aboutShort: 'Новости платформы, идеи и знакомства без шума.',
    description: 'Официальное сообщество платформы: новости, идеи и знакомства.',
    coverUrl: 'https://picsum.photos/800/200?random=10',
    creatorId: 'u1',
    adminIds: ['u1'],
    memberIds: ['u1'],
    blockedUserIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'c2',
    name: 'Dev Якутия',
    aboutShort: 'Митапы, код и pet-проекты для разработчиков региона.',
    description: 'Разработчики, митапы и pet-проекты.',
    coverUrl: 'https://picsum.photos/800/200?random=11',
    creatorId: 'u1',
    adminIds: ['u1'],
    memberIds: ['u1', 'u2'],
    blockedUserIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'c3',
    name: 'Тихие истории',
    aboutShort: 'Длинные тексты и размышления в спокойном темпе.',
    description: 'Длинные тексты без суеты.',
    coverUrl: 'https://picsum.photos/800/200?random=12',
    creatorId: 'u2',
    adminIds: ['u2'],
    memberIds: ['u2'],
    blockedUserIds: [],
    createdAt: new Date().toISOString()
  }
];

const normalizeCommunity = (raw: Community & { aboutShort?: string }): Community => ({
  ...raw,
  aboutShort: (raw.aboutShort && raw.aboutShort.trim()) || raw.description?.slice(0, 140) || ''
});

const normalizeArticle = (raw: Article): Article => ({
  ...raw,
  audience: raw.audience ?? 'public',
  reactions: raw.reactions ?? []
});

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'a1',
    authorId: 'u1',
    communityId: 'c1',
    audience: 'public',
    title: 'Why I started New-North',
    preview: 'Tired of the noise on mainstream social media, I wanted to build a sanctuary...',
    content: 'Legacy content...',
    blocks: [
        { id: 'b1', type: 'h1', content: 'The Beginning' },
        { id: 'b2', type: 'paragraph', content: 'Twitter is too noisy. Instagram is too fake. We needed a place for **deep thoughts** and real connections.' },
        { id: 'b3', type: 'h2', content: 'The Mission' },
        { id: 'b4', type: 'paragraph', content: 'To inspire the youth of Yakutia. To share knowledge. To meet.' },
        { id: 'b5', type: 'image', content: 'https://picsum.photos/800/400?random=2' },
        { id: 'b6', type: 'paragraph', content: 'This platform is built for you.' }
    ],
    tags: ['intro', 'philosophy'],
    createdAt: new Date().toISOString(),
    views: 120,
    commentsCount: 1,
    comments: [
        {
            id: 'c1',
            authorId: 'u1',
            text: 'Welcome to the platform!',
            createdAt: new Date().toISOString()
        }
    ],
    reactions: [
      { emoji: '❤️', userId: 'u1' },
      { emoji: '👍', userId: 'u2' }
    ]
  },
  {
    id: 'a2',
    authorId: 'u1',
    audience: 'public',
    title: 'Как мы собираем ленту без шума',
    preview: 'Несколько принципов, по которым строится New-North...',
    content: 'Legacy...',
    blocks: [
      { id: 'a2b1', type: 'h1', content: 'Спокойная лента' },
      { id: 'a2b2', type: 'paragraph', content: 'Мы убираем лишнее и оставляем место для смысла.' }
    ],
    tags: ['product'],
    createdAt: new Date().toISOString(),
    views: 45,
    commentsCount: 0,
    comments: []
  },
  {
    id: 'a3',
    authorId: 'u2',
    communityId: 'c2',
    audience: 'public',
    title: 'Первый митап во дворе коворкинга',
    preview: 'Короткий отчёт о том, как прошла встреча Dev Якутия...',
    content: 'Legacy...',
    blocks: [
      { id: 'a3b1', type: 'paragraph', content: 'Собрались обсудить React 19 и обменялись контактами.' }
    ],
    tags: ['meetup'],
    createdAt: new Date().toISOString(),
    views: 28,
    commentsCount: 0,
    comments: []
  }
];

const persistCommunities = (list: Community[]) => {
  localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(list));
};

type FollowingMap = Record<string, string[]>;

const getFollowingMap = (): FollowingMap => {
  const raw = localStorage.getItem(FOLLOWING_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as FollowingMap;
  } catch {
    return {};
  }
};

const persistFollowingMap = (map: FollowingMap) => {
  localStorage.setItem(FOLLOWING_KEY, JSON.stringify(map));
};

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },

  saveUser: (user: User) => {
    const users = db.getUsers();
    // Update if exists, else add
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update session if it's the current user
    const session = db.getSession();
    if (session && session.id === user.id) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  },

  getUserById: (id: string): User | undefined => {
    return db.getUsers().find(u => u.id === id);
  },

  getUserByTelegramHandle: (telegramHandle: string): User | undefined => {
    return db.getUsers().find(u => u.telegramHandle === telegramHandle);
  },

  isAuthCodeValid: (code: string): boolean => {
    return code === AUTH_CODE;
  },

  verifyAuthCode: (telegramHandle: string, code: string): User | undefined => {
    if (code !== AUTH_CODE) {
      return undefined;
    }
    return db.getUserByTelegramHandle(telegramHandle);
  },

  getArticles: (): Article[] => {
    const data = localStorage.getItem(ARTICLES_KEY);
    const raw: Article[] = data ? JSON.parse(data) : INITIAL_ARTICLES;
    return raw.map(normalizeArticle);
  },

  /** Общая лента: без постов «только для участников сообщества» */
  getArticlesForPublicFeed: (): Article[] => {
    return db.getArticles().filter((a) => (a.audience ?? 'public') !== 'community_only');
  },

  canViewArticle: (_article: Article, _viewer: User | null): boolean => {
    return true;
  },

  saveArticle: (article: Article) => {
    let next = normalizeArticle(article);
    if ((next.audience as ArticleAudience | undefined) === 'community_only' && !next.communityId) {
      next = { ...next, audience: 'public' };
    }
    const articles = db.getArticles();
    const idx = articles.findIndex(a => a.id === next.id);
    if (idx >= 0) {
      articles[idx] = next;
    } else {
      articles.unshift(next);
    }
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  },

  deleteArticle: (id: string) => {
    const articles = db.getArticles().filter(a => a.id !== id);
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  },

  getArticleById: (id: string): Article | undefined => {
    const a = db.getArticles().find((x) => x.id === id);
    return a ? normalizeArticle(a) : undefined;
  },

  getCommunities: (): Community[] => {
    const data = localStorage.getItem(COMMUNITIES_KEY);
    const raw: Community[] = data ? JSON.parse(data) : INITIAL_COMMUNITIES;
    return raw.map(normalizeCommunity);
  },

  saveCommunity: (community: Community) => {
    const list = db.getCommunities();
    const idx = list.findIndex((c) => c.id === community.id);
    if (idx >= 0) list[idx] = community;
    else list.unshift(community);
    persistCommunities(list);
  },

  getCommunityById: (id: string): Community | undefined => {
    return db.getCommunities().find((c) => c.id === id);
  },

  createCommunity: (input: { name: string; aboutShort: string; description: string }, creator: User): Community => {
    const community: Community = {
      id: `c${Date.now()}`,
      name: input.name.trim(),
      aboutShort: input.aboutShort.trim(),
      description: input.description.trim(),
      coverUrl: 'https://picsum.photos/800/200?grayscale',
      creatorId: creator.id,
      adminIds: [creator.id],
      memberIds: [creator.id],
      blockedUserIds: [],
      createdAt: new Date().toISOString()
    };
    db.saveCommunity(community);
    return community;
  },

  getCommunitiesForMember: (userId: string): Community[] => {
    return db.getCommunities().filter((c) => c.memberIds.includes(userId));
  },

  joinCommunity: (communityId: string, userId: string): { ok: boolean; error?: string } => {
    const list = db.getCommunities();
    const idx = list.findIndex((c) => c.id === communityId);
    if (idx < 0) return { ok: false, error: 'not_found' };
    const c = { ...list[idx] };
    if (c.blockedUserIds.includes(userId)) return { ok: false, error: 'blocked' };
    if (c.memberIds.includes(userId)) return { ok: true };
    c.memberIds = [...c.memberIds, userId];
    list[idx] = c;
    persistCommunities(list);
    return { ok: true };
  },

  leaveCommunity: (communityId: string, userId: string): { ok: boolean; error?: string } => {
    const list = db.getCommunities();
    const idx = list.findIndex((c) => c.id === communityId);
    if (idx < 0) return { ok: false, error: 'not_found' };
    const c = { ...list[idx] };
    if (c.creatorId === userId) return { ok: false, error: 'creator_cannot_leave' };
    if (!c.memberIds.includes(userId)) return { ok: true };
    c.memberIds = c.memberIds.filter((id) => id !== userId);
    c.adminIds = c.adminIds.filter((id) => id !== userId);
    list[idx] = c;
    persistCommunities(list);
    return { ok: true };
  },

  promoteCommunityAdmin: (communityId: string, actorId: string, targetUserId: string): { ok: boolean; error?: string } => {
    const list = db.getCommunities();
    const idx = list.findIndex((c) => c.id === communityId);
    if (idx < 0) return { ok: false, error: 'not_found' };
    const c = { ...list[idx] };
    if (c.creatorId !== actorId) return { ok: false, error: 'forbidden' };
    if (!c.memberIds.includes(targetUserId)) return { ok: false, error: 'not_member' };
    if (!c.adminIds.includes(targetUserId)) {
      c.adminIds = [...c.adminIds, targetUserId];
    }
    list[idx] = c;
    persistCommunities(list);
    return { ok: true };
  },

  blockUserFromCommunity: (communityId: string, actorId: string, targetUserId: string): { ok: boolean; error?: string } => {
    const list = db.getCommunities();
    const idx = list.findIndex((c) => c.id === communityId);
    if (idx < 0) return { ok: false, error: 'not_found' };
    const c = { ...list[idx] };
    const isMod = c.creatorId === actorId || c.adminIds.includes(actorId);
    if (!isMod) return { ok: false, error: 'forbidden' };
    if (targetUserId === c.creatorId) return { ok: false, error: 'cannot_block_creator' };
    c.memberIds = c.memberIds.filter((id) => id !== targetUserId);
    c.adminIds = c.adminIds.filter((id) => id !== targetUserId);
    if (!c.blockedUserIds.includes(targetUserId)) {
      c.blockedUserIds = [...c.blockedUserIds, targetUserId];
    }
    list[idx] = c;
    persistCommunities(list);
    return { ok: true };
  },

  getArticlesByCommunityId: (communityId: string): Article[] => {
    return db.getArticles().filter((a) => a.communityId === communityId);
  },

  /** Статьи автора для профиля: чужой профиль скрывает «только для своих» */
  getArticlesForProfile: (authorId: string, viewerId: string | undefined): Article[] => {
    return db.getArticles().filter((a) => {
      if (a.authorId !== authorId) return false;
      if (viewerId === authorId) return true;
      return (a.audience ?? 'public') !== 'community_only';
    });
  },

  countArticlesByAuthor: (authorId: string): number => {
    return db.getArticles().filter((a) => a.authorId === authorId).length;
  },

  getAuthorsLeaderboard: (): { user: User; articleCount: number }[] => {
    const users = db.getUsers();
    return users
      .map((user) => ({ user, articleCount: db.countArticlesByAuthor(user.id) }))
      .sort(
        (a, b) =>
          b.articleCount - a.articleCount || a.user.fullName.localeCompare(b.user.fullName, 'ru')
      );
  },

  getCommunitiesByMemberCount: (): Community[] => {
    return [...db.getCommunities()].sort(
      (a, b) => b.memberIds.length - a.memberIds.length || a.name.localeCompare(b.name, 'ru')
    );
  },

  canEditArticle: (userId: string | undefined, article: Article): boolean => {
    if (!userId) return false;
    if (article.authorId === userId) return true;
    if (!article.communityId) return false;
    const c = db.getCommunityById(article.communityId);
    if (!c) return false;
    return c.creatorId === userId || c.adminIds.includes(userId);
  },

  isFollowingUser: (followerId: string, targetUserId: string): boolean => {
    if (followerId === targetUserId) return false;
    const map = getFollowingMap();
    return (map[followerId] || []).includes(targetUserId);
  },

  followUser: (followerId: string, targetUserId: string): void => {
    if (followerId === targetUserId) return;
    const map = { ...getFollowingMap() };
    const set = new Set(map[followerId] || []);
    set.add(targetUserId);
    map[followerId] = [...set];
    persistFollowingMap(map);
  },

  unfollowUser: (followerId: string, targetUserId: string): void => {
    const map = { ...getFollowingMap() };
    map[followerId] = (map[followerId] || []).filter((id) => id !== targetUserId);
    persistFollowingMap(map);
  },

  addComment: (articleId: string, comment: Comment) => {
      const articles = db.getArticles();
      const idx = articles.findIndex(a => a.id === articleId);
      if (idx >= 0) {
          const article = normalizeArticle({ ...articles[idx] });
          if (!article.comments) article.comments = [];
          article.comments.push(comment);
          article.commentsCount = article.comments.length;
          articles[idx] = article;
          localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
          return normalizeArticle(articles[idx]);
      }
      return null;
  },

  toggleArticleReaction: (articleId: string, userId: string, emoji: string): Article | null => {
    const articles = db.getArticles();
    const idx = articles.findIndex((a) => a.id === articleId);
    if (idx < 0) return null;
    const article = normalizeArticle({ ...articles[idx] });
    const reactions: ArticleReaction[] = [...(article.reactions || [])];
    const hit = reactions.findIndex((r) => r.userId === userId && r.emoji === emoji);
    if (hit >= 0) reactions.splice(hit, 1);
    else reactions.push({ emoji, userId });
    const next = { ...article, reactions };
    articles[idx] = next;
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
    return normalizeArticle(next);
  },

  getSession: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  setSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  },
  
  init: () => {
      if(!localStorage.getItem(USERS_KEY)) {
          localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      }
      if(!localStorage.getItem(ARTICLES_KEY)) {
          localStorage.setItem(ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
      }
      if (!localStorage.getItem(COMMUNITIES_KEY)) {
          localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(INITIAL_COMMUNITIES));
      }
      if (!localStorage.getItem(FOLLOWING_KEY)) {
          localStorage.setItem(FOLLOWING_KEY, JSON.stringify({}));
      }
  }
};

db.init(); // Initialize on load
