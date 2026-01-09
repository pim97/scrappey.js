/**
 * Scrappey - Java Example
 *
 * This example demonstrates how to use the Scrappey API from Java.
 *
 * Prerequisites:
 *   Java 11+
 *   Add Gson to pom.xml (see pom.xml in this directory)
 *
 * Run:
 *   mvn compile exec:java
 *
 * Get your API key at: https://scrappey.com
 */

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class Example {

    private static final String API_KEY = System.getenv("SCRAPPEY_API_KEY") != null 
        ? System.getenv("SCRAPPEY_API_KEY") 
        : "YOUR_API_KEY_HERE";
    
    private static final String BASE_URL = "https://publisher.scrappey.com/api/v1";
    private static final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofMinutes(5))
        .build();
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public static void main(String[] args) {
        try {
            basicGetExample();
            postExample();
            sessionExample();
            browserActionsExample();
            
            // Uncomment to test Cloudflare bypass
            // cloudflareBypassExample();
            
            System.out.println("\n✓ All examples completed successfully!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    @SuppressWarnings("unchecked")
    static Map<String, Object> request(Map<String, Object> data) throws Exception {
        String json = gson.toJson(data);
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "?key=" + API_KEY))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .timeout(Duration.ofMinutes(5))
            .build();
        
        HttpResponse<String> response = httpClient.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() >= 400) {
            throw new RuntimeException("HTTP error: " + response.statusCode());
        }
        
        return gson.fromJson(response.body(), Map.class);
    }

    static Map<String, Object> get(String url, Map<String, Object> options) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("cmd", "request.get");
        data.put("url", url);
        if (options != null) {
            data.putAll(options);
        }
        return request(data);
    }

    static Map<String, Object> post(String url, Object postData, Map<String, Object> options) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("cmd", "request.post");
        data.put("url", url);
        data.put("postData", postData);
        if (options != null) {
            data.putAll(options);
        }
        return request(data);
    }

    static Map<String, Object> createSession(Map<String, Object> options) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("cmd", "sessions.create");
        if (options != null) {
            data.putAll(options);
        }
        return request(data);
    }

    static Map<String, Object> destroySession(String session) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("cmd", "sessions.destroy");
        data.put("session", session);
        return request(data);
    }

    @SuppressWarnings("unchecked")
    static void basicGetExample() throws Exception {
        System.out.println("\n=== Basic GET Request ===\n");

        Map<String, Object> response = get("https://httpbin.rs/get", null);
        
        System.out.println("Status: " + response.get("data"));
        Map<String, Object> solution = (Map<String, Object>) response.get("solution");
        System.out.println("Status Code: " + solution.get("statusCode"));
        System.out.println("Session: " + response.get("session"));
    }

    @SuppressWarnings("unchecked")
    static void postExample() throws Exception {
        System.out.println("\n=== POST Request ===\n");

        Map<String, String> postData = new HashMap<>();
        postData.put("name", "John Doe");
        postData.put("email", "john@example.com");
        
        Map<String, Object> options = new HashMap<>();
        Map<String, String> headers = new HashMap<>();
        headers.put("content-type", "application/json");
        options.put("customHeaders", headers);
        
        Map<String, Object> response = post("https://httpbin.rs/post", postData, options);
        
        System.out.println("Status: " + response.get("data"));
        Map<String, Object> solution = (Map<String, Object>) response.get("solution");
        System.out.println("Verified: " + solution.get("verified"));
    }

    @SuppressWarnings("unchecked")
    static void sessionExample() throws Exception {
        System.out.println("\n=== Session Management ===\n");

        // Create session
        Map<String, Object> sessionResponse = createSession(null);
        String sessionId = (String) sessionResponse.get("session");
        System.out.println("Created session: " + sessionId);

        // Use session
        Map<String, Object> options = new HashMap<>();
        options.put("session", sessionId);
        
        Map<String, Object> response1 = get("https://httpbin.rs/cookies/set/token/abc123", options);
        System.out.println("Set cookie, status: " + response1.get("data"));

        // Get cookies
        Map<String, Object> response2 = get("https://httpbin.rs/cookies", options);
        Map<String, Object> solution = (Map<String, Object>) response2.get("solution");
        String innerText = (String) solution.getOrDefault("innerText", "");
        System.out.println("Cookies: " + innerText.substring(0, Math.min(100, innerText.length())) + "...");

        // Destroy session
        destroySession(sessionId);
        System.out.println("Session destroyed");
    }

    @SuppressWarnings("unchecked")
    static void browserActionsExample() throws Exception {
        System.out.println("\n=== Browser Actions ===\n");

        List<Map<String, Object>> browserActions = List.of(
            Map.of(
                "type", "wait_for_selector",
                "cssSelector", "h1"
            ),
            Map.of(
                "type", "execute_js",
                "code", "document.querySelector('h1').innerText"
            ),
            Map.of(
                "type", "execute_js",
                "code", "document.title"
            )
        );

        Map<String, Object> options = new HashMap<>();
        options.put("browserActions", browserActions);
        
        Map<String, Object> response = get("https://example.com", options);
        
        System.out.println("Status: " + response.get("data"));
        
        Map<String, Object> solution = (Map<String, Object>) response.get("solution");
        List<Object> jsReturn = (List<Object>) solution.get("javascriptReturn");
        if (jsReturn != null && !jsReturn.isEmpty()) {
            System.out.println("Heading: " + jsReturn.get(0));
            if (jsReturn.size() > 1) {
                System.out.println("Title: " + jsReturn.get(1));
            }
        }
    }

    @SuppressWarnings("unchecked")
    static void cloudflareBypassExample() throws Exception {
        System.out.println("\n=== Cloudflare Bypass ===\n");

        Map<String, Object> options = new HashMap<>();
        options.put("cloudflareBypass", true);
        options.put("premiumProxy", true);
        
        Map<String, Object> response = get("https://nowsecure.nl", options);
        
        System.out.println("Status: " + response.get("data"));
        Map<String, Object> solution = (Map<String, Object>) response.get("solution");
        System.out.println("Verified: " + solution.get("verified"));
        System.out.println("Status Code: " + solution.get("statusCode"));
    }
}
