import type { Article, Community, LeaderboardEntry, RegisterInput, User } from "../types";

const STORAGE_PREFIX = "new-north:mock:v3:";
const SESSION_KEY = `${STORAGE_PREFIX}session`;

const seedUsers: User[] = [
	{
		id: "u1",
		telegramHandle: "admin_north",
		fullName: "Ayaan North",
		avatarUrl: "/mocks/avatar-ayaan.jpg",
		bannerUrl: "/mocks/cover-ayaan.jpg",
		country: "Россия",
		city: "Якутск",
		bio: "Основатель New-North. Люблю создавать продукты, писать код и ходить в походы по Якутии.",
		occupation: "Основатель продукта",
		company: "New-North",
		clubOffers: ["Открыт к общению", "Готов помочь советом", "Готов выпить кофе"],
		tags: ["продукты", "стартапы", "Якутия"],
		joinedAt: "2025-01-01T00:00:00Z",
	},
	{
		id: "u2",
		telegramHandle: "lena_dev",
		fullName: "Лена Петрова",
		avatarUrl: "/mocks/avatar-lena.jpg",
		bannerUrl: "/mocks/cover-lena.jpg",
		country: "Россия",
		city: "Якутск",
		bio: "Фронтенд и горы. Пишу о коде и путешествиях по Якутии.",
		occupation: "Frontend-разработчик",
		company: "Северная студия",
		clubOffers: ["Открыт к общению", "Хочу дружить", "Могу показать офис"],
		tags: ["frontend", "путешествия"],
		joinedAt: "2025-01-02T00:00:00Z",
	},
	{
		id: "u3",
		telegramHandle: "sardaana_design",
		fullName: "Сардана Алексеева",
		avatarUrl: "/mocks/avatar-sardaana.jpg",
		bannerUrl: "/mocks/cover-sardaana.jpg",
		country: "Россия",
		city: "Москва",
		bio: "Продуктовый дизайнер. Исследую локальные сообщества и понятные цифровые сервисы.",
		occupation: "Продуктовый дизайнер",
		company: "Freelance",
		clubOffers: ["Готов помочь советом", "Готов выпить кофе"],
		tags: ["дизайн", "исследования", "менторство"],
		joinedAt: "2025-01-06T00:00:00Z",
	},
];

const seedCommunities: Community[] = [
	{
		id: "c1",
		name: "Клуб New-North",
		aboutShort: "Новости платформы, идеи и знакомства без шума.",
		description: "Официальное сообщество платформы: новости, идеи и знакомства.",
		coverUrl: "/mocks/community-new-north.jpg",
		creatorId: "u1",
		adminIds: ["u1"],
		memberIds: ["u1", "u2", "u3"],
		blockedUserIds: [],
		createdAt: "2025-01-01T00:00:00Z",
	},
	{
		id: "c2",
		name: "Dev Якутия",
		aboutShort: "Митапы, код и pet-проекты для разработчиков региона.",
		description: "Разработчики, митапы и pet-проекты.",
		coverUrl: "/mocks/community-dev.jpg",
		creatorId: "u1",
		adminIds: ["u1"],
		memberIds: ["u1", "u2"],
		blockedUserIds: [],
		createdAt: "2025-01-01T00:00:00Z",
	},
	{
		id: "c3",
		name: "Тихие истории",
		aboutShort: "Длинные тексты и размышления в спокойном темпе.",
		description: "Длинные тексты без суеты.",
		coverUrl: "/mocks/community-stories.jpg",
		creatorId: "u2",
		adminIds: ["u2"],
		memberIds: ["u2", "u3"],
		blockedUserIds: [],
		createdAt: "2025-01-02T00:00:00Z",
	},
];

