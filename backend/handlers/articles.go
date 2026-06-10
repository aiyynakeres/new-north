package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"new-north-backend/models"
	"new-north-backend/store"
)

type ArticleHandler struct {
	Store *store.Store
}

func (h *ArticleHandler) ListFeed(w http.ResponseWriter, r *http.Request) {
	articles := h.Store.GetArticlesForPublicFeed()
	writeJSON(w, http.StatusOK, articles)
}

func (h *ArticleHandler) GetArticle(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	article := h.Store.GetArticleByID(id)
	if article == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	h.Store.IncrementArticleViews(id)
	writeJSON(w, http.StatusOK, article)
}

func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	var input models.CreateArticleInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	article := h.Store.CreateArticle(input, userID)
	writeJSON(w, http.StatusCreated, article)
}

func (h *ArticleHandler) UpdateArticle(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id := r.PathValue("id")
	article := h.Store.GetArticleByID(id)
	if article == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if !h.Store.CanEditArticle(userID, article) {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
		return
	}
	var input models.UpdateArticleInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	updated := h.Store.UpdateArticle(id, input)
	if updated == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *ArticleHandler) DeleteArticle(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id := r.PathValue("id")
	article := h.Store.GetArticleByID(id)
	if article == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if !h.Store.CanEditArticle(userID, article) {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
		return
	}
	h.Store.DeleteArticle(id)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *ArticleHandler) ListByCommunity(w http.ResponseWriter, r *http.Request) {
	communityID := r.PathValue("id")
	articles := h.Store.GetArticlesByCommunityID(communityID)
	if articles == nil {
		articles = []*models.Article{}
	}
	writeJSON(w, http.StatusOK, articles)
}

func (h *ArticleHandler) AddComment(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	articleID := r.PathValue("id")
	var input models.AddCommentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	comment := &models.Comment{
		ID:        models.NewID(),
		AuthorID:  userID,
		Text:      input.Text,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}
	updated := h.Store.AddComment(articleID, comment)
	if updated == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "article not found"})
		return
	}
	writeJSON(w, http.StatusCreated, updated)
}

func (h *ArticleHandler) ToggleReaction(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	articleID := r.PathValue("id")
	var input models.ToggleReactionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	updated := h.Store.ToggleArticleReaction(articleID, userID, input.Emoji)
	if updated == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "article not found"})
		return
	}
	writeJSON(w, http.StatusOK, updated)
}
