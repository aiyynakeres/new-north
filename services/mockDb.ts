import { User, Article, Comment } from '../types';

const USERS_KEY = 'new_north_users';
const ARTICLES_KEY = 'new_north_articles';
const SESSION_KEY = 'new_north_session';
const AUTH_CODE = '123456';
const DEMO_USER: User = {
  id: 'u-demo',
  email: 'demo@new-north.ru',
  password: 'north2026',
  telegramHandle: 'demo_north',
  nickname: 'demo-member',
  fullName: 'Тестовый участник',
  avatarUrl: 'https://picsum.photos/200/200?random=12',
  bannerUrl: 'https://picsum.photos/1200/400?random=12',
  country: 'Россия',
  city: 'Якутск',
  shortBio: 'Тестовый профиль для знакомства с возможностями клуба New-North.',
  role: 'Участник сообщества',
  company: 'New-North',
  communityOffers: ['coffee', 'startup'],
  bio: 'Это демонстрационный профиль участника клуба. Используйте его, чтобы посмотреть ленту, профили, статьи и остальные возможности New-North без прохождения регистрации.',
  tags: ['сообщество', 'стартапы', 'знакомства'],
  joinedAt: new Date().toISOString(),
};

// Initial Mock Data
const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    email: 'admin@new-north.ru',
    password: 'password123',
    telegramHandle: 'admin_north',
    fullName: 'Ayaan North',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    bannerUrl: 'https://picsum.photos/1200/400?random=1',
    bio: 'Founder of New-North. Love coding and hiking in Lena Pillars.',
    tags: ['coding', 'startup', 'yakutia'],
    joinedAt: new Date().toISOString()
  }
];

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'a1',
    authorId: 'u1',
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
    ]
  }
];

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

  getUserByEmail: (email: string): User | undefined => {
    return db.getUsers().find(u => u.email?.toLowerCase() === email.toLowerCase());
  },

  verifyEmailPassword: (email: string, password: string): User | undefined => {
    const user = db.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
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
    return data ? JSON.parse(data) : INITIAL_ARTICLES;
  },

  saveArticle: (article: Article) => {
    const articles = db.getArticles();
    const idx = articles.findIndex(a => a.id === article.id);
    if (idx >= 0) {
      articles[idx] = article;
    } else {
      articles.unshift(article); // Add to top
    }
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  },

  deleteArticle: (id: string) => {
    const articles = db.getArticles().filter(a => a.id !== id);
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  },

  getArticleById: (id: string): Article | undefined => {
    return db.getArticles().find(a => a.id === id);
  },

  addComment: (articleId: string, comment: Comment) => {
      const articles = db.getArticles();
      const idx = articles.findIndex(a => a.id === articleId);
      if (idx >= 0) {
          const article = articles[idx];
          if (!article.comments) article.comments = [];
          article.comments.push(comment);
          article.commentsCount = article.comments.length;
          articles[idx] = article;
          localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
          return article;
      }
      return null;
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
      const storedUsers = localStorage.getItem(USERS_KEY);
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
      if (!users.some((user) => user.email?.toLowerCase() === DEMO_USER.email.toLowerCase())) {
          users.push(DEMO_USER);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      if(!localStorage.getItem(ARTICLES_KEY)) {
          localStorage.setItem(ARTICLES_KEY, JSON.stringify(INITIAL_ARTICLES));
      }
  }
};

db.init(); // Initialize on load
