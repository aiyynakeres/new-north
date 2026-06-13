package store

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"new-north-backend/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	db *DB
}

func New(db *DB) *Store {
	return &Store{db: db}
}

func (s *Store) IsAuthCodeValid(code string) bool {
	return code == "123456"
}

func (s *Store) VerifyAuthCode(telegramHandle, code string) *models.User {
	if code != "123456" {
		return nil
	}
	return s.GetUserByTelegramHandle(telegramHandle)
}

func (s *Store) CreateSession(userID string) string {
	ctx := context.Background()
	token := fmt.Sprintf("sess_%d_%s", time.Now().UnixNano(), userID)
	_, err := s.db.Pool.Exec(ctx, "INSERT INTO sessions (token, user_id) VALUES ($1, $2)", token, userID)
	if err != nil {
		return ""
	}
	return token
}

func (s *Store) LookupToken(token string) (string, bool) {
	ctx := context.Background()
	var userID string
	err := s.db.Pool.QueryRow(ctx, "SELECT user_id FROM sessions WHERE token = $1", token).Scan(&userID)
	if err != nil {
		return "", false
	}
	return userID, true
}

func (s *Store) GetUserByToken(token string) *models.User {
	ctx := context.Background()
	var userID string
	err := s.db.Pool.QueryRow(ctx, "SELECT user_id FROM sessions WHERE token = $1", token).Scan(&userID)
	if err != nil {
		return nil
	}
	return s.GetUserByID(userID)
}

func (s *Store) GetUsers() []*models.User {
	ctx := context.Background()
	rows, err := s.db.Pool.Query(ctx, "SELECT id, telegram_handle, full_name, avatar_url, banner_url, bio, tags, joined_at::text FROM users ORDER BY joined_at DESC")
	if err != nil {
		return []*models.User{}
	}
	defer rows.Close()

	var result []*models.User
	for rows.Next() {
		u := scanUser(rows)
		if u != nil {
			result = append(result, u)
		}
	}
	if result == nil {
		result = []*models.User{}
	}
	return result
}

func (s *Store) GetUserByID(id string) *models.User {
	ctx := context.Background()
	rows, err := s.db.Pool.Query(ctx, "SELECT id, telegram_handle, full_name, avatar_url, banner_url, bio, tags, joined_at::text FROM users WHERE id = $1", id)
	if err != nil {
		return nil
	}
	defer rows.Close()

	if rows.Next() {
		return scanUser(rows)
	}
	return nil
}

func (s *Store) GetUserByTelegramHandle(handle string) *models.User {
	ctx := context.Background()
	rows, err := s.db.Pool.Query(ctx, "SELECT id, telegram_handle, full_name, avatar_url, banner_url, bio, tags, joined_at::text FROM users WHERE telegram_handle = $1", handle)
	if err != nil {
		return nil
	}
	defer rows.Close()

	if rows.Next() {
		return scanUser(rows)
	}
	return nil
}

