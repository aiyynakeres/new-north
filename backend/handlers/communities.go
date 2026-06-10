package handlers

import (
	"encoding/json"
	"net/http"

	"new-north-backend/models"
	"new-north-backend/store"
)

type CommunityHandler struct {
	Store *store.Store
}

func (h *CommunityHandler) List(w http.ResponseWriter, r *http.Request) {
	communities := h.Store.GetCommunitiesByMemberCount()
	writeJSON(w, http.StatusOK, communities)
}

func (h *CommunityHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	c := h.Store.GetCommunityByID(id)
	if c == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, c)
}

func (h *CommunityHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	var input models.CreateCommunityInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	c := h.Store.CreateCommunity(input, userID)
	writeJSON(w, http.StatusCreated, c)
}

func (h *CommunityHandler) GetMembers(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	c := h.Store.GetCommunityByID(id)
	if c == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	type memberInfo struct {
		User  models.User `json:"user"`
		Role  string      `json:"role"`
	}
	members := make([]memberInfo, 0)
	for _, mid := range c.MemberIDs {
		u := h.Store.GetUserByID(mid)
		if u == nil {
			continue
		}
		role := "member"
		if c.CreatorID == mid {
			role = "creator"
		} else if contains(c.AdminIDs, mid) {
			role = "admin"
		}
		members = append(members, memberInfo{User: *u, Role: role})
	}
	writeJSON(w, http.StatusOK, members)
}

func (h *CommunityHandler) Join(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id := r.PathValue("id")
	result := h.Store.JoinCommunity(id, userID)
	if !result.OK {
		writeJSON(w, http.StatusConflict, result)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *CommunityHandler) Leave(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id := r.PathValue("id")
	result := h.Store.LeaveCommunity(id, userID)
	if !result.OK {
		writeJSON(w, http.StatusConflict, result)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *CommunityHandler) Promote(w http.ResponseWriter, r *http.Request) {
	actorID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id := r.PathValue("id")
	var req struct {
		UserID string `json:"userId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	result := h.Store.PromoteCommunityAdmin(id, actorID, req.UserID)
	if !result.OK {
		writeJSON(w, http.StatusConflict, result)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *CommunityHandler) Block(w http.ResponseWriter, r *http.Request) {
	actorID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	id := r.PathValue("id")
	var req struct {
		UserID string `json:"userId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	result := h.Store.BlockUserFromCommunity(id, actorID, req.UserID)
	if !result.OK {
		writeJSON(w, http.StatusConflict, result)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *CommunityHandler) MyCommunities(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserID(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	communities := h.Store.GetCommunitiesForMember(userID)
	writeJSON(w, http.StatusOK, communities)
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
