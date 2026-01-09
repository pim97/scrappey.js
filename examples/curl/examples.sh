#!/bin/bash
# Scrappey - cURL/Shell Examples
#
# This script demonstrates how to interact with the Scrappey API using cURL.
#
# Prerequisites:
#   curl, jq (optional, for pretty printing)
#
# Usage:
#   export SCRAPPEY_API_KEY="your-api-key"
#   chmod +x examples.sh
#   ./examples.sh
#
# Get your API key at: https://scrappey.com

API_KEY="${SCRAPPEY_API_KEY:-YOUR_API_KEY_HERE}"
BASE_URL="https://publisher.scrappey.com/api/v1"

echo "=== Scrappey API cURL Examples ==="
echo "API Key: ${API_KEY:0:10}..."
echo

# Helper function to make requests
scrappey_request() {
    curl -s -X POST "${BASE_URL}?key=${API_KEY}" \
        -H "Content-Type: application/json" \
        -d "$1"
}

# ============================================
# Basic GET Request
# ============================================
echo "=== Basic GET Request ==="
scrappey_request '{
    "cmd": "request.get",
    "url": "https://httpbin.rs/get"
}' | jq -r '.data, .solution.statusCode, .session' 2>/dev/null || echo "Response received"
echo

# ============================================
# POST Request with Data
# ============================================
echo "=== POST Request with Data ==="
scrappey_request '{
    "cmd": "request.post",
    "url": "https://httpbin.rs/post",
    "postData": {
        "name": "John Doe",
        "email": "john@example.com"
    },
    "customHeaders": {
        "content-type": "application/json"
    }
}' | jq -r '.data, .solution.verified' 2>/dev/null || echo "Response received"
echo

# ============================================
# Create Session
# ============================================
echo "=== Create Session ==="
SESSION_RESPONSE=$(scrappey_request '{
    "cmd": "sessions.create"
}')
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session' 2>/dev/null)
echo "Created session: $SESSION_ID"
echo

# ============================================
# Use Session for Request
# ============================================
echo "=== Use Session for Request ==="
scrappey_request "{
    \"cmd\": \"request.get\",
    \"url\": \"https://httpbin.rs/cookies/set/token/abc123\",
    \"session\": \"$SESSION_ID\"
}" | jq -r '.data' 2>/dev/null || echo "Cookie set"
echo

# ============================================
# Get Cookies from Session
# ============================================
echo "=== Get Cookies from Session ==="
scrappey_request "{
    \"cmd\": \"request.get\",
    \"url\": \"https://httpbin.rs/cookies\",
    \"session\": \"$SESSION_ID\"
}" | jq -r '.solution.innerText' 2>/dev/null || echo "Cookies retrieved"
echo

# ============================================
# Destroy Session
# ============================================
echo "=== Destroy Session ==="
scrappey_request "{
    \"cmd\": \"sessions.destroy\",
    \"session\": \"$SESSION_ID\"
}" | jq -r '.data' 2>/dev/null || echo "Session destroyed"
echo

# ============================================
# Browser Actions
# ============================================
echo "=== Browser Actions ==="
scrappey_request '{
    "cmd": "request.get",
    "url": "https://example.com",
    "browserActions": [
        {
            "type": "wait_for_selector",
            "cssSelector": "h1"
        },
        {
            "type": "execute_js",
            "code": "document.querySelector(\"h1\").innerText"
        },
        {
            "type": "execute_js",
            "code": "document.title"
        }
    ]
}' | jq -r '.data, .solution.javascriptReturn' 2>/dev/null || echo "Response received"
echo

# ============================================
# Screenshot Capture
# ============================================
echo "=== Screenshot Capture ==="
scrappey_request '{
    "cmd": "request.get",
    "url": "https://example.com",
    "screenshot": true,
    "screenshotWidth": 1920,
    "screenshotHeight": 1080
}' | jq -r '.data, (.solution.screenshot | length | tostring) + " bytes"' 2>/dev/null || echo "Screenshot captured"
echo

# ============================================
# Cloudflare Bypass (commented by default)
# ============================================
# echo "=== Cloudflare Bypass ==="
# scrappey_request '{
#     "cmd": "request.get",
#     "url": "https://nowsecure.nl",
#     "cloudflareBypass": true,
#     "premiumProxy": true
# }' | jq -r '.data, .solution.verified, .solution.statusCode' 2>/dev/null

# ============================================
# Captcha Solving (commented by default)
# ============================================
# echo "=== Captcha Solving ==="
# scrappey_request '{
#     "cmd": "request.get",
#     "url": "https://example.com",
#     "automaticallySolveCaptchas": true,
#     "alwaysLoad": ["recaptcha", "hcaptcha", "turnstile"]
# }' | jq -r '.data' 2>/dev/null

# ============================================
# Complex Browser Workflow
# ============================================
echo "=== Complex Browser Workflow ==="
scrappey_request '{
    "cmd": "request.get",
    "url": "https://example.com",
    "browserActions": [
        {
            "type": "wait_for_load_state",
            "waitForLoadState": "networkidle"
        },
        {
            "type": "if",
            "condition": "document.querySelector(\"h1\") !== null",
            "then": [
                {
                    "type": "execute_js",
                    "code": "document.querySelector(\"h1\").textContent"
                }
            ],
            "or": [
                {
                    "type": "execute_js",
                    "code": "\"No heading found\""
                }
            ]
        },
        {
            "type": "scroll",
            "cssSelector": "body",
            "repeat": 2,
            "delayMs": 500
        }
    ],
    "innerText": true,
    "includeLinks": true
}' | jq -r '.data, .solution.javascriptReturn[0]' 2>/dev/null || echo "Response received"
echo

echo "=== Examples Complete ==="
echo
echo "For more information, visit:"
echo "  https://scrappey.com"
echo "  https://wiki.scrappey.com"