const seedArticles: Article[] = [
	{
		id: "a1",
		authorId: "u1",
		communityId: "c1",
		audience: "public",
		title: "Почему я начал New-North",
		preview: "Хотелось создать спокойное место для глубоких мыслей и настоящих знакомств...",
		content: "Legacy content",
		blocks: [
			{ id: "b1", type: "h1", content: "Начало" },
			{
				id: "b2",
				type: "paragraph",
				content: "Нам нужно место для глубоких мыслей, полезного опыта и настоящих связей.",
			},
			{ id: "b3", type: "h2", content: "Миссия" },
			{
				id: "b4",
				type: "paragraph",
				content: "Вдохновлять молодых людей Якутии, делиться знаниями и находить своих.",
			},
		],
		tags: ["знакомство", "сообщество"],
		createdAt: "2025-01-03T00:00:00Z",
		views: 120,
		commentsCount: 1,
		comments: [
			{
				id: "comment-1",
				authorId: "u2",
				text: "Рада быть частью этого сообщества!",
				createdAt: "2025-01-03T00:00:01Z",
			},
		],
		reactions: [
			{ emoji: "❤️", userId: "u2" },
			{ emoji: "👍", userId: "u3" },
		],
	},
	{
		id: "a2",
		authorId: "u1",
		audience: "public",
		title: "Как мы собираем ленту без шума",
		preview: "Несколько принципов, по которым строится New-North...",
		content: "Legacy content",
		blocks: [
			{ id: "a2b1", type: "h1", content: "Спокойная лента" },
			{ id: "a2b2", type: "paragraph", content: "Убираем лишнее и оставляем место для смысла." },
		],
		tags: ["продукт"],
		createdAt: "2025-01-04T00:00:00Z",
		views: 45,
		commentsCount: 0,
		comments: [],
		reactions: [],
	},
	{
		id: "a3",
		authorId: "u2",
		communityId: "c2",
		audience: "public",
		title: "Первый митап во дворе коворкинга",
		preview: "Короткий отчёт о встрече Dev Якутия...",
		content: "Legacy content",
		blocks: [
			{
				id: "a3b1",
				type: "paragraph",
				content: "Собрались обсудить React и обменялись контактами.",
			},
		],
		tags: ["митап", "разработка"],
		createdAt: "2025-01-05T00:00:00Z",
		views: 28,
		commentsCount: 0,
		comments: [],
		reactions: [{ emoji: "🔥", userId: "u1" }],
	},
	{
		id: "a4",
		authorId: "u1",
		audience: "public",
		title: "Пять мест в Якутске, где хорошо работается",
		preview: "Кофейни, библиотеки и коворкинги, проверенные на себе.",
		content: "Legacy content",
		blocks: [
			{ id: "a4b1", type: "h1", content: "Где работать" },
			{
				id: "a4b2",
				type: "paragraph",
				content: "Делюсь местами, где есть розетки, тишина и хороший кофе.",
			},
		],
		tags: ["якутск", "работа"],
		createdAt: "2025-01-06T00:00:00Z",
		views: 64,
		commentsCount: 0,
	},
	{
		id: "a5",
		authorId: "u2",
		audience: "public",
		title: "Как я перешла на TypeScript и не пожалела",
		preview: "Небольшая история о миграции проекта без остановки разработки.",
		content: "Legacy content",
		blocks: [
			{
				id: "a5b1",
				type: "paragraph",
				content: "Начала с strict mode на новых файлах и постепенно расширяла границы.",
			},
		],
		tags: ["frontend", "typescript"],
		createdAt: "2025-01-07T00:00:00Z",
		views: 91,
		commentsCount: 0,
	},
	{
		id: "a6",
		authorId: "u1",
		communityId: "c1",
		audience: "public",
		title: "Итоги первого месяца New-North",
		preview: "Что получилось, что нет и куда двигаемся дальше.",
		content: "Legacy content",
		blocks: [
			{ id: "a6b1", type: "h1", content: "Первый месяц" },
			{
				id: "a6b2",
				type: "paragraph",
				content: "Спасибо всем, кто присоединился и помог сделать платформу теплее.",
			},
		],
		tags: ["продукт", "сообщество"],
		createdAt: "2025-01-08T00:00:00Z",
		views: 137,
		commentsCount: 0,
	},
	{
		id: "a7",
		authorId: "u2",
		communityId: "c3",
		audience: "public",
		title: "Тихий вечер в Ленских столбах",
		preview: "Небольшая заметка о поездке без спешки.",
		content: "Legacy content",
		blocks: [
			{
				id: "a7b1",
				type: "paragraph",
				content: "Иногда лучшее, что можно сделать, — выключить телефон и посмотреть на реку.",
			},
		],
		tags: ["путешествия", "якутия"],
		createdAt: "2025-01-09T00:00:00Z",
		views: 72,
		commentsCount: 0,
	},
	{
		id: "a8",
		authorId: "u1",
		communityId: "c2",
		audience: "public",
		title: "React 19: что реально изменилось",
		preview: "Короткий разбор изменений, которые заметит обычный разработчик.",
		content: "Legacy content",
		blocks: [
			{ id: "a8b1", type: "h2", content: "Формы и действия" },
			{
				id: "a8b2",
				type: "paragraph",
				content: "Экшены и useActionState заметно упрощают обработку форм.",
			},
		],
		tags: ["react", "frontend"],
		createdAt: "2025-01-10T00:00:00Z",
		views: 158,
		commentsCount: 0,
	},
	{
		id: "a9",
		authorId: "u2",
		audience: "public",
		title: "Мой список книг на зиму",
		preview: "Пять книг, которые хочу прочитать до весны.",
		content: "Legacy content",
		blocks: [
			{
				id: "a9b1",
				type: "paragraph",
				content: "В списке есть и техническая литература, и художественная проза.",
			},
		],
		tags: ["книги", "зима"],
		createdAt: "2025-01-11T00:00:00Z",
		views: 43,
		commentsCount: 0,
	},
	{
		id: "a10",
		authorId: "u1",
		communityId: "c1",
		audience: "public",
		title: "Как мы модерируем сообщество",
		preview: "Несколько правил, которые помогают сохранять спокойную атмосферу.",
		content: "Legacy content",
		blocks: [
			{
				id: "a10b1",
				type: "paragraph",
				content: "Главный принцип — уважение к человеку, а не к должности или статусу.",
			},
		],
		tags: ["сообщество", "модерация"],
		createdAt: "2025-01-12T00:00:00Z",
		views: 88,
		commentsCount: 0,
	},
	{
		id: "a11",
		authorId: "u2",
		communityId: "c3",
		audience: "public",
		title: "Зачем писать длинные тексты",
		preview: "Мысли о медленном чтении и внимании к деталям.",
		content: "Legacy content",
		blocks: [
			{
				id: "a11b1",
				type: "paragraph",
				content: "Короткие посты отвечают на вопрос «что», длинные — на вопрос «почему».",
			},
		],
		tags: ["тексты", "медленное чтение"],
		createdAt: "2025-01-13T00:00:00Z",
		views: 56,
		commentsCount: 0,
	},
	{
		id: "a12",
		authorId: "u1",
		communityId: "c2",
		audience: "public",
		title: "Деплой без боли: Docker Compose",
		preview: "Как собрать фронтенд, бэкенд и базу одной командой.",
		content: "Legacy content",
		blocks: [
			{
				id: "a12b1",
				type: "paragraph",
				content: "Compose удобен для небольших проектов, пока не нужна сложная оркестрация.",
			},
		],
		tags: ["docker", "devops"],
		createdAt: "2025-01-14T00:00:00Z",
		views: 112,
		commentsCount: 0,
	},
	{
		id: "a13",
		authorId: "u2",
		communityId: "c1",
		audience: "public",
		title: "Что я поняла после десяти митапов",
		preview: "Наблюдения о людях, подготовке и случайных знакомствах.",
		content: "Legacy content",
		blocks: [
			{
				id: "a13b1",
				type: "paragraph",
				content: "Лучшие разговоры часто начинаются после официальной части.",
			},
		],
		tags: ["митапы", "сообщество"],
		createdAt: "2025-01-15T00:00:00Z",
		views: 76,
		commentsCount: 0,
	},
	{
		id: "a14",
		authorId: "u1",
		communityId: "c1",
		audience: "community_only",
		title: "Черновик плана развития клуба",
		preview: "Внутренний документ для участников клуба New-North.",
		content: "Legacy content",
		blocks: [
			{
				id: "a14b1",
				type: "paragraph",
				content: "Обсудим идеи на следующей встрече, черновик пока сырой.",
			},
		],
		tags: ["клуб", "планы"],
		createdAt: "2025-01-16T00:00:00Z",
		views: 12,
		commentsCount: 0,
	},
	{
		id: "a15",
		authorId: "u2",
		communityId: "c2",
		audience: "community_only",
		title: "Внутренний созвон Dev Якутии",
		preview: "Заметки для участников сообщества после встречи.",
		content: "Legacy content",
		blocks: [
			{
				id: "a15b1",
				type: "paragraph",
				content: "Собрали список тем на следующий митап — подробности внутри.",
			},
		],
		tags: ["dev", "встречи"],
		createdAt: "2025-01-17T00:00:00Z",
		views: 9,
		commentsCount: 0,
	},
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function read<T>(key: string, seed: T): T {
	const storageKey = `${STORAGE_PREFIX}${key}`;
	const stored = localStorage.getItem(storageKey);
	if (stored) return JSON.parse(stored) as T;
	const initial = clone(seed);
	localStorage.setItem(storageKey, JSON.stringify(initial));
	return initial;
}

function write<T>(key: string, value: T): T {
	localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
	return clone(value);
}

const users = () => read<User[]>("users", seedUsers);
const articles = () => read<Article[]>("articles", seedArticles);
const communities = () => read<Community[]>("communities", seedCommunities);
const following = () =>
	read<Record<string, string[]>>("following", { u1: ["u2", "u3"], u2: ["u1"] });
const normalizeHandle = (handle: string) => handle.trim().replace(/^@/, "").toLowerCase();
const byNewest = (a: Article, b: Article) =>
	Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id);

