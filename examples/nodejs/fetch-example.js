/**
 * Scrappey - Fetch Drop-in Replacement Example
 *
 * This example shows how to use Scrappey as a drop-in replacement for fetch.
 * Just change your import and all requests automatically go through Scrappey!
 */

// Instead of: const fetch = require('node-fetch');
const fetch = require('scrappey/fetch');

const API_KEY = process.env.SCRAPPEY_API_KEY || 'YOUR_API_KEY_HERE';

// Configure once
fetch.configure({
    apiKey: API_KEY,
    cloudflareBypass: true,  // Enable Cloudflare bypass globally
    premiumProxy: true        // Use premium proxies
});

async function basicExample() {
    console.log('\n=== Basic Fetch Usage ===\n');

    // Works exactly like fetch!
    const response = await fetch('https://httpbin.rs/get', {
        headers: {
            'User-Agent': 'MyApp/1.0'
        }
    });

    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Data:', data);
    
    // Additional Scrappey data
    console.log('Verified:', response.scrappey?.verified);
    console.log('Time Elapsed:', response.scrappey?.timeElapsed, 'ms');
}

async function postExample() {
    console.log('\n=== POST Request ===\n');

    const response = await fetch('https://httpbin.rs/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com'
        })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
}

async function sessionExample() {
    console.log('\n=== Session Management ===\n');

    // Create a session
    const sessionResponse = await fetch.createSession();
    const sessionId = sessionResponse.session;
    console.log('Created session:', sessionId);

    // Use session for requests (cookies persist)
    const response1 = await fetch('https://httpbin.rs/cookies/set/token/abc123', {
        session: sessionId
    });
    console.log('Set cookie, status:', response1.status);

    // Second request - cookies persist
    const response2 = await fetch('https://httpbin.rs/cookies', {
        session: sessionId
    });
    const cookies = await response2.text();
    console.log('Cookies:', cookies);

    // Destroy session
    await fetch.destroySession(sessionId);
    console.log('Session destroyed');
}

async function cloudflareBypassExample() {
    console.log('\n=== Cloudflare Bypass ===\n');

    // Automatically bypasses Cloudflare!
    const response = await fetch('https://nowsecure.nl', {
        cloudflareBypass: true,
        premiumProxy: true
    });

    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    console.log('Verified:', response.scrappey?.verified);
}

async function responseMethodsExample() {
    console.log('\n=== Response Methods ===\n');

    const response = await fetch('https://httpbin.rs/json');

    // All standard fetch response methods work
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    // Parse as JSON
    const json = await response.json();
    console.log('JSON:', json);

    // Or get as text
    // const text = await response.text();
    // console.log('Text:', text);
}

async function errorHandlingExample() {
    console.log('\n=== Error Handling ===\n');

    try {
        const response = await fetch('https://httpbin.rs/status/404');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Main execution
async function main() {
    try {
        await basicExample();
        await postExample();
        await sessionExample();
        await responseMethodsExample();
        await errorHandlingExample();

        // Uncomment to test Cloudflare bypass (may use more credits)
        // await cloudflareBypassExample();

        console.log('\n✓ All examples completed successfully!\n');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
