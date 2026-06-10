package main

import (
	"log"
	"net/http"
	"os"

	"new-north-backend/handlers"
	"new-north-backend/middleware"
	"new-north-backend/store"

	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
)

func main() {
	// Initialize store
	st := store.New()
	st.Init()
	store.Global = st

	// Handlers
	authH := &handlers.AuthHandler{Store: st}
	userH := &handlers.UserHandler{Store: st}
	articleH := &handlers.ArticleHandler{Store: st}
	communityH := &handlers.CommunityHandler{Store: st}

	// Build token map from sessions
	authMiddleware := middleware.Auth(st.LookupToken)
	optionalAuth := middleware.OptionalAuth(st.LookupToken)

	r := chi.NewRouter()

	// CORS
	frontendURL := os.Getenv("FRONTEND_URL")
	allowedOrigins := []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"}
	if frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler(r)

	// Auth routes
	r.Post("/api/auth/request-code", authH.RequestCode)
	r.Post("/api/auth/verify-code", authH.VerifyCode)
	r.Post("/api/auth/register", authH.Register)
	r.With(authMiddleware).Get("/api/auth/me", authH.Me)

	// User routes
	r.Get("/api/users", userH.ListUsers)
	r.Get("/api/users/{id}", userH.GetUser)
	r.With(authMiddleware).Patch("/api/users/{id}", userH.UpdateProfile)
	r.With(optionalAuth).Get("/api/users/{id}/articles", userH.GetUserArticles)
	r.With(authMiddleware).Post("/api/users/{id}/follow", userH.FollowUser)
	r.With(authMiddleware).Delete("/api/users/{id}/follow", userH.UnfollowUser)
	r.Get("/api/users/{id}/following", userH.GetFollowing)
	r.With(authMiddleware).Get("/api/users/{id}/is-following", userH.IsFollowing)

	// Author leaderboard
	r.Get("/api/authors/leaderboard", userH.Leaderboard)

	// Article routes
	r.Get("/api/feed", articleH.ListFeed)
	r.With(authMiddleware).Post("/api/articles", articleH.CreateArticle)
	r.Get("/api/articles/{id}", articleH.GetArticle)
	r.With(authMiddleware).Put("/api/articles/{id}", articleH.UpdateArticle)
	r.With(authMiddleware).Delete("/api/articles/{id}", articleH.DeleteArticle)
	r.With(authMiddleware).Post("/api/articles/{id}/comments", articleH.AddComment)
	r.With(authMiddleware).Post("/api/articles/{id}/reactions", articleH.ToggleReaction)

	// Community article routes
	r.Get("/api/communities/{id}/articles", articleH.ListByCommunity)

	// Community routes
	r.Get("/api/communities", communityH.List)
	r.With(authMiddleware).Post("/api/communities", communityH.Create)
	r.Get("/api/communities/{id}", communityH.Get)
	r.Get("/api/communities/{id}/members", communityH.GetMembers)
	r.With(authMiddleware).Post("/api/communities/{id}/join", communityH.Join)
	r.With(authMiddleware).Post("/api/communities/{id}/leave", communityH.Leave)
	r.With(authMiddleware).Post("/api/communities/{id}/promote", communityH.Promote)
	r.With(authMiddleware).Post("/api/communities/{id}/block", communityH.Block)
	r.With(authMiddleware).Get("/api/communities/my", communityH.MyCommunities)

	// Health check
	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("New-North backend starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}
