package handlers

import (
	"encoding/json"
	"net/http"

	"new-north-backend/middleware"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func getUserID(r *http.Request) (string, bool) {
	return middleware.GetUserID(r)
}
