package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"new-north-backend/middleware"
)

const (
	defaultPageSize = 20
	maxPageSize     = 50
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func getUserID(r *http.Request) (string, bool) {
	return middleware.GetUserID(r)
}

// pageParams reads limit/offset from the query string with safe defaults.
func pageParams(r *http.Request) (limit, offset int) {
	limit = defaultPageSize
	if raw := r.URL.Query().Get("limit"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 {
			limit = n
		}
	}
	if limit > maxPageSize {
		limit = maxPageSize
	}
	if raw := r.URL.Query().Get("offset"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 {
			offset = n
		}
	}
	return limit, offset
}
