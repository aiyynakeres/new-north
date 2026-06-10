package handlers

import (
	"encoding/json"
	"net/http"

	"new-north-backend/models"
	"new-north-backend/store"
)

type UserHandler struct {
	Store *store.Store
}

func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	users := h.Store.GetUsers()
	writeJSON(w, http.StatusOK, users)
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	user := h.Store.GetUserByID(userID)
	if user == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	targetID := r.PathValue("id")
	if targetID != userID {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
		return
	}
	var input models.UpdateProfileInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	user := h.Store.GetUserByID(userID)
	if user == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if input.FullName != nil {
		user.FullName = *input.FullName
	}
	if input.Bio != nil {
		user.Bio = *input.Bio
	}
	if input.Tags != nil {
		user.Tags = *input.Tags
	}
	if input.AvatarURL != nil {
		user.AvatarURL = *input.AvatarURL
	}
	if input.BannerURL != nil {
		user.BannerURL = *input.BannerURL
	}
	if input.TelegramHandle != nil {
		user.TelegramHandle = *input.TelegramHandle
	}
	h.Store.SaveUser(user)
	writeJSON(w, http.StatusOK, user)
}

func (h *UserHandler) GetUserArticles(w http.ResponseWriter, r *http.Request) {
	authorID := r.PathValue("id")
	viewerID, _ := getUserID(r)
	articles := h.Store.GetArticlesForProfile(authorID, &viewerID)
	if articles == nil {
		articles = []*models.Article{}
	}
	writeJSON(w, http.StatusOK, articles)
}

func (h *UserHandler) FollowUser(w http.ResponseWriter, r *http.Request) {
	followerID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	targetID := r.PathValue("id")
	if followerID == targetID {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "cannot follow yourself"})
		return
	}
	h.Store.FollowUser(followerID, targetID)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *UserHandler) UnfollowUser(w http.ResponseWriter, r *http.Request) {
	followerID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	targetID := r.PathValue("id")
	h.Store.UnfollowUser(followerID, targetID)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *UserHandler) IsFollowing(w http.ResponseWriter, r *http.Request) {
	followerID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	targetID := r.PathValue("id")
	isFollowing := h.Store.IsFollowingUser(followerID, targetID)
	writeJSON(w, http.StatusOK, map[string]bool{"following": isFollowing})
}

func (h *UserHandler) Leaderboard(w http.ResponseWriter, r *http.Request) {
	entries := h.Store.GetAuthorsLeaderboard()
	writeJSON(w, http.StatusOK, entries)
}

func (h *UserHandler) GetFollowing(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	following := h.Store.GetFollowing(userID)
	writeJSON(w, http.StatusOK, following)
}