function getSessionUser(): User | null {
	const userId = localStorage.getItem(SESSION_KEY);
	return userId ? (users().find((user) => user.id === userId) ?? null) : null;
}

function requireSession(): User {
	const user = getSessionUser();
	if (!user) throw new Error("Войдите в аккаунт");
	return user;
}

function setSession(user: User) {
	localStorage.setItem(SESSION_KEY, user.id);
	localStorage.setItem("token", `mock-token-${user.id}`);
}

function findArticle(id: string): Article {
	const article = articles().find((item) => item.id === id);
	if (!article) throw new Error("Статья не найдена");
	return article;
}

function canViewArticle(article: Article, userId: string | null): boolean {
	if (article.audience !== "community_only") return true;
	if (userId && article.authorId === userId) return true;
	if (!article.communityId || !userId) return false;
	const community = communities().find((item) => item.id === article.communityId);
	if (!community) return false;
	return (
		community.creatorId === userId ||
		community.adminIds.includes(userId) ||
		community.memberIds.includes(userId)
	);
}

function paginate<T>(items: T[], limit: number, offset: number): { items: T[]; hasMore: boolean } {
	return {
		items: clone(items.slice(offset, offset + limit)),
		hasMore: offset + limit < items.length,
	};
}

export const mockApi = {
	requestCode: async (_telegramHandle: string) => ({ ok: true }),

	verifyCode: async (telegramHandle: string, code: string) => {
		if (code !== "123456") throw new Error("Неверный тестовый код");
		const user = users().find(
			(item) => normalizeHandle(item.telegramHandle) === normalizeHandle(telegramHandle),
		);
		if (!user) throw new Error("Пользователь не найден. Используйте admin_north или lena_dev");
		setSession(user);
		return { user: clone(user), token: `mock-token-${user.id}` };
	},

	register: async (input: RegisterInput) => {
		const allUsers = users();
		if (
			allUsers.some(
				(user) => normalizeHandle(user.telegramHandle) === normalizeHandle(input.telegramHandle),
			)
		) {
			throw new Error("Такой Telegram уже зарегистрирован");
		}
		if (allUsers.some((user) => user.nickname?.toLowerCase() === input.nickname.toLowerCase())) {
			throw new Error("Такой никнейм уже занят");
		}
		const user: User = {
			id: `u-${Date.now()}`,
			telegramHandle: normalizeHandle(input.telegramHandle),
			nickname: input.nickname,
			fullName: input.fullName,
			avatarUrl: input.avatarUrl || "/mocks/avatar-placeholder.jpg",
			bannerUrl: "/mocks/cover-placeholder.jpg",
			country: input.country,
			city: input.city,
			bio: input.bio,
			occupation: input.occupation,
			company: input.company,
			aboutClub: input.aboutClub,
			clubOffers: input.clubOffers,
			tags: input.tags,
			joinedAt: new Date().toISOString(),
		};
		write("users", [...allUsers, user]);
		setSession(user);
		return { user: clone(user), token: `mock-token-${user.id}` };
	},

	getMe: async () => clone(requireSession()),
	getSession: async () => clone(getSessionUser()),
	clearSession: () => {
		localStorage.removeItem(SESSION_KEY);
		localStorage.removeItem("token");
	},

	getUsers: async () => clone(users()),
	getUser: async (id: string) => {
		const user = users().find((item) => item.id === id);
		if (!user) throw new Error("Пользователь не найден");
		return clone(user);
	},
	updateProfile: async (id: string, data: Partial<User>) => {
		const allUsers = users();
		const index = allUsers.findIndex((user) => user.id === id);
		if (index < 0) throw new Error("Пользователь не найден");
		allUsers[index] = { ...allUsers[index], ...data, id };
		write("users", allUsers);
		return clone(allUsers[index]);
	},

	followUser: async (id: string, maybeTargetId?: string) => {
		const ownerId = maybeTargetId ? id : requireSession().id;
		const targetId = maybeTargetId ?? id;
		const map = following();
		map[ownerId] = Array.from(new Set([...(map[ownerId] ?? []), targetId]));
		write("following", map);
	},
	unfollowUser: async (id: string, maybeTargetId?: string) => {
		const ownerId = maybeTargetId ? id : requireSession().id;
		const targetId = maybeTargetId ?? id;
		const map = following();
		map[ownerId] = (map[ownerId] ?? []).filter((item) => item !== targetId);
		write("following", map);
	},
	getFollowing: async (id: string) =>
		clone(users().filter((user) => (following()[id] ?? []).includes(user.id))),
	isFollowing: async (id: string) => ({
		following: (following()[requireSession().id] ?? []).includes(id),
	}),

	getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
		const allArticles = articles();
		return clone(
			users()
				.map((user) => ({
					user,
					articleCount: allArticles.filter((article) => article.authorId === user.id).length,
				}))
				.sort(
					(a, b) =>
						b.articleCount - a.articleCount || a.user.fullName.localeCompare(b.user.fullName),
				),
		);
	},

	getFeed: async (limit = 20, offset = 0) =>
		paginate(
			articles()
				.filter((article) => article.audience !== "community_only")
				.sort(byNewest),
			limit,
			offset,
		),
	getArticleById: async (id: string) => {
		const article = findArticle(id);
		if (!canViewArticle(article, getSessionUser()?.id ?? null)) {
			throw new Error("community_only");
		}
		return clone(article);
	},
	getUserArticles: async (userId: string, limit = 20, offset = 0) => {
		const viewerId = getSessionUser()?.id ?? null;
		return paginate(
			articles()
				.filter((article) => article.authorId === userId && canViewArticle(article, viewerId))
				.sort(byNewest),
			limit,
			offset,
		);
	},
	getCommunityArticles: async (communityId: string, limit = 20, offset = 0) => {
		const viewerId = getSessionUser()?.id ?? null;
		return paginate(
			articles()
				.filter(
					(article) => article.communityId === communityId && canViewArticle(article, viewerId),
				)
				.sort(byNewest),
			limit,
			offset,
		);
	},
	saveArticle: async (article: Article) => {
		const allArticles = articles();
		const index = allArticles.findIndex((item) => item.id === article.id);
		if (index >= 0) allArticles[index] = clone(article);
		else allArticles.unshift(clone(article));
		write("articles", allArticles);
		return clone(article);
	},
	deleteArticle: async (id: string) => {
		write(
			"articles",
			articles().filter((article) => article.id !== id),
		);
	},
	addComment: async (articleId: string, text: string) => {
		const currentUser = requireSession();
		const allArticles = articles();
		const index = allArticles.findIndex((article) => article.id === articleId);
		if (index < 0) throw new Error("Статья не найдена");
		if (!canViewArticle(allArticles[index], currentUser.id)) throw new Error("community_only");
		const comments = [
			...(allArticles[index].comments ?? []),
			{
				id: `comment-${Date.now()}`,
				authorId: currentUser.id,
				text,
				createdAt: new Date().toISOString(),
			},
		];
		allArticles[index] = { ...allArticles[index], comments, commentsCount: comments.length };
		write("articles", allArticles);
		return clone(allArticles[index]);
	},
	toggleReaction: async (articleId: string, emoji: string) => {
		const currentUser = requireSession();
		const allArticles = articles();
		const index = allArticles.findIndex((article) => article.id === articleId);
		if (index < 0) throw new Error("Статья не найдена");
		if (!canViewArticle(allArticles[index], currentUser.id)) throw new Error("community_only");
		const reactions = allArticles[index].reactions ?? [];
		const exists = reactions.some(
			(reaction) => reaction.userId === currentUser.id && reaction.emoji === emoji,
		);
		allArticles[index] = {
			...allArticles[index],
			reactions: exists
				? reactions.filter(
						(reaction) => reaction.userId !== currentUser.id || reaction.emoji !== emoji,
					)
				: [...reactions, { emoji, userId: currentUser.id }],
		};
		write("articles", allArticles);
		return clone(allArticles[index]);
	},

	getCommunities: async () =>
		clone(communities().sort((a, b) => b.memberIds.length - a.memberIds.length)),
	getCommunityById: async (id: string) => {
		const community = communities().find((item) => item.id === id);
		if (!community) throw new Error("Сообщество не найдено");
		return clone(community);
	},
	createCommunity: async (
		data: { name: string; description: string; aboutShort?: string },
		creator?: User,
	) => {
		const currentUser = creator ?? requireSession();
		const community: Community = {
			id: `c-${Date.now()}`,
			name: data.name,
			description: data.description,
			aboutShort: data.aboutShort ?? data.description.slice(0, 100),
			coverUrl: "/mocks/community-placeholder.jpg",
			creatorId: currentUser.id,
			adminIds: [currentUser.id],
			memberIds: [currentUser.id],
			blockedUserIds: [],
			createdAt: new Date().toISOString(),
		};
		write("communities", [community, ...communities()]);
		return clone(community);
	},
	getCommunityMembers: async (id: string) => {
		const community = communities().find((item) => item.id === id);
		if (!community) return [];
		return clone(users().filter((user) => community.memberIds.includes(user.id)));
	},
	joinCommunity: async (id: string, userId?: string) => {
		const memberId = userId ?? requireSession().id;
		const allCommunities = communities();
		const index = allCommunities.findIndex((community) => community.id === id);
		if (index < 0) throw new Error("Сообщество не найдено");
		if (allCommunities[index].blockedUserIds.includes(memberId))
			return { ok: false, error: "blocked" };
		allCommunities[index].memberIds = Array.from(
			new Set([...allCommunities[index].memberIds, memberId]),
		);
		write("communities", allCommunities);
		return { ok: true };
	},
	leaveCommunity: async (id: string, userId?: string) => {
		const memberId = userId ?? requireSession().id;
		const allCommunities = communities();
		const index = allCommunities.findIndex((community) => community.id === id);
		if (index < 0) throw new Error("Сообщество не найдено");
		if (allCommunities[index].creatorId === memberId)
			return { ok: false, error: "creator_cannot_leave" };
		allCommunities[index].memberIds = allCommunities[index].memberIds.filter(
			(item) => item !== memberId,
		);
		allCommunities[index].adminIds = allCommunities[index].adminIds.filter(
			(item) => item !== memberId,
		);
		write("communities", allCommunities);
		return { ok: true };
	},
	promoteMember: async (communityId: string, userId: string) => {
		const allCommunities = communities();
		const community = allCommunities.find((item) => item.id === communityId);
		if (!community) throw new Error("Сообщество не найдено");
		community.adminIds = Array.from(new Set([...community.adminIds, userId]));
		write("communities", allCommunities);
		return { ok: true };
	},
	blockUser: async (communityId: string, userId: string) => {
		const allCommunities = communities();
		const community = allCommunities.find((item) => item.id === communityId);
		if (!community) throw new Error("Сообщество не найдено");
		community.blockedUserIds = Array.from(new Set([...community.blockedUserIds, userId]));
		community.memberIds = community.memberIds.filter((item) => item !== userId);
		community.adminIds = community.adminIds.filter((item) => item !== userId);
		write("communities", allCommunities);
		return { ok: true };
	},
	getCommunitiesForMember: async (userId: string) =>
		clone(communities().filter((community) => community.memberIds.includes(userId))),

	getAuthorsLeaderboard: async () => mockApi.getLeaderboard(),
	getCommunitiesByMemberCount: async () => mockApi.getCommunities(),
	getUserById: async (id: string) => mockApi.getUser(id),
	getArticlesForProfile: async (userId: string, _viewerId?: string, limit = 20, offset = 0) =>
		mockApi.getUserArticles(userId, limit, offset),
	isFollowingUser: async (currentUserId: string, targetId: string) =>
		(following()[currentUserId] ?? []).includes(targetId),
	saveUser: async (data: Partial<User>) => {
		if (!data.id) throw new Error("User ID is required");
		return mockApi.updateProfile(data.id, data);
	},
	verifyAuthCode: async (telegramHandle: string, code: string) =>
		(await mockApi.verifyCode(telegramHandle, code)).user,
	getArticlesByCommunityId: async (communityId: string, limit = 20, offset = 0) =>
		mockApi.getCommunityArticles(communityId, limit, offset),
	promoteCommunityAdmin: async (communityId: string, _currentUserId: string, targetId: string) =>
		mockApi.promoteMember(communityId, targetId),
	blockUserFromCommunity: async (communityId: string, _currentUserId: string, targetId: string) =>
		mockApi.blockUser(communityId, targetId),
	getArticles: async (limit = 20, offset = 0) => mockApi.getFeed(limit, offset),
	toggleArticleReaction: async (articleId: string, _currentUserId: string, emoji: string) =>
		mockApi.toggleReaction(articleId, emoji),
};
