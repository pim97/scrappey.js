/**
 * Scrappey - Axios Drop-in Replacement Example
 *
 * This example shows how to use Scrappey as a drop-in replacement for axios.
 * Just change your import and all requests automatically go through Scrappey!
 */

// Instead of: const axios = require('axios');
const axios = require('@scrappey/api/axios');

const API_KEY = process.env.SCRAPPEY_API_KEY || 'YOUR_API_KEY_HERE';

// Configure once
axios.defaults.apiKey = API_KEY;
axios.defaults.cloudflareBypass = true; // Enable Cloudflare bypass globally
axios.defaults.premiumProxy = true;     // Use premium proxies

async function basicExample() {
    console.log('\n=== Basic Axios Usage ===\n');

    // Works exactly like axios!
    const response = await axios.get('https://httpbin.rs/get', {
        headers: {
            'User-Agent': 'MyApp/1.0'
        },
        params: {
            page: 1,
            limit: 10
        }
    });

    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Headers:', response.headers);
    
    // Additional Scrappey data
    console.log('Verified:', response.scrappey?.verified);
    console.log('Time Elapsed:', response.scrappey?.timeElapsed, 'ms');
}

async function postExample() {
    console.log('\n=== POST Request ===\n');

    const response = await axios.post('https://httpbin.rs/post', {
        name: 'John Doe',
        email: 'john@example.com'
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    console.log('Status:', response.status);
    console.log('Response:', response.data);
}

async function sessionExample() {
    console.log('\n=== Session Management ===\n');

    // Create a session
    const sessionResponse = await axios.createSession();
    const sessionId = sessionResponse.session;
    console.log('Created session:', sessionId);

    // Use session for requests (cookies persist)
    const response1 = await axios.get('https://httpbin.rs/cookies/set/token/abc123', {
        session: sessionId
    });
    console.log('Set cookie, status:', response1.status);

    // Second request - cookies persist
    const response2 = await axios.get('https://httpbin.rs/cookies', {
        session: sessionId
    });
    console.log('Cookies:', response2.data);

    // Destroy session
    await axios.destroySession(sessionId);
    console.log('Session destroyed');
}

async function cloudflareBypassExample() {
    console.log('\n=== Cloudflare Bypass ===\n');

    // Automatically bypasses Cloudflare!
    const response = await axios.get('https://nowsecure.nl', {
        cloudflareBypass: true,
        premiumProxy: true
    });

    console.log('Status:', response.status);
    console.log('Verified:', response.scrappey?.verified);
    console.log('Status Code:', response.status);
}

async function customInstanceExample() {
    console.log('\n=== Custom Axios Instance ===\n');

    // Create a custom instance with specific config
    const scrappeyAxios = axios.create({
        apiKey: API_KEY,
        cloudflareBypass: true,
        premiumProxy: true,
        proxyCountry: 'UnitedStates',
        automaticallySolveCaptchas: true,
        timeout: 60000
    });

    const response = await scrappeyAxios.get('https://example.com');
    console.log('Status:', response.status);
}

async function jsonResponseExample() {
    console.log('\n=== JSON Response ===\n');

    const response = await axios.get('https://httpbin.rs/json', {
        responseType: 'json' // Automatically parses JSON
    });

    console.log('Status:', response.status);
    console.log('Parsed JSON:', response.data);
}

// Main execution
async function main() {
    try {
        await basicExample();
        await postExample();
        await sessionExample();
        await jsonResponseExample();
        await customInstanceExample();

        // Uncomment to test Cloudflare bypass (may use more credits)
        // await cloudflareBypassExample();

        console.log('\n✓ All examples completed successfully!\n');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

main();