func (s *Store) SaveUser(user *models.User) {
	ctx := context.Background()
	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO users (id, telegram_handle, full_name, avatar_url, banner_url, bio, tags, joined_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 ON CONFLICT (id) DO UPDATE SET
		 telegram_handle = EXCLUDED.telegram_handle,
		 full_name = EXCLUDED.full_name,
		 avatar_url = EXCLUDED.avatar_url,
		 banner_url = EXCLUDED.banner_url,
		 bio = EXCLUDED.bio,
		 tags = EXCLUDED.tags`,
		user.ID, user.TelegramHandle, user.FullName, user.AvatarURL, user.BannerURL, user.Bio, user.Tags, user.JoinedAt)
	if err != nil {
		return
	}
}

func (s *Store) CreateUser(handle, fullName, bio string, tags []string) *models.User {
	ctx := context.Background()
	id := "u" + fmt.Sprintf("%d", time.Now().UnixNano())
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO users (id, telegram_handle, full_name, avatar_url, banner_url, bio, tags, joined_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		id, handle, fullName, "https://picsum.photos/200/200?grayscale", "https://picsum.photos/1200/400?grayscale", bio, tags, now)
	if err != nil {
		return nil
	}
	return &models.User{
		ID:             id,
		TelegramHandle: handle,
		FullName:       fullName,
		AvatarURL:      "https://picsum.photos/200/200?grayscale",
		BannerURL:      "https://picsum.photos/1200/400?grayscale",
		Bio:            bio,
		Tags:           tags,
		JoinedAt:       now,
	}
}

func (s *Store) GetArticles() []*models.Article {
	ctx := context.Background()
	return queryArticles(ctx, s.db.Pool, "SELECT id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at::text, updated_at::text, views, comments_count FROM articles ORDER BY created_at DESC")
}

func (s *Store) GetArticlesForPublicFeed() []*models.Article {
	ctx := context.Background()
	return queryArticles(ctx, s.db.Pool,
		`SELECT a.id, a.author_id, a.community_id, a.audience, a.title, a.preview, a.content, a.blocks, a.tags, a.created_at::text, a.updated_at::text, a.views, a.comments_count
		 FROM articles a
		 WHERE a.audience != 'community_only'
		 ORDER BY a.created_at DESC`)
}

func (s *Store) GetArticleByID(id string) *models.Article {
	ctx := context.Background()
	articles := queryArticles(ctx, s.db.Pool,
		`SELECT id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at::text, updated_at::text, views, comments_count
		 FROM articles WHERE id = $1`, id)
	if len(articles) == 0 {
		return nil
	}
	return articles[0]
}

func (s *Store) SaveArticle(article *models.Article) {
	ctx := context.Background()
	blocksJSON, _ := json.Marshal(article.Blocks)
	models.NormalizeArticle(article)

	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO articles (id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at, updated_at, views, comments_count)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		 ON CONFLICT (id) DO UPDATE SET
		 community_id = EXCLUDED.community_id,
		 audience = EXCLUDED.audience,
		 title = EXCLUDED.title,
		 preview = EXCLUDED.preview,
		 content = EXCLUDED.content,
		 blocks = EXCLUDED.blocks,
		 tags = EXCLUDED.tags,
		 updated_at = EXCLUDED.updated_at,
		 views = EXCLUDED.views,
		 comments_count = EXCLUDED.comments_count`,
		article.ID, article.AuthorID, article.CommunityID, article.Audience,
		article.Title, article.Preview, article.Content, blocksJSON,
		article.Tags, article.CreatedAt, article.UpdatedAt,
		article.Views, article.CommentsCount)
	if err != nil {
		return
	}
}

