"""
Scrappey - Python Example

This example demonstrates how to use the Scrappey API from Python.

Prerequisites:
    pip install httpx

Get your API key at: https://scrappey.com
"""

import asyncio
import os
from typing import Any, Optional

import httpx

API_KEY = os.getenv("SCRAPPEY_API_KEY", "YOUR_API_KEY_HERE")
BASE_URL = "https://publisher.scrappey.com/api/v1"


class Scrappey:
    """Scrappey API client for Python."""

    def __init__(self, api_key: str, base_url: str = BASE_URL):
        self.api_key = api_key
        self.base_url = base_url

    async def request(self, data: dict[str, Any]) -> dict[str, Any]:
        """Send a request to the Scrappey API."""
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                f"{self.base_url}?key={self.api_key}",
                json=data,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            return response.json()

    async def get(self, url: str, **options) -> dict[str, Any]:
        """Send a GET request."""
        return await self.request({"cmd": "request.get", "url": url, **options})

    async def post(self, url: str, post_data: Any = None, **options) -> dict[str, Any]:
        """Send a POST request."""
        return await self.request(
            {"cmd": "request.post", "url": url, "postData": post_data, **options}
        )

    async def put(self, url: str, post_data: Any = None, **options) -> dict[str, Any]:
        """Send a PUT request."""
        return await self.request(
            {"cmd": "request.put", "url": url, "postData": post_data, **options}
        )

    async def delete(self, url: str, **options) -> dict[str, Any]:
        """Send a DELETE request."""
        return await self.request({"cmd": "request.delete", "url": url, **options})

    async def patch(self, url: str, post_data: Any = None, **options) -> dict[str, Any]:
        """Send a PATCH request."""
        return await self.request(
            {"cmd": "request.patch", "url": url, "postData": post_data, **options}
        )

    async def create_session(self, **options) -> dict[str, Any]:
        """Create a new browser session."""
        return await self.request({"cmd": "sessions.create", **options})

    async def destroy_session(self, session: str) -> dict[str, Any]:
        """Destroy an existing session."""
        return await self.request({"cmd": "sessions.destroy", "session": session})

    async def list_sessions(self, user_id: int) -> dict[str, Any]:
        """List all active sessions for a user."""
        return await self.request({"cmd": "sessions.list", "userId": user_id})

    async def is_session_active(self, session: str) -> dict[str, Any]:
        """Check if a session is currently active."""
        return await self.request({"cmd": "sessions.active", "session": session})


async def basic_get_example(scrappey: Scrappey) -> None:
    """Basic GET request example."""
    print("\n=== Basic GET Request ===\n")

    response = await scrappey.get("https://httpbin.rs/get")

    print(f"Status: {response['data']}")
    print(f"Status Code: {response['solution'].get('statusCode')}")
    print(f"Session: {response['session']}")


async def post_example(scrappey: Scrappey) -> None:
    """POST request example."""
    print("\n=== POST Request ===\n")

    response = await scrappey.post(
        "https://httpbin.rs/post",
        post_data={"name": "John Doe", "email": "john@example.com"},
        customHeaders={"content-type": "application/json"},
    )

    print(f"Status: {response['data']}")
    print(f"Verified: {response['solution'].get('verified')}")


async def session_example(scrappey: Scrappey) -> None:
    """Session management example."""
    print("\n=== Session Management ===\n")

    # Create session
    session_response = await scrappey.create_session()
    session_id = session_response["session"]
    print(f"Created session: {session_id}")

    # Use session for requests
    response1 = await scrappey.get(
        "https://httpbin.rs/cookies/set/session_token/abc123",
        session=session_id,
    )
    print(f"Set cookie, status: {response1['data']}")

    # Second request - cookies persist
    response2 = await scrappey.get(
        "https://httpbin.rs/cookies",
        session=session_id,
    )
    print(f"Cookies: {response2['solution'].get('innerText', '')[:100]}")

    # Destroy session
    await scrappey.destroy_session(session_id)
    print("Session destroyed")


