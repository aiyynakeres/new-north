package models

import "time"

type User struct {
	ID              string   `json:"id"`
	TelegramHandle  string   `json:"telegramHandle"`
	FullName        string   `json:"fullName"`
	AvatarURL       string   `json:"avatarUrl"`
	BannerURL       string   `json:"bannerUrl"`
	Bio             string   `json:"bio"`
	Tags            []string `json:"tags"`
	JoinedAt        string   `json:"joinedAt"`
}

type Comment struct {
	ID        string `json:"id"`
	AuthorID  string `json:"authorId"`
	Text      string `json:"text"`
	CreatedAt string `json:"createdAt"`
}

type ArticleReaction struct {
	Emoji  string `json:"emoji"`
	UserID string `json:"userId"`
}

type ArticleBlock struct {
	ID      string `json:"id"`
	Type    string `json:"type"`
	Content string `json:"content"`
}

type Article struct {
	ID            string            `json:"id"`
	AuthorID      string            `json:"authorId"`
	CommunityID   *string           `json:"communityId,omitempty"`
	Audience      string            `json:"audience,omitempty"`
	Title         string            `json:"title"`
	Preview       string            `json:"preview"`
	Content       string            `json:"content"`
	Blocks        []ArticleBlock    `json:"blocks,omitempty"`
	Tags          []string          `json:"tags"`
	CreatedAt     string            `json:"createdAt"`
	UpdatedAt     *string           `json:"updatedAt,omitempty"`
	Views         int               `json:"views"`
	CommentsCount int               `json:"commentsCount"`
	Comments      []Comment         `json:"comments,omitempty"`
	Reactions     []ArticleReaction `json:"reactions,omitempty"`
}

type Community struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Description    string   `json:"description"`
	AboutShort     string   `json:"aboutShort"`
	CoverURL       string   `json:"coverUrl"`
	CreatorID      string   `json:"creatorId"`
	AdminIDs       []string `json:"adminIds"`
	MemberIDs      []string `json:"memberIds"`
	BlockedUserIDs []string `json:"blockedUserIds"`
	CreatedAt      string   `json:"createdAt"`
}

type LeaderboardEntry struct {
	User         User `json:"user"`
	ArticleCount int  `json:"articleCount"`
}

type JoinResult struct {
	OK    bool   `json:"ok"`
	Error string `json:"error,omitempty"`
}

type AuthCodeRequest struct {
	TelegramHandle string `json:"telegramHandle"`
}

type AuthCodeVerify struct {
	TelegramHandle string `json:"telegramHandle"`
	Code           string `json:"code"`
}

type LoginResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

type CreateCommunityInput struct {
	Name        string `json:"name"`
	AboutShort  string `json:"aboutShort"`
	Description string `json:"description"`
}

type CreateArticleInput struct {
	CommunityID *string         `json:"communityId,omitempty"`
	Audience    string          `json:"audience,omitempty"`
	Title       string          `json:"title"`
	Preview     string          `json:"preview"`
	Blocks      []ArticleBlock  `json:"blocks,omitempty"`
	Tags        []string        `json:"tags"`
}

type UpdateArticleInput struct {
	Title     *string        `json:"title,omitempty"`
	Preview   *string        `json:"preview,omitempty"`
	Audience  *string        `json:"audience,omitempty"`
	Blocks    *[]ArticleBlock `json:"blocks,omitempty"`
	Tags      *[]string      `json:"tags,omitempty"`
}

type UpdateProfileInput struct {
	FullName       *string   `json:"fullName,omitempty"`
	Bio            *string   `json:"bio,omitempty"`
	Tags           *[]string `json:"tags,omitempty"`
	AvatarURL      *string   `json:"avatarUrl,omitempty"`
	BannerURL      *string   `json:"bannerUrl,omitempty"`
	TelegramHandle *string   `json:"telegramHandle,omitempty"`
}

type ToggleReactionInput struct {
	Emoji string `json:"emoji"`
}

type AddCommentInput struct {
	Text string `json:"text"`
}

type AIEnhanceInput struct {
	Text string `json:"text"`
	Type string `json:"type"`
}

type AITagsInput struct {
	Content string `json:"content"`
}

func NewID() string {
	return "id_" + time.Now().Format("150405.000000000")
}

func NormalizeArticle(a *Article) {
	if a.Audience == "" {
		a.Audience = "public"
	}
	if a.Reactions == nil {
		a.Reactions = []ArticleReaction{}
	}
}

func NormalizeCommunity(c *Community) {
	if c.AboutShort == "" {
		if len(c.Description) > 140 {
			c.AboutShort = c.Description[:140]
		} else {
			c.AboutShort = c.Description
		}
	}
}
