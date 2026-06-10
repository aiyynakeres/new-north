package store

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"new-north-backend/models"
)

type Store struct {
	mu           sync.RWMutex
	users        map[string]*models.User
	articles     map[string]*models.Article
	communities  map[string]*models.Community
	following    map[string]map[string]bool
	sessions     map[string]string
	telegramToID map[string]string
}

var Global *Store

func New() *Store {
	return &Store{
		users:        make(map[string]*models.User),
		articles:     make(map[string]*models.Article),
		communities:  make(map[string]*models.Community),
		following:    make(map[string]map[string]bool),
		sessions:     make(map[string]string),
		telegramToID: make(map[string]string),
	}
}

func (s *Store) Init() {
	for i := range initialUsers {
		u := initialUsers[i]
		s.users[u.ID] = &u
		s.telegramToID[u.TelegramHandle] = u.ID
	}
	for i := range initialCommunities {
		c := initialCommunities[i]
		models.NormalizeCommunity(&c)
		s.communities[c.ID] = &c
	}
	for i := range initialArticles {
		a := initialArticles[i]
		models.NormalizeArticle(&a)
		s.articles[a.ID] = &a
	}
}

// --- Auth ---

func (s *Store) IsAuthCodeValid(code string) bool {
	return code == "123456"
}

func (s *Store) VerifyAuthCode(telegramHandle, code string) *models.User {
	if code != "123456" {
		return nil
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	id, ok := s.telegramToID[telegramHandle]
	if !ok {
		return nil
	}
	u := s.users[id]
	if u == nil {
		return nil
	}
	cp := *u
	return &cp
}

func (s *Store) CreateSession(userID string) string {
	s.mu.Lock()
	defer s.mu.Unlock()
	token := fmt.Sprintf("sess_%d_%s", time.Now().UnixNano(), userID)
	s.sessions[token] = userID
	return token
}

func (s *Store) LookupToken(token string) (string, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	userID, ok := s.sessions[token]
	return userID, ok
}

func (s *Store) GetUserByToken(token string) *models.User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	userID, ok := s.sessions[token]
	if !ok {
		return nil
	}
	u, ok := s.users[userID]
	if !ok || u == nil {
		return nil
	}
	cp := *u
	return &cp
}

// --- Users ---

func (s *Store) GetUsers() []*models.User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.User, 0, len(s.users))
	for _, u := range s.users {
		cp := *u
		result = append(result, &cp)
	}
	return result
}

func (s *Store) GetUserByID(id string) *models.User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	u, ok := s.users[id]
	if !ok || u == nil {
		return nil
	}
	cp := *u
	return &cp
}

func (s *Store) GetUserByTelegramHandle(handle string) *models.User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	id, ok := s.telegramToID[handle]
	if !ok {
		return nil
	}
	u, ok := s.users[id]
	if !ok || u == nil {
		return nil
	}
	cp := *u
	return &cp
}

func (s *Store) SaveUser(user *models.User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.users[user.ID] = user
	s.telegramToID[user.TelegramHandle] = user.ID
}

func (s *Store) CreateUser(handle, fullName, bio string, tags []string) *models.User {
	s.mu.Lock()
	defer s.mu.Unlock()
	user := &models.User{
		ID:             "u" + fmt.Sprintf("%d", time.Now().UnixNano()),
		TelegramHandle: handle,
		FullName:       fullName,
		AvatarURL:      "https://picsum.photos/200/200?grayscale",
		BannerURL:      "https://picsum.photos/1200/400?grayscale",
		Bio:            bio,
		Tags:           tags,
		JoinedAt:       time.Now().UTC().Format(time.RFC3339),
	}
	s.users[user.ID] = user
	s.telegramToID[handle] = user.ID
	cp := *user
	return &cp
}

// --- Articles ---

func (s *Store) GetArticles() []*models.Article {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.Article, 0, len(s.articles))
	for _, a := range s.articles {
		cp := *a
		models.NormalizeArticle(&cp)
		result = append(result, &cp)
	}
	return result
}