func (s *Store) CreateArticle(input models.CreateArticleInput, authorID string) *models.Article {
	ctx := context.Background()
	article := &models.Article{
		ID:       models.NewID(),
		AuthorID: authorID,
		Title:    input.Title,
		Preview:  input.Preview,
		Blocks:   input.Blocks,
		Tags:     input.Tags,
	}
	if input.CommunityID != nil && *input.CommunityID != "" {
		article.CommunityID = input.CommunityID
	}
	article.Audience = input.Audience
	if article.Audience == "" {
		article.Audience = "public"
	}
	if article.Audience == "community_only" && (article.CommunityID == nil || *article.CommunityID == "") {
		article.Audience = "public"
	}
	now := time.Now().UTC().Format(time.RFC3339)
	article.CreatedAt = now
	article.Content = generateContentFromBlocks(input.Blocks)

	blocksJSON, _ := json.Marshal(input.Blocks)
	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO articles (id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at, views, comments_count)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 0)`,
		article.ID, authorID, article.CommunityID, article.Audience,
		article.Title, article.Preview, article.Content, blocksJSON,
		article.Tags, now)
	if err != nil {
		return nil
	}
	return article
}

func (s *Store) UpdateArticle(id string, input models.UpdateArticleInput) *models.Article {
	ctx := context.Background()
	existing := s.GetArticleByID(id)
	if existing == nil {
		return nil
	}

	if input.Title != nil {
		existing.Title = *input.Title
	}
	if input.Preview != nil {
		existing.Preview = *input.Preview
	}
	if input.Audience != nil {
		existing.Audience = *input.Audience
	}
	if input.Blocks != nil {
		existing.Blocks = *input.Blocks
		existing.Content = generateContentFromBlocks(*input.Blocks)
	}
	if input.Tags != nil {
		existing.Tags = *input.Tags
	}
	now := time.Now().UTC().Format(time.RFC3339)
	existing.UpdatedAt = &now

	blocksJSON, _ := json.Marshal(existing.Blocks)
	_, err := s.db.Pool.Exec(ctx,
		`UPDATE articles SET title = $1, preview = $2, audience = $3, content = $4, blocks = $5, tags = $6, updated_at = $7
		 WHERE id = $8`,
		existing.Title, existing.Preview, existing.Audience, existing.Content,
		blocksJSON, existing.Tags, now, id)
	if err != nil {
		return nil
	}
	return existing
}

func (s *Store) DeleteArticle(id string) {
	ctx := context.Background()
	s.db.Pool.Exec(ctx, "DELETE FROM articles WHERE id = $1", id)
}

func (s *Store) GetArticlesByCommunityID(communityID string) []*models.Article {
	ctx := context.Background()
	return queryArticles(ctx, s.db.Pool,
		`SELECT id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at::text, updated_at::text, views, comments_count
		 FROM articles WHERE community_id = $1
		 ORDER BY created_at DESC`, communityID)
}

func (s *Store) GetArticlesForProfile(authorID string, viewerID *string) []*models.Article {
	ctx := context.Background()
	var articles []*models.Article
	if viewerID != nil && *viewerID == authorID {
		articles = queryArticles(ctx, s.db.Pool,
			`SELECT id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at::text, updated_at::text, views, comments_count
			 FROM articles WHERE author_id = $1
			 ORDER BY created_at DESC`, authorID)
	} else {
		articles = queryArticles(ctx, s.db.Pool,
			`SELECT id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at::text, updated_at::text, views, comments_count
			 FROM articles WHERE author_id = $1 AND audience != 'community_only'
			 ORDER BY created_at DESC`, authorID)
	}
	return articles
}

func (s *Store) CountArticlesByAuthor(authorID string) int {
	ctx := context.Background()
	var count int
	s.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM articles WHERE author_id = $1", authorID).Scan(&count)
	return count
}

func (s *Store) IncrementArticleViews(id string) {
	ctx := context.Background()
	s.db.Pool.Exec(ctx, "UPDATE articles SET views = views + 1 WHERE id = $1", id)
}

func (s *Store) CanEditArticle(userID string, article *models.Article) bool {
	if userID == "" || article == nil {
		return false
	}
	if article.AuthorID == userID {
		return true
	}
	if article.CommunityID == nil || *article.CommunityID == "" {
		return false
	}
	c := s.GetCommunityByID(*article.CommunityID)
	if c == nil {
		return false
	}
	return c.CreatorID == userID || contains(c.AdminIDs, userID)
}

func (s *Store) AddComment(articleID string, comment *models.Comment) *models.Article {
	ctx := context.Background()
	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO comments (id, article_id, author_id, text, created_at) VALUES ($1, $2, $3, $4, $5)`,
		comment.ID, articleID, comment.AuthorID, comment.Text, comment.CreatedAt)
	if err != nil {
		return nil
	}
	s.db.Pool.Exec(ctx, "UPDATE articles SET comments_count = comments_count + 1 WHERE id = $1", articleID)
	return s.GetArticleByID(articleID)
}

