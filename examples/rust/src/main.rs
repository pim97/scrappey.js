//! Scrappey - Rust Example
//!
//! This example demonstrates how to use the Scrappey API from Rust.
//!
//! Prerequisites:
//!   cargo build
//!
//! Run:
//!   cargo run
//!
//! Get your API key at: https://scrappey.com

use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;
use std::time::Duration;

const BASE_URL: &str = "https://publisher.scrappey.com/api/v1";

fn get_api_key() -> String {
    env::var("SCRAPPEY_API_KEY").unwrap_or_else(|_| "YOUR_API_KEY_HERE".to_string())
}

#[derive(Debug, Deserialize)]
struct Solution {
    verified: Option<bool>,
    response: Option<String>,
    #[serde(rename = "statusCode")]
    status_code: Option<i32>,
    #[serde(rename = "currentUrl")]
    current_url: Option<String>,
    #[serde(rename = "userAgent")]
    user_agent: Option<String>,
    #[serde(rename = "innerText")]
    inner_text: Option<String>,
    screenshot: Option<String>,
    #[serde(rename = "javascriptReturn")]
    javascript_return: Option<Vec<Value>>,
}

#[derive(Debug, Deserialize)]
struct ScrappeyResponse {
    solution: Solution,
    #[serde(rename = "timeElapsed")]
    time_elapsed: Option<i64>,
    data: String,
    session: String,
    error: Option<String>,
}

struct Scrappey {
    api_key: String,
    base_url: String,
    client: Client,
}

impl Scrappey {
    fn new(api_key: String) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(300))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            api_key,
            base_url: BASE_URL.to_string(),
            client,
        }
    }

    async fn request(&self, data: Value) -> Result<ScrappeyResponse, Box<dyn std::error::Error>> {
        let url = format!("{}?key={}", self.base_url, self.api_key);

        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&data)
            .send()
            .await?;

        let result: ScrappeyResponse = response.json().await?;
        Ok(result)
    }

    async fn get(
        &self,
        url: &str,
        options: Option<Value>,
    ) -> Result<ScrappeyResponse, Box<dyn std::error::Error>> {
        let mut data = json!({
            "cmd": "request.get",
            "url": url
        });

        if let Some(opts) = options {
            if let Value::Object(opts_map) = opts {
                if let Value::Object(ref mut data_map) = data {
                    for (k, v) in opts_map {
                        data_map.insert(k, v);
                    }
                }
            }
        }

        self.request(data).await
    }

    async fn post(
        &self,
        url: &str,
        post_data: Value,
        options: Option<Value>,
    ) -> Result<ScrappeyResponse, Box<dyn std::error::Error>> {
        let mut data = json!({
            "cmd": "request.post",
            "url": url,
            "postData": post_data
        });

        if let Some(opts) = options {
            if let Value::Object(opts_map) = opts {
                if let Value::Object(ref mut data_map) = data {
                    for (k, v) in opts_map {
                        data_map.insert(k, v);
                    }
                }
            }
        }

        self.request(data).await
    }

    async fn create_session(
        &self,
        options: Option<Value>,
    ) -> Result<ScrappeyResponse, Box<dyn std::error::Error>> {
        let mut data = json!({
            "cmd": "sessions.create"
        });

        if let Some(opts) = options {
            if let Value::Object(opts_map) = opts {
                if let Value::Object(ref mut data_map) = data {
                    for (k, v) in opts_map {
                        data_map.insert(k, v);
                    }
                }
            }
        }

        self.request(data).await
    }

    async fn destroy_session(
        &self,
        session: &str,
    ) -> Result<ScrappeyResponse, Box<dyn std::error::Error>> {
        self.request(json!({
            "cmd": "sessions.destroy",
            "session": session
        }))
        .await
    }
}

async fn basic_get_example(scrappey: &Scrappey) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n=== Basic GET Request ===\n");

    let response = scrappey.get("https://httpbin.rs/get", None).await?;

    println!("Status: {}", response.data);
    println!(
        "Status Code: {}",
        response.solution.status_code.unwrap_or(0)
    );
    println!("Session: {}", response.session);

    Ok(())
}

async fn post_example(scrappey: &Scrappey) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n=== POST Request ===\n");

    let post_data = json!({
        "name": "John Doe",
        "email": "john@example.com"
    });

    let options = json!({
        "customHeaders": {
            "content-type": "application/json"
        }
    });

    let response = scrappey
        .post("https://httpbin.rs/post", post_data, Some(options))
        .await?;

    println!("Status: {}", response.data);
    println!(
        "Verified: {}",
        response.solution.verified.unwrap_or(false)
    );

    Ok(())
}

async fn session_example(scrappey: &Scrappey) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n=== Session Management ===\n");

    // Create session
    let session_response = scrappey.create_session(None).await?;
    let session_id = &session_response.session;
    println!("Created session: {}", session_id);

    // Use session
    let options = json!({ "session": session_id });
    let response1 = scrappey
        .get("https://httpbin.rs/cookies/set/token/abc123", Some(options.clone()))
        .await?;
    println!("Set cookie, status: {}", response1.data);

    // Get cookies
    let response2 = scrappey
        .get("https://httpbin.rs/cookies", Some(options))
        .await?;
    let inner_text = response2.solution.inner_text.unwrap_or_default();
    let truncated = if inner_text.len() > 100 {
        format!("{}...", &inner_text[..100])
    } else {
        inner_text
    };
    println!("Cookies: {}", truncated);

    // Destroy session
    scrappey.destroy_session(session_id).await?;
    println!("Session destroyed");

    Ok(())
}

async fn browser_actions_example(scrappey: &Scrappey) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n=== Browser Actions ===\n");

    let options = json!({
        "browserActions": [
            {
                "type": "wait_for_selector",
                "cssSelector": "h1"
            },
            {
                "type": "execute_js",
                "code": "document.querySelector('h1').innerText"
            },
            {
                "type": "execute_js",
                "code": "document.title"
            }
        ]
    });

    let response = scrappey
        .get("https://example.com", Some(options))
        .await?;

    println!("Status: {}", response.data);

    if let Some(js_return) = &response.solution.javascript_return {
        if !js_return.is_empty() {
            println!("Heading: {}", js_return[0]);
        }
        if js_return.len() > 1 {
            println!("Title: {}", js_return[1]);
        }
    }

    Ok(())
}

async fn cloudflare_bypass_example(scrappey: &Scrappey) -> Result<(), Box<dyn std::error::Error>> {
    println!("\n=== Cloudflare Bypass ===\n");

    let options = json!({
        "cloudflareBypass": true,
        "premiumProxy": true
    });

    let response = scrappey.get("https://nowsecure.nl", Some(options)).await?;

    println!("Status: {}", response.data);
    println!(
        "Verified: {}",
        response.solution.verified.unwrap_or(false)
    );
    println!(
        "Status Code: {}",
        response.solution.status_code.unwrap_or(0)
    );

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let api_key = get_api_key();
    let scrappey = Scrappey::new(api_key);

    basic_get_example(&scrappey).await?;
    post_example(&scrappey).await?;
    session_example(&scrappey).await?;
    browser_actions_example(&scrappey).await?;

    // Uncomment to test Cloudflare bypass
    // cloudflare_bypass_example(&scrappey).await?;

    println!("\n✓ All examples completed successfully!\n");

    Ok(())
}
