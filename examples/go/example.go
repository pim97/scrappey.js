// Scrappey - Go Example
//
// This example demonstrates how to use the Scrappey API from Go.
//
// Prerequisites:
//   go mod init scrappey-example
//   go get github.com/go-resty/resty/v2
//
// Run:
//   go run example.go
//
// Get your API key at: https://scrappey.com

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
)

import (
	"bytes"
	"io"
	"net/http"
	"time"
)

var (
	apiKey  = getEnv("SCRAPPEY_API_KEY", "YOUR_API_KEY_HERE")
	baseURL = "https://publisher.scrappey.com/api/v1"
)

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Solution represents the response data
type Solution struct {
	Verified         bool                   `json:"verified"`
	Response         string                 `json:"response"`
	StatusCode       int                    `json:"statusCode"`
	CurrentURL       string                 `json:"currentUrl"`
	UserAgent        string                 `json:"userAgent"`
	Cookies          []map[string]any       `json:"cookies"`
	CookieString     string                 `json:"cookieString"`
	InnerText        string                 `json:"innerText"`
	Screenshot       string                 `json:"screenshot"`
	JavascriptReturn []any                  `json:"javascriptReturn"`
}

// ScrappeyResponse represents the API response
type ScrappeyResponse struct {
	Solution    Solution `json:"solution"`
	TimeElapsed int      `json:"timeElapsed"`
	Data        string   `json:"data"`
	Session     string   `json:"session"`
	Error       string   `json:"error,omitempty"`
}

// Scrappey client
type Scrappey struct {
	APIKey  string
	BaseURL string
	Client  *http.Client
}

// NewScrappey creates a new Scrappey client
func NewScrappey(apiKey string) *Scrappey {
	return &Scrappey{
		APIKey:  apiKey,
		BaseURL: baseURL,
		Client: &http.Client{
			Timeout: 5 * time.Minute,
		},
	}
}

// Request sends a request to the Scrappey API
func (s *Scrappey) Request(data map[string]any) (*ScrappeyResponse, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("%s?key=%s", s.BaseURL, s.APIKey)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var result ScrappeyResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &result, nil
}

// Get sends a GET request
func (s *Scrappey) Get(url string, options map[string]any) (*ScrappeyResponse, error) {
	data := map[string]any{
		"cmd": "request.get",
		"url": url,
	}
	for k, v := range options {
		data[k] = v
	}
	return s.Request(data)
}

// Post sends a POST request
func (s *Scrappey) Post(url string, postData any, options map[string]any) (*ScrappeyResponse, error) {
	data := map[string]any{
		"cmd":      "request.post",
		"url":      url,
		"postData": postData,
	}
	for k, v := range options {
		data[k] = v
	}
	return s.Request(data)
}

// CreateSession creates a new browser session
func (s *Scrappey) CreateSession(options map[string]any) (*ScrappeyResponse, error) {
	data := map[string]any{
		"cmd": "sessions.create",
	}
	for k, v := range options {
		data[k] = v
	}
	return s.Request(data)
}

// DestroySession destroys an existing session
func (s *Scrappey) DestroySession(session string) (*ScrappeyResponse, error) {
	return s.Request(map[string]any{
		"cmd":     "sessions.destroy",
		"session": session,
	})
}

func basicGetExample(scrappey *Scrappey) error {
	fmt.Println("\n=== Basic GET Request ===\n")

	response, err := scrappey.Get("https://httpbin.rs/get", nil)
	if err != nil {
		return err
	}

	fmt.Printf("Status: %s\n", response.Data)
	fmt.Printf("Status Code: %d\n", response.Solution.StatusCode)
	fmt.Printf("Session: %s\n", response.Session)

	return nil
}

func postExample(scrappey *Scrappey) error {
	fmt.Println("\n=== POST Request ===\n")

	postData := map[string]string{
		"name":  "John Doe",
		"email": "john@example.com",
	}

	response, err := scrappey.Post("https://httpbin.rs/post", postData, map[string]any{
		"customHeaders": map[string]string{
			"content-type": "application/json",
		},
	})
	if err != nil {
		return err
	}

	fmt.Printf("Status: %s\n", response.Data)
	fmt.Printf("Verified: %v\n", response.Solution.Verified)

	return nil
}

func sessionExample(scrappey *Scrappey) error {
	fmt.Println("\n=== Session Management ===\n")

	// Create session
	sessionResponse, err := scrappey.CreateSession(nil)
	if err != nil {
		return err
	}
	sessionID := sessionResponse.Session
	fmt.Printf("Created session: %s\n", sessionID)

	// Use session
	response, err := scrappey.Get("https://httpbin.rs/cookies/set/token/abc123", map[string]any{
		"session": sessionID,
	})
	if err != nil {
		return err
	}
	fmt.Printf("Set cookie, status: %s\n", response.Data)

	// Get cookies
	response, err = scrappey.Get("https://httpbin.rs/cookies", map[string]any{
		"session": sessionID,
	})
	if err != nil {
		return err
	}
	fmt.Printf("Cookies: %s\n", truncate(response.Solution.InnerText, 100))

	// Destroy session
	_, err = scrappey.DestroySession(sessionID)
	if err != nil {
		return err
	}
	fmt.Println("Session destroyed")

	return nil
}

func browserActionsExample(scrappey *Scrappey) error {
	fmt.Println("\n=== Browser Actions ===\n")

	response, err := scrappey.Get("https://example.com", map[string]any{
		"browserActions": []map[string]any{
			{
				"type":        "wait_for_selector",
				"cssSelector": "h1",
			},
			{
				"type": "execute_js",
				"code": "document.querySelector('h1').innerText",
			},
			{
				"type": "execute_js",
				"code": "document.title",
			},
		},
	})
	if err != nil {
		return err
	}

	fmt.Printf("Status: %s\n", response.Data)
	if len(response.Solution.JavascriptReturn) > 0 {
		fmt.Printf("Heading: %v\n", response.Solution.JavascriptReturn[0])
	}
	if len(response.Solution.JavascriptReturn) > 1 {
		fmt.Printf("Title: %v\n", response.Solution.JavascriptReturn[1])
	}

	return nil
}

func cloudflareBypassExample(scrappey *Scrappey) error {
	fmt.Println("\n=== Cloudflare Bypass ===\n")

	response, err := scrappey.Get("https://nowsecure.nl", map[string]any{
		"cloudflareBypass": true,
		"premiumProxy":     true,
	})
	if err != nil {
		return err
	}

	fmt.Printf("Status: %s\n", response.Data)
	fmt.Printf("Verified: %v\n", response.Solution.Verified)
	fmt.Printf("Status Code: %d\n", response.Solution.StatusCode)

	return nil
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

func main() {
	scrappey := NewScrappey(apiKey)

	if err := basicGetExample(scrappey); err != nil {
		log.Printf("Basic GET example error: %v\n", err)
	}

	if err := postExample(scrappey); err != nil {
		log.Printf("POST example error: %v\n", err)
	}

	if err := sessionExample(scrappey); err != nil {
		log.Printf("Session example error: %v\n", err)
	}

	if err := browserActionsExample(scrappey); err != nil {
		log.Printf("Browser actions example error: %v\n", err)
	}

	// Uncomment to test Cloudflare bypass
	// if err := cloudflareBypassExample(scrappey); err != nil {
	// 	log.Printf("Cloudflare bypass error: %v\n", err)
	// }

	fmt.Println("\n✓ All examples completed!\n")
}
