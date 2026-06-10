package store

import "new-north-backend/models"

var initialUsers = []models.User{
	{
		ID:             "u1",
		TelegramHandle: "admin_north",
		FullName:       "Ayaan North",
		AvatarURL:      "https://picsum.photos/200/200?random=1",
		BannerURL:      "https://picsum.photos/1200/400?random=1",
		Bio:            "Founder of New-North. Love coding and hiking in Lena Pillars.",
		Tags:           []string{"coding", "startup", "yakutia"},
		JoinedAt:       "2025-01-01T00:00:00Z",
	},
	{
		ID:             "u2",
		TelegramHandle: "lena_dev",
		FullName:       "Lena Petrov",
		AvatarURL:      "https://picsum.photos/200/200?random=3",
		BannerURL:      "https://picsum.photos/1200/400?random=4",
		Bio:            "Фронтенд и горы. Пишу о коде и путешествиях по Якутии.",
		Tags:           []string{"frontend", "travel"},
		JoinedAt:       "2025-01-02T00:00:00Z",
	},
}

var initialCommunities = []models.Community{
	{
		ID:             "c1",
		Name:           "Клуб New-North",
		AboutShort:     "Новости платформы, идеи и знакомства без шума.",
		Description:    "Официальное сообщество платформы: новости, идеи и знакомства.",
		CoverURL:       "https://picsum.photos/800/200?random=10",
		CreatorID:      "u1",
		AdminIDs:       []string{"u1"},
		MemberIDs:      []string{"u1"},
		BlockedUserIDs: []string{},
		CreatedAt:      "2025-01-01T00:00:00Z",
	},
	{
		ID:             "c2",
		Name:           "Dev Якутия",
		AboutShort:     "Митапы, код и pet-проекты для разработчиков региона.",
		Description:    "Разработчики, митапы и pet-проекты.",
		CoverURL:       "https://picsum.photos/800/200?random=11",
		CreatorID:      "u1",
		AdminIDs:       []string{"u1"},
		MemberIDs:      []string{"u1", "u2"},
		BlockedUserIDs: []string{},
		CreatedAt:      "2025-01-01T00:00:00Z",
	},
	{
		ID:             "c3",
		Name:           "Тихие истории",
		AboutShort:     "Длинные тексты и размышления в спокойном темпе.",
		Description:    "Длинные тексты без суеты.",
		CoverURL:       "https://picsum.photos/800/200?random=12",
		CreatorID:      "u2",
		AdminIDs:       []string{"u2"},
		MemberIDs:      []string{"u2"},
		BlockedUserIDs: []string{},
		CreatedAt:      "2025-01-02T00:00:00Z",
	},
}

var initialArticles = []models.Article{
	{
		ID:       "a1",
		AuthorID: "u1",
		CommunityID: strPtr("c1"),
		Audience: "public",
		Title:    "Why I started New-North",
		Preview:  "Tired of the noise on mainstream social media, I wanted to build a sanctuary...",
		Content:  "Legacy content...",
		Blocks: []models.ArticleBlock{
			{ID: "b1", Type: "h1", Content: "The Beginning"},
			{ID: "b2", Type: "paragraph", Content: "Twitter is too noisy. Instagram is too fake. We needed a place for **deep thoughts** and real connections."},
			{ID: "b3", Type: "h2", Content: "The Mission"},
			{ID: "b4", Type: "paragraph", Content: "To inspire the youth of Yakutia. To share knowledge. To meet."},
			{ID: "b5", Type: "image", Content: "https://picsum.photos/800/400?random=2"},
			{ID: "b6", Type: "paragraph", Content: "This platform is built for you."},
		},
		Tags:          []string{"intro", "philosophy"},
		CreatedAt:     "2025-01-03T00:00:00Z",
		Views:         120,
		CommentsCount: 1,
		Comments: []models.Comment{
			{ID: "c1", AuthorID: "u1", Text: "Welcome to the platform!", CreatedAt: "2025-01-03T00:00:01Z"},
		},
		Reactions: []models.ArticleReaction{
			{Emoji: "❤️", UserID: "u1"},
			{Emoji: "👍", UserID: "u2"},
		},
	},
	{
		ID:       "a2",
		AuthorID: "u1",
		Audience: "public",
		Title:    "Как мы собираем ленту без шума",
		Preview:  "Несколько принципов, по которым строится New-North...",
		Content:  "Legacy...",
		Blocks: []models.ArticleBlock{
			{ID: "a2b1", Type: "h1", Content: "Спокойная лента"},
			{ID: "a2b2", Type: "paragraph", Content: "Мы убираем лишнее и оставляем место для смысла."},
		},
		Tags:          []string{"product"},
		CreatedAt:     "2025-01-04T00:00:00Z",
		Views:         45,
		CommentsCount: 0,
		Comments:      []models.Comment{},
	},
	{
		ID:       "a3",
		AuthorID: "u2",
		CommunityID: strPtr("c2"),
		Audience: "public",
		Title:    "Первый митап во дворе коворкинга",
		Preview:  "Короткий отчёт о том, как прошла встреча Dev Якутия...",
		Content:  "Legacy...",
		Blocks: []models.ArticleBlock{
			{ID: "a3b1", Type: "paragraph", Content: "Собрались обсудить React 19 и обменялись контактами."},
		},
		Tags:          []string{"meetup"},
		CreatedAt:     "2025-01-05T00:00:00Z",
		Views:         28,
		CommentsCount: 0,
		Comments:      []models.Comment{},
	},
}

func strPtr(s string) *string { return &s }