func (s *Store) GetArticlesForPublicFeed() []*models.Article {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.Article, 0)
	for _, a := range s.articles {
		if a.Audience != "community_only" {
			cp := *a
			models.NormalizeArticle(&cp)
			result = append(result, &cp)
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt > result[j].CreatedAt
	})
	return result
}

func (s *Store) GetArticleByID(id string) *models.Article {
	s.mu.RLock()
	defer s.mu.RUnlock()
	a, ok := s.articles[id]
	if !ok || a == nil {
		return nil
	}
	cp := *a
	models.NormalizeArticle(&cp)
	return &cp
}

func (s *Store) SaveArticle(article *models.Article) {
	s.mu.Lock()
	defer s.mu.Unlock()
	models.NormalizeArticle(article)
	if article.Audience == "community_only" && (article.CommunityID == nil || *article.CommunityID == "") {
		article.Audience = "public"
	}
	s.articles[article.ID] = article
}

func (s *Store) CreateArticle(input models.CreateArticleInput, authorID string) *models.Article {
	s.mu.Lock()
	defer s.mu.Unlock()
	audience := input.Audience
	if audience == "" {
		audience = "public"
	}
	if audience == "community_only" && (input.CommunityID == nil || *input.CommunityID == "") {
		audience = "public"
	}
	now := time.Now().UTC().Format(time.RFC3339)
	article := &models.Article{
		ID:            models.NewID(),
		AuthorID:      authorID,
		CommunityID:   input.CommunityID,
		Audience:      audience,
		Title:         input.Title,
		Preview:       input.Preview,
		Content:       generateContentFromBlocks(input.Blocks),
		Blocks:        input.Blocks,
		Tags:          input.Tags,
		CreatedAt:     now,
		Views:         0,
		CommentsCount: 0,
		Comments:      []models.Comment{},
		Reactions:     []models.ArticleReaction{},
	}
	s.articles[article.ID] = article
	cp := *article
	return &cp
}

func (s *Store) UpdateArticle(id string, input models.UpdateArticleInput) *models.Article {
	s.mu.Lock()
	defer s.mu.Unlock()
	a, ok := s.articles[id]
	if !ok || a == nil {
		return nil
	}
	if input.Title != nil {
		a.Title = *input.Title
	}
	if input.Preview != nil {
		a.Preview = *input.Preview
	}
	if input.Audience != nil {
		a.Audience = *input.Audience
	}
	if input.Blocks != nil {
		a.Blocks = *input.Blocks
		a.Content = generateContentFromBlocks(*input.Blocks)
	}
	if input.Tags != nil {
		a.Tags = *input.Tags
	}
	now := time.Now().UTC().Format(time.RFC3339)
	a.UpdatedAt = &now
	cp := *a
	models.NormalizeArticle(&cp)
	return &cp
}

func (s *Store) DeleteArticle(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.articles, id)
}

func (s *Store) GetArticlesByCommunityID(communityID string) []*models.Article {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.Article, 0)
	for _, a := range s.articles {
		if a.CommunityID != nil && *a.CommunityID == communityID {
			cp := *a
			models.NormalizeArticle(&cp)
			result = append(result, &cp)
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt > result[j].CreatedAt
	})
	return result
}

func (s *Store) GetArticlesForProfile(authorID string, viewerID *string) []*models.Article {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.Article, 0)
	for _, a := range s.articles {
		if a.AuthorID != authorID {
			continue
		}
		if viewerID != nil && *viewerID == authorID {
			cp := *a
			models.NormalizeArticle(&cp)
			result = append(result, &cp)
			continue
		}
		if a.Audience != "community_only" {
			cp := *a
			models.NormalizeArticle(&cp)
			result = append(result, &cp)
		}
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt > result[j].CreatedAt
	})
	return result
}

func (s *Store) CountArticlesByAuthor(authorID string) int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	count := 0
	for _, a := range s.articles {
		if a.AuthorID == authorID {
			count++
		}
	}
	return count
}

