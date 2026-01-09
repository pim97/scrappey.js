/**
 * Scrappey - C# (.NET) Example
 *
 * This example demonstrates how to use the Scrappey API from C#.
 *
 * Prerequisites:
 *   dotnet new console
 *   (No additional packages required - uses built-in HttpClient)
 *
 * Run:
 *   dotnet run
 *
 * Get your API key at: https://scrappey.com
 */

using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Collections.Generic;

class Program
{
    private static readonly string ApiKey = Environment.GetEnvironmentVariable("SCRAPPEY_API_KEY") 
        ?? "YOUR_API_KEY_HERE";
    private static readonly string BaseUrl = "https://publisher.scrappey.com/api/v1";
    private static readonly HttpClient httpClient = new HttpClient { Timeout = TimeSpan.FromMinutes(5) };

    static async Task Main(string[] args)
    {
        try
        {
            await BasicGetExample();
            await PostExample();
            await SessionExample();
            await BrowserActionsExample();
            
            // Uncomment to test Cloudflare bypass
            // await CloudflareBypassExample();

            Console.WriteLine("\n✓ All examples completed successfully!\n");
        }
        catch (Exception e)
        {
            Console.Error.WriteLine($"Error: {e.Message}");
            Environment.Exit(1);
        }
    }

    static async Task<JsonDocument> Request(Dictionary<string, object> data)
    {
        var json = JsonSerializer.Serialize(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await httpClient.PostAsync($"{BaseUrl}?key={ApiKey}", content);
        response.EnsureSuccessStatusCode();
        
        var responseBody = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(responseBody);
    }

    static async Task<JsonDocument> Get(string url, Dictionary<string, object>? options = null)
    {
        var data = new Dictionary<string, object>
        {
            { "cmd", "request.get" },
            { "url", url }
        };
        
        if (options != null)
        {
            foreach (var kvp in options)
            {
                data[kvp.Key] = kvp.Value;
            }
        }
        
        return await Request(data);
    }

    static async Task<JsonDocument> Post(string url, object postData, Dictionary<string, object>? options = null)
    {
        var data = new Dictionary<string, object>
        {
            { "cmd", "request.post" },
            { "url", url },
            { "postData", postData }
        };
        
        if (options != null)
        {
            foreach (var kvp in options)
            {
                data[kvp.Key] = kvp.Value;
            }
        }
        
        return await Request(data);
    }

    static async Task<JsonDocument> CreateSession(Dictionary<string, object>? options = null)
    {
        var data = new Dictionary<string, object>
        {
            { "cmd", "sessions.create" }
        };
        
        if (options != null)
        {
            foreach (var kvp in options)
            {
                data[kvp.Key] = kvp.Value;
            }
        }
        
        return await Request(data);
    }

    static async Task<JsonDocument> DestroySession(string session)
    {
        return await Request(new Dictionary<string, object>
        {
            { "cmd", "sessions.destroy" },
            { "session", session }
        });
    }

    static async Task BasicGetExample()
    {
        Console.WriteLine("\n=== Basic GET Request ===\n");

        using var response = await Get("https://httpbin.rs/get");
        var root = response.RootElement;

        Console.WriteLine($"Status: {root.GetProperty("data").GetString()}");
        Console.WriteLine($"Status Code: {root.GetProperty("solution").GetProperty("statusCode").GetInt32()}");
        Console.WriteLine($"Session: {root.GetProperty("session").GetString()}");
    }

    static async Task PostExample()
    {
        Console.WriteLine("\n=== POST Request ===\n");

        var postData = new Dictionary<string, string>
        {
            { "name", "John Doe" },
            { "email", "john@example.com" }
        };

        using var response = await Post("https://httpbin.rs/post", postData, new Dictionary<string, object>
        {
            { "customHeaders", new Dictionary<string, string> { { "content-type", "application/json" } } }
        });
        
        var root = response.RootElement;
        Console.WriteLine($"Status: {root.GetProperty("data").GetString()}");
        Console.WriteLine($"Verified: {root.GetProperty("solution").GetProperty("verified").GetBoolean()}");
    }

    static async Task SessionExample()
    {
        Console.WriteLine("\n=== Session Management ===\n");

        // Create session
        using var sessionResponse = await CreateSession();
        var sessionId = sessionResponse.RootElement.GetProperty("session").GetString();
        Console.WriteLine($"Created session: {sessionId}");

        // Use session
        using var response1 = await Get("https://httpbin.rs/cookies/set/token/abc123", new Dictionary<string, object>
        {
            { "session", sessionId! }
        });
        Console.WriteLine($"Set cookie, status: {response1.RootElement.GetProperty("data").GetString()}");

        // Get cookies
        using var response2 = await Get("https://httpbin.rs/cookies", new Dictionary<string, object>
        {
            { "session", sessionId! }
        });
        var innerText = response2.RootElement.GetProperty("solution").GetProperty("innerText").GetString() ?? "";
        Console.WriteLine($"Cookies: {innerText[..Math.Min(100, innerText.Length)]}...");

        // Destroy session
        await DestroySession(sessionId!);
        Console.WriteLine("Session destroyed");
    }

    static async Task BrowserActionsExample()
    {
        Console.WriteLine("\n=== Browser Actions ===\n");

        var browserActions = new List<Dictionary<string, object>>
        {
            new Dictionary<string, object>
            {
                { "type", "wait_for_selector" },
                { "cssSelector", "h1" }
            },
            new Dictionary<string, object>
            {
                { "type", "execute_js" },
                { "code", "document.querySelector('h1').innerText" }
            },
            new Dictionary<string, object>
            {
                { "type", "execute_js" },
                { "code", "document.title" }
            }
        };

        using var response = await Get("https://example.com", new Dictionary<string, object>
        {
            { "browserActions", browserActions }
        });

        var root = response.RootElement;
        Console.WriteLine($"Status: {root.GetProperty("data").GetString()}");

        if (root.GetProperty("solution").TryGetProperty("javascriptReturn", out var jsReturn))
        {
            var results = jsReturn.EnumerateArray().ToArray();
            if (results.Length > 0)
                Console.WriteLine($"Heading: {results[0]}");
            if (results.Length > 1)
                Console.WriteLine($"Title: {results[1]}");
        }
    }

    static async Task CloudflareBypassExample()
    {
        Console.WriteLine("\n=== Cloudflare Bypass ===\n");

        using var response = await Get("https://nowsecure.nl", new Dictionary<string, object>
        {
            { "cloudflareBypass", true },
            { "premiumProxy", true }
        });

        var root = response.RootElement;
        Console.WriteLine($"Status: {root.GetProperty("data").GetString()}");
        Console.WriteLine($"Verified: {root.GetProperty("solution").GetProperty("verified").GetBoolean()}");
        Console.WriteLine($"Status Code: {root.GetProperty("solution").GetProperty("statusCode").GetInt32()}");
    }
}
