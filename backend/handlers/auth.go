package handlers

import (
	"encoding/json"
	"net/http"

	"new-north-backend/models"
	"new-north-backend/store"
)

type AuthHandler struct {
	Store *store.Store
}

func (h *AuthHandler) RequestCode(w http.ResponseWriter, r *http.Request) {
	var req models.AuthCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	// In production, we'd send a code via Telegram bot.
	// For now, just acknowledge.
	writeJSON(w, http.StatusOK, map[string]string{"message": "code sent"})
}

func (h *AuthHandler) VerifyCode(w http.ResponseWriter, r *http.Request) {
	var req models.AuthCodeVerify
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	user := h.Store.VerifyAuthCode(req.TelegramHandle, req.Code)
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid code or user not found"})
		return
	}
	token := h.Store.CreateSession(user.ID)
	writeJSON(w, http.StatusOK, models.LoginResponse{User: *user, Token: token})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		TelegramHandle string   `json:"telegramHandle"`
		FullName       string   `json:"fullName"`
		Bio            string   `json:"bio"`
		Tags           []string `json:"tags"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	if h.Store.GetUserByTelegramHandle(req.TelegramHandle) != nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "user already exists"})
		return
	}
	user := h.Store.CreateUser(req.TelegramHandle, req.FullName, req.Bio, req.Tags)
	token := h.Store.CreateSession(user.ID)
	writeJSON(w, http.StatusCreated, models.LoginResponse{User: *user, Token: token})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	user := h.Store.GetUserByID(userID)
	if user == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "user not found"})
		return
	}
	writeJSON(w, http.StatusOK, user)
}