func (s *Store) IncrementArticleViews(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if a, ok := s.articles[id]; ok && a != nil {
		a.Views++
	}
}

func (s *Store) CanEditArticle(userID string, article *models.Article) bool {
	if userID == "" {
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

// --- Comments ---

func (s *Store) AddComment(articleID string, comment *models.Comment) *models.Article {
	s.mu.Lock()
	defer s.mu.Unlock()
	a, ok := s.articles[articleID]
	if !ok || a == nil {
		return nil
	}
	a.Comments = append(a.Comments, *comment)
	a.CommentsCount = len(a.Comments)
	cp := *a
	models.NormalizeArticle(&cp)
	return &cp
}

// --- Reactions ---

func (s *Store) ToggleArticleReaction(articleID, userID, emoji string) *models.Article {
	s.mu.Lock()
	defer s.mu.Unlock()
	a, ok := s.articles[articleID]
	if !ok || a == nil {
		return nil
	}
	reactions := a.Reactions
	if reactions == nil {
		reactions = []models.ArticleReaction{}
	}
	hit := -1
	for i, r := range reactions {
		if r.UserID == userID && r.Emoji == emoji {
			hit = i
			break
		}
	}
	if hit >= 0 {
		a.Reactions = append(reactions[:hit], reactions[hit+1:]...)
	} else {
		a.Reactions = append(reactions, models.ArticleReaction{Emoji: emoji, UserID: userID})
	}
	cp := *a
	models.NormalizeArticle(&cp)
	return &cp
}

// --- Communities ---

func (s *Store) GetCommunities() []*models.Community {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.Community, 0, len(s.communities))
	for _, c := range s.communities {
		cp := *c
		models.NormalizeCommunity(&cp)
		result = append(result, &cp)
	}
	return result
}

func (s *Store) GetCommunityByID(id string) *models.Community {
	s.mu.RLock()
	defer s.mu.RUnlock()
	c, ok := s.communities[id]
	if !ok || c == nil {
		return nil
	}
	cp := *c
	models.NormalizeCommunity(&cp)
	return &cp
}

func (s *Store) SaveCommunity(community *models.Community) {
	s.mu.Lock()
	defer s.mu.Unlock()
	models.NormalizeCommunity(community)
	s.communities[community.ID] = community
}

func (s *Store) CreateCommunity(input models.CreateCommunityInput, creatorID string) *models.Community {
	s.mu.Lock()
	defer s.mu.Unlock()
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
	s.communities[c.ID] = c
	cp := *c
	return &cp
}

func (s *Store) GetCommunitiesForMember(userID string) []*models.Community {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.Community, 0)
	for _, c := range s.communities {
		if contains(c.MemberIDs, userID) {
			cp := *c
			models.NormalizeCommunity(&cp)
			result = append(result, &cp)
		}
	}
	return result
}

func (s *Store) GetCommunitiesByMemberCount() []*models.Community {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*models.Community, 0, len(s.communities))
	for _, c := range s.communities {
		cp := *c
		models.NormalizeCommunity(&cp)
		result = append(result, &cp)
	}
	sort.Slice(result, func(i, j int) bool {
		if len(result[i].MemberIDs) != len(result[j].MemberIDs) {
			return len(result[i].MemberIDs) > len(result[j].MemberIDs)
		}
		return result[i].Name < result[j].Name
	})
	return result
}

func (s *Store) JoinCommunity(communityID, userID string) models.JoinResult {
	s.mu.Lock()
	defer s.mu.Unlock()
	c, ok := s.communities[communityID]
	if !ok || c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	if contains(c.BlockedUserIDs, userID) {
		return models.JoinResult{OK: false, Error: "blocked"}
	}
	if contains(c.MemberIDs, userID) {
		return models.JoinResult{OK: true}
	}
	c.MemberIDs = append(c.MemberIDs, userID)
	return models.JoinResult{OK: true}
}