async def browser_actions_example(scrappey: Scrappey) -> None:
    """Browser actions example."""
    print("\n=== Browser Actions ===\n")

    response = await scrappey.get(
        "https://example.com",
        browserActions=[
            {"type": "wait_for_selector", "cssSelector": "h1"},
            {"type": "execute_js", "code": "document.querySelector('h1').innerText"},
            {
                "type": "execute_js",
                "code": "Array.from(document.links).map(l => l.href)",
            },
        ],
    )

    print(f"Status: {response['data']}")
    js_results = response["solution"].get("javascriptReturn", [])
    if js_results:
        print(f"Heading: {js_results[0]}")
        print(f"Links found: {len(js_results[1]) if len(js_results) > 1 else 0}")


async def cloudflare_bypass_example(scrappey: Scrappey) -> None:
    """Cloudflare bypass example."""
    print("\n=== Cloudflare Bypass ===\n")

    response = await scrappey.get(
        "https://nowsecure.nl",
        cloudflareBypass=True,
        premiumProxy=True,
    )

    print(f"Status: {response['data']}")
    print(f"Verified: {response['solution'].get('verified')}")
    print(f"Status Code: {response['solution'].get('statusCode')}")


async def captcha_solving_example(scrappey: Scrappey) -> None:
    """Captcha solving example."""
    print("\n=== Captcha Solving ===\n")

    response = await scrappey.get(
        "https://example.com",
        automaticallySolveCaptchas=True,
        alwaysLoad=["recaptcha", "hcaptcha", "turnstile"],
    )

    print(f"Status: {response['data']}")
    print("Captcha solved automatically if present")


async def data_extraction_example(scrappey: Scrappey) -> None:
    """Data extraction example."""
    print("\n=== Data Extraction ===\n")

    response = await scrappey.get(
        "https://example.com",
        cssSelector="h1",
        innerText=True,
        includeLinks=True,
        includeImages=True,
    )

    print(f"Status: {response['data']}")
    inner_text = response["solution"].get("innerText", "")
    print(f"Inner text: {inner_text[:200]}...")


async def screenshot_example(scrappey: Scrappey) -> None:
    """Screenshot capture example."""
    print("\n=== Screenshot Capture ===\n")

    response = await scrappey.get(
        "https://example.com",
        screenshot=True,
        screenshotWidth=1920,
        screenshotHeight=1080,
    )

    print(f"Status: {response['data']}")
    screenshot = response["solution"].get("screenshot")
    print(f"Screenshot captured: {bool(screenshot)}")
    if screenshot:
        print(f"Screenshot size: {len(screenshot)} bytes (base64)")


async def complex_workflow_example(scrappey: Scrappey) -> None:
    """Complex workflow with conditional actions."""
    print("\n=== Complex Workflow ===\n")

    response = await scrappey.get(
        "https://example.com",
        browserActions=[
            {"type": "wait_for_load_state", "waitForLoadState": "networkidle"},
            {
                "type": "if",
                "condition": "document.querySelector('h1') !== null",
                "then": [
                    {
                        "type": "execute_js",
                        "code": "document.querySelector('h1').textContent",
                    }
                ],
                "or": [{"type": "execute_js", "code": "'No heading found'"}],
            },
            {
                "type": "while",
                "condition": "document.querySelector('.load-more') !== null",
                "then": [
                    {"type": "click", "cssSelector": ".load-more"},
                    {"type": "wait", "wait": 1000},
                ],
                "maxAttempts": 5,
            },
        ],
    )

    print(f"Status: {response['data']}")
    print(f"JavaScript results: {response['solution'].get('javascriptReturn')}")


async def main() -> None:
    """Main execution."""
    scrappey = Scrappey(API_KEY)

    try:
        await basic_get_example(scrappey)
        await post_example(scrappey)
        await session_example(scrappey)
        await browser_actions_example(scrappey)
        await data_extraction_example(scrappey)
        await screenshot_example(scrappey)
        await complex_workflow_example(scrappey)

        # Uncomment to test antibot bypass (may use more credits)
        # await cloudflare_bypass_example(scrappey)
        # await captcha_solving_example(scrappey)

        print("\n✓ All examples completed successfully!\n")

    except httpx.HTTPStatusError as e:
        print(f"HTTP Error: {e.response.status_code}")
        print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"Error: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
