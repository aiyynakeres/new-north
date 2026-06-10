package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"new-north-backend/models"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AIHandler struct{}

func (h *AIHandler) GenerateTags(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		writeJSON(w, http.StatusOK, []string{"general", "life"})
		return
	}

	var input models.AITagsInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		writeJSON(w, http.StatusOK, []string{"general", "life"})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	content := input.Content
	if len(content) > 500 {
		content = content[:500]
	}
	prompt := "Analyze this blog post and generate 3-5 relevant, short tags (one word each). Return them as a comma-separated list. Content: " + content

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		writeJSON(w, http.StatusOK, []string{"general", "life"})
		return
	}

	tags := parseTags(resp)
	writeJSON(w, http.StatusOK, tags)
}

func (h *AIHandler) EnhanceText(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		writeJSON(w, http.StatusOK, map[string]string{"text": ""})
		return
	}

	var input models.AIEnhanceInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]string{"text": input.Text})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")

	var prompt string
	switch input.Type {
	case "grammar":
		prompt = "Fix grammar and spelling, keep the same tone/language: " + input.Text
	case "expand":
		prompt = "Expand on this idea slightly to make it more inspiring, keep the language used: " + input.Text
	case "tone":
		prompt = "Make this text sound more professional and reflective (Vas3k style blog), keep language: " + input.Text
	default:
		prompt = input.Text
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]string{"text": input.Text})
		return
	}

	text := extractText(resp)
	if text == "" {
		text = input.Text
	}
	writeJSON(w, http.StatusOK, map[string]string{"text": text})
}

func parseTags(resp *genai.GenerateContentResponse) []string {
	for _, c := range resp.Candidates {
		if c.Content != nil {
			for _, part := range c.Content.Parts {
				if t, ok := part.(genai.Text); ok {
					parts := strings.Split(string(t), ",")
					tags := make([]string, 0, len(parts))
					for _, p := range parts {
						s := strings.TrimSpace(p)
						s = strings.TrimPrefix(s, "#")
						if s != "" {
							tags = append(tags, s)
						}
					}
					if len(tags) > 0 {
						return tags
					}
				}
			}
		}
	}
	return []string{"general", "life"}
}

func extractText(resp *genai.GenerateContentResponse) string {
	for _, c := range resp.Candidates {
		if c.Content != nil {
			for _, part := range c.Content.Parts {
				if t, ok := part.(genai.Text); ok {
					return string(t)
				}
			}
		}
	}
	return ""
}