func (s *Store) ToggleArticleReaction(articleID, userID, emoji string) *models.Article {
	ctx := context.Background()
	var exists int
	err := s.db.Pool.QueryRow(ctx,
		"SELECT 1 FROM article_reactions WHERE article_id = $1 AND user_id = $2 AND emoji = $3",
		articleID, userID, emoji).Scan(&exists)

	if err == nil {
		s.db.Pool.Exec(ctx, "DELETE FROM article_reactions WHERE article_id = $1 AND user_id = $2 AND emoji = $3",
			articleID, userID, emoji)
	} else {
		s.db.Pool.Exec(ctx,
			"INSERT INTO article_reactions (article_id, user_id, emoji) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
			articleID, userID, emoji)
	}
	return s.GetArticleByID(articleID)
}

func (s *Store) GetCommunities() []*models.Community {
	ctx := context.Background()
	return queryCommunities(ctx, s.db.Pool, "SELECT id, name, about_short, description, cover_url, creator_id, admin_ids, member_ids, blocked_user_ids, created_at::text FROM communities ORDER BY cardinality(member_ids) DESC, name ASC")
}

func (s *Store) GetCommunityByID(id string) *models.Community {
	ctx := context.Background()
	rows, err := s.db.Pool.Query(ctx,
		"SELECT id, name, about_short, description, cover_url, creator_id, admin_ids, member_ids, blocked_user_ids, created_at::text FROM communities WHERE id = $1", id)
	if err != nil {
		return nil
	}
	defer rows.Close()

	if rows.Next() {
		return scanCommunity(rows)
	}
	return nil
}