func (s *Store) LeaveCommunity(communityID, userID string) models.JoinResult {
	s.mu.Lock()
	defer s.mu.Unlock()
	c, ok := s.communities[communityID]
	if !ok || c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	if c.CreatorID == userID {
		return models.JoinResult{OK: false, Error: "creator_cannot_leave"}
	}
	c.MemberIDs = removeString(c.MemberIDs, userID)
	c.AdminIDs = removeString(c.AdminIDs, userID)
	return models.JoinResult{OK: true}
}

func (s *Store) PromoteCommunityAdmin(communityID, actorID, targetUserID string) models.JoinResult {
	s.mu.Lock()
	defer s.mu.Unlock()
	c, ok := s.communities[communityID]
	if !ok || c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	if c.CreatorID != actorID {
		return models.JoinResult{OK: false, Error: "forbidden"}
	}
	if !contains(c.MemberIDs, targetUserID) {
		return models.JoinResult{OK: false, Error: "not_member"}
	}
	if !contains(c.AdminIDs, targetUserID) {
		c.AdminIDs = append(c.AdminIDs, targetUserID)
	}
	return models.JoinResult{OK: true}
}

func (s *Store) BlockUserFromCommunity(communityID, actorID, targetUserID string) models.JoinResult {
	s.mu.Lock()
	defer s.mu.Unlock()
	c, ok := s.communities[communityID]
	if !ok || c == nil {
		return models.JoinResult{OK: false, Error: "not_found"}
	}
	isMod := c.CreatorID == actorID || contains(c.AdminIDs, actorID)
	if !isMod {
		return models.JoinResult{OK: false, Error: "forbidden"}
	}
	if targetUserID == c.CreatorID {
		return models.JoinResult{OK: false, Error: "cannot_block_creator"}
	}
	c.MemberIDs = removeString(c.MemberIDs, targetUserID)
	c.AdminIDs = removeString(c.AdminIDs, targetUserID)
	if !contains(c.BlockedUserIDs, targetUserID) {
		c.BlockedUserIDs = append(c.BlockedUserIDs, targetUserID)
	}
	return models.JoinResult{OK: true}
}

// --- Following ---

func (s *Store) IsFollowingUser(followerID, targetUserID string) bool {
	if followerID == targetUserID {
		return false
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	set, ok := s.following[followerID]
	return ok && set[targetUserID]
}

func (s *Store) FollowUser(followerID, targetUserID string) {
	if followerID == targetUserID {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.following[followerID] == nil {
		s.following[followerID] = make(map[string]bool)
	}
	s.following[followerID][targetUserID] = true
}

func (s *Store) UnfollowUser(followerID, targetUserID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if set, ok := s.following[followerID]; ok {
		delete(set, targetUserID)
	}
}

func (s *Store) GetFollowing(followerID string) []string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]string, 0)
	for id := range s.following[followerID] {
		result = append(result, id)
	}
	return result
}

// --- Leaderboard ---

func (s *Store) GetAuthorsLeaderboard() []models.LeaderboardEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()
	entries := make([]models.LeaderboardEntry, 0, len(s.users))
	for _, u := range s.users {
		count := 0
		for _, a := range s.articles {
			if a.AuthorID == u.ID {
				count++
			}
		}
		entries = append(entries, models.LeaderboardEntry{User: *u, ArticleCount: count})
	}
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].ArticleCount != entries[j].ArticleCount {
			return entries[i].ArticleCount > entries[j].ArticleCount
		}
		return strings.Compare(entries[i].User.FullName, entries[j].User.FullName) < 0
	})
	return entries
}

// --- Helpers ---

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func removeString(slice []string, item string) []string {
	result := make([]string, 0, len(slice))
	for _, s := range slice {
		if s != item {
			result = append(result, s)
		}
	}
	return result
}

func generateContentFromBlocks(blocks []models.ArticleBlock) string {
	var parts []string
	for _, b := range blocks {
		parts = append(parts, b.Content)
	}
	return strings.Join(parts, "\n\n")
}