func (s *Store) SaveCommunity(community *models.Community) {
	ctx := context.Background()
	models.NormalizeCommunity(community)
	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO communities (id, name, about_short, description, cover_url, creator_id, admin_ids, member_ids, blocked_user_ids, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		 ON CONFLICT (id) DO UPDATE SET
		 name = EXCLUDED.name,
		 about_short = EXCLUDED.about_short,
		 description = EXCLUDED.description,
		 cover_url = EXCLUDED.cover_url,
		 admin_ids = EXCLUDED.admin_ids,
		 member_ids = EXCLUDED.member_ids,
		 blocked_user_ids = EXCLUDED.blocked_user_ids`,
		community.ID, community.Name, community.AboutShort, community.Description,
		community.CoverURL, community.CreatorID, community.AdminIDs,
		community.MemberIDs, community.BlockedUserIDs, community.CreatedAt)
	if err != nil {
		return
	}
}

func (s *Store) CreateCommunity(input models.CreateCommunityInput, creatorID string) *models.Community {
	ctx := context.Background()
	now := time.Now().UTC().Format(time.RFC3339)
	c := &models.Community{
		ID:             models.NewID(),
		Name:           strings.TrimSpace(input.Name),
		AboutShort:     strings.TrimSpace(input.AboutShort),
		Description:    strings.TrimSpace(input.Description),
		CoverURL:       "https://picsum.photos/800/200?grayscale",
		CreatorID:      creatorID,
		AdminIDs:       []string{creatorID},
		MemberIDs:      []string{creatorID},
		BlockedUserIDs: []string{},
		CreatedAt:      now,
	}
	models.NormalizeCommunity(c)
	_, err := s.db.Pool.Exec(ctx,
		`INSERT INTO communities (id, name, about_short, description, cover_url, creator_id, admin_ids, member_ids, blocked_user_ids, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		c.ID, c.Name, c.AboutShort, c.Description, c.CoverURL, c.CreatorID,
		c.AdminIDs, c.MemberIDs, c.BlockedUserIDs, now)
	if err != nil {
		return nil
	}
	return c
}

func (s *Store) GetCommunitiesForMember(userID string) []*models.Community {
	ctx := context.Background()
	return queryCommunities(ctx, s.db.Pool,
		`SELECT id, name, about_short, description, cover_url, creator_id, admin_ids, member_ids, blocked_user_ids, created_at::text
		 FROM communities WHERE $1 = ANY(member_ids)
		 ORDER BY name ASC`, userID)
}

func (s *Store) GetCommunitiesByMemberCount() []*models.Community {
	return s.GetCommunities()
}

func (s *Store) JoinCommunity(communityID, userID string) models.JoinResult {
	ctx := context.Background()
	c := s.GetCommunityByID(communityID)
	if c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	if contains(c.BlockedUserIDs, userID) {
		return models.JoinResult{OK: false, Error: "blocked"}
	}
	if contains(c.MemberIDs, userID) {
		return models.JoinResult{OK: true}
	}
	_, err := s.db.Pool.Exec(ctx,
		"UPDATE communities SET member_ids = array_append(member_ids, $1) WHERE id = $2 AND NOT ($1 = ANY(member_ids))",
		userID, communityID)
	if err != nil {
		return models.JoinResult{OK: false, Error: "db_error"}
	}
	return models.JoinResult{OK: true}
}

func (s *Store) LeaveCommunity(communityID, userID string) models.JoinResult {
	ctx := context.Background()
	c := s.GetCommunityByID(communityID)
	if c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	if c.CreatorID == userID {
		return models.JoinResult{OK: false, Error: "creator_cannot_leave"}
	}
	_, err := s.db.Pool.Exec(ctx,
		`UPDATE communities SET
		 member_ids = array_remove(member_ids, $1),
		 admin_ids = array_remove(admin_ids, $1)
		 WHERE id = $2`, userID, communityID)
	if err != nil {
		return models.JoinResult{OK: false, Error: "db_error"}
	}
	return models.JoinResult{OK: true}
}

func (s *Store) PromoteCommunityAdmin(communityID, actorID, targetUserID string) models.JoinResult {
	ctx := context.Background()
	c := s.GetCommunityByID(communityID)
	if c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	if c.CreatorID != actorID {
		return models.JoinResult{OK: false, Error: "forbidden"}
	}
	if !contains(c.MemberIDs, targetUserID) {
		return models.JoinResult{OK: false, Error: "not_member"}
	}
	_, err := s.db.Pool.Exec(ctx,
		"UPDATE communities SET admin_ids = array_append(admin_ids, $1) WHERE id = $2 AND NOT ($1 = ANY(admin_ids))",
		targetUserID, communityID)
	if err != nil {
		return models.JoinResult{OK: false, Error: "db_error"}
	}
	return models.JoinResult{OK: true}
}

func (s *Store) BlockUserFromCommunity(communityID, actorID, targetUserID string) models.JoinResult {
	ctx := context.Background()
	c := s.GetCommunityByID(communityID)
	if c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	isMod := c.CreatorID == actorID || contains(c.AdminIDs, actorID)
	if !isMod {
		return models.JoinResult{OK: false, Error: "forbidden"}
	}
	if targetUserID == c.CreatorID {
		return models.JoinResult{OK: false, Error: "cannot_block_creator"}
	}
	_, err := s.db.Pool.Exec(ctx,
		`UPDATE communities SET
		 member_ids = array_remove(member_ids, $1),
		 admin_ids = array_remove(admin_ids, $1),
		 blocked_user_ids = CASE WHEN NOT ($1 = ANY(blocked_user_ids)) THEN array_append(blocked_user_ids, $1) ELSE blocked_user_ids END
		 WHERE id = $2`,
		targetUserID, communityID)
	if err != nil {
		return models.JoinResult{OK: false, Error: "db_error"}
	}
	return models.JoinResult{OK: true}
}

func (s *Store) IsFollowingUser(followerID, targetUserID string) bool {
	if followerID == targetUserID {
		return false
	}
	ctx := context.Background()
	var exists int
	err := s.db.Pool.QueryRow(ctx,
		"SELECT 1 FROM follows WHERE follower_id = $1 AND target_id = $2",
		followerID, targetUserID).Scan(&exists)
	return err == nil
}

func (s *Store) FollowUser(followerID, targetUserID string) {
	if followerID == targetUserID {
		return
	}
	ctx := context.Background()
	s.db.Pool.Exec(ctx,
		"INSERT INTO follows (follower_id, target_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
		followerID, targetUserID)
}

func (s *Store) UnfollowUser(followerID, targetUserID string) {
	ctx := context.Background()
	s.db.Pool.Exec(ctx,
		"DELETE FROM follows WHERE follower_id = $1 AND target_id = $2",
		followerID, targetUserID)
}

func (s *Store) GetFollowing(followerID string) []string {
	ctx := context.Background()
	rows, err := s.db.Pool.Query(ctx, "SELECT target_id FROM follows WHERE follower_id = $1", followerID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var result []string
	for rows.Next() {
		var targetID string
		rows.Scan(&targetID)
		result = append(result, targetID)
	}
	return result
}

func (s *Store) GetAuthorsLeaderboard() []models.LeaderboardEntry {
	ctx := context.Background()
	rows, err := s.db.Pool.Query(ctx,
		`SELECT u.id, u.telegram_handle, u.full_name, u.avatar_url, u.banner_url, u.bio, u.tags, u.joined_at,
		        COUNT(a.id) AS article_count
		 FROM users u
		 LEFT JOIN articles a ON a.author_id = u.id
		 GROUP BY u.id
		 ORDER BY article_count DESC, u.full_name ASC`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var entries []models.LeaderboardEntry
	for rows.Next() {
		var u models.User
		var count int
		rows.Scan(&u.ID, &u.TelegramHandle, &u.FullName, &u.AvatarURL, &u.BannerURL, &u.Bio, &u.Tags, &u.JoinedAt, &count)
		entries = append(entries, models.LeaderboardEntry{User: u, ArticleCount: count})
	}
	return entries
}

func (s *Store) Seed(ctx context.Context) error {
	for i := range initialUsers {
		u := initialUsers[i]
		_, err := s.db.Pool.Exec(ctx,
			`INSERT INTO users (id, telegram_handle, full_name, avatar_url, banner_url, bio, tags, joined_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
			u.ID, u.TelegramHandle, u.FullName, u.AvatarURL, u.BannerURL, u.Bio, u.Tags, u.JoinedAt)
		if err != nil {
			return err
		}
	}
	for i := range initialCommunities {
		c := initialCommunities[i]
		models.NormalizeCommunity(&c)
		_, err := s.db.Pool.Exec(ctx,
			`INSERT INTO communities (id, name, about_short, description, cover_url, creator_id, admin_ids, member_ids, blocked_user_ids, created_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
			c.ID, c.Name, c.AboutShort, c.Description, c.CoverURL, c.CreatorID, c.AdminIDs, c.MemberIDs, c.BlockedUserIDs, c.CreatedAt)
		if err != nil {
			return err
		}
	}
	for i := range initialArticles {
		a := initialArticles[i]
		models.NormalizeArticle(&a)
		blocksJSON, _ := json.Marshal(a.Blocks)
		_, err := s.db.Pool.Exec(ctx,
			`INSERT INTO articles (id, author_id, community_id, audience, title, preview, content, blocks, tags, created_at, views, comments_count)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING`,
			a.ID, a.AuthorID, a.CommunityID, a.Audience, a.Title, a.Preview, a.Content, blocksJSON, a.Tags, a.CreatedAt, a.Views, a.CommentsCount)
		if err != nil {
			return err
		}
		for _, cm := range a.Comments {
			_, err := s.db.Pool.Exec(ctx,
				`INSERT INTO comments (id, article_id, author_id, text, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
				cm.ID, a.ID, cm.AuthorID, cm.Text, cm.CreatedAt)
			if err != nil {
				return err
			}
		}
		for _, r := range a.Reactions {
			_, err := s.db.Pool.Exec(ctx,
				`INSERT INTO article_reactions (article_id, user_id, emoji) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
				a.ID, r.UserID, r.Emoji)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

// -- scan / query helpers --

func scanUser(row pgx.Row) *models.User {
	var u models.User
	err := row.Scan(&u.ID, &u.TelegramHandle, &u.FullName, &u.AvatarURL, &u.BannerURL, &u.Bio, &u.Tags, &u.JoinedAt)
	if err != nil {
		return nil
	}
	return &u
}

func queryArticles(ctx context.Context, pool *pgxpool.Pool, query string, args ...any) []*models.Article {
	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return []*models.Article{}
	}
	defer rows.Close()

	var result []*models.Article
	for rows.Next() {
		a := scanArticle(rows)
		if a != nil {
			loadReactions(ctx, pool, a)
			loadComments(ctx, pool, a)
			result = append(result, a)
		}
	}
	if result == nil {
		result = []*models.Article{}
	}
	return result
}

func scanArticle(row pgx.Row) *models.Article {
	var a models.Article
	var blocksJSON []byte
	var communityID *string

	err := row.Scan(&a.ID, &a.AuthorID, &communityID, &a.Audience, &a.Title, &a.Preview,
		&a.Content, &blocksJSON, &a.Tags, &a.CreatedAt, &a.UpdatedAt, &a.Views, &a.CommentsCount)
	if err != nil {
		return nil
	}

	a.CommunityID = communityID
	if len(blocksJSON) > 0 {
		json.Unmarshal(blocksJSON, &a.Blocks)
	}
	if a.Blocks == nil {
		a.Blocks = []models.ArticleBlock{}
	}
	models.NormalizeArticle(&a)
	return &a
}

func loadReactions(ctx context.Context, pool *pgxpool.Pool, a *models.Article) {
	rows, err := pool.Query(ctx, "SELECT emoji, user_id FROM article_reactions WHERE article_id = $1", a.ID)
	if err != nil {
		a.Reactions = []models.ArticleReaction{}
		return
	}
	defer rows.Close()

	var reactions []models.ArticleReaction
	for rows.Next() {
		var r models.ArticleReaction
		rows.Scan(&r.Emoji, &r.UserID)
		reactions = append(reactions, r)
	}
	if reactions == nil {
		reactions = []models.ArticleReaction{}
	}
	a.Reactions = reactions
}

func loadComments(ctx context.Context, pool *pgxpool.Pool, a *models.Article) {
	rows, err := pool.Query(ctx, "SELECT id, author_id, text, created_at::text FROM comments WHERE article_id = $1 ORDER BY created_at ASC", a.ID)
	if err != nil {
		a.Comments = []models.Comment{}
		return
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var c models.Comment
		rows.Scan(&c.ID, &c.AuthorID, &c.Text, &c.CreatedAt)
		comments = append(comments, c)
	}
	if comments == nil {
		comments = []models.Comment{}
	}
	a.Comments = comments
}

func scanCommunity(row pgx.Row) *models.Community {
	var c models.Community
	err := row.Scan(&c.ID, &c.Name, &c.AboutShort, &c.Description, &c.CoverURL,
		&c.CreatorID, &c.AdminIDs, &c.MemberIDs, &c.BlockedUserIDs, &c.CreatedAt)
	if err != nil {
		return nil
	}
	models.NormalizeCommunity(&c)
	return &c
}

func queryCommunities(ctx context.Context, pool *pgxpool.Pool, query string, args ...any) []*models.Community {
	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return []*models.Community{}
	}
	defer rows.Close()

	var result []*models.Community
	for rows.Next() {
		c := scanCommunity(rows)
		if c != nil {
			result = append(result, c)
		}
	}
	if result == nil {
		result = []*models.Community{}
	}
	return result
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func generateContentFromBlocks(blocks []models.ArticleBlock) string {
	var parts []string
	for _, b := range blocks {
		parts = append(parts, b.Content)
	}
	return strings.Join(parts, "\n\n")
}
