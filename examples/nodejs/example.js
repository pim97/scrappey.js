/**
 * Scrappey - Node.js Example
 *
 * This example demonstrates how to use the Scrappey API from Node.js.
 *
 * Prerequisites:
 *   npm install scrappey
 *
 * Get your API key at: https://scrappey.com
 */

const Scrappey = require('scrappey');

const API_KEY = process.env.SCRAPPEY_API_KEY || 'YOUR_API_KEY_HERE';

const scrappey = new Scrappey(API_KEY);

/**
 * Basic GET request example
 */
async function basicGetExample() {
    console.log('\n=== Basic GET Request ===\n');

    const response = await scrappey.get({
        url: 'https://httpbin.rs/get'
    });

    console.log('Status:', response.data);
    console.log('Status Code:', response.solution.statusCode);
    console.log('Response:', response.solution.response?.substring(0, 200) + '...');
}

/**
 * POST request example
 */
async function postExample() {
    console.log('\n=== POST Request ===\n');

    const response = await scrappey.post({
        url: 'https://httpbin.rs/post',
        postData: {
            name: 'John Doe',
            email: 'john@example.com'
        },
        customHeaders: {
            'content-type': 'application/json'
        }
    });

    console.log('Status:', response.data);
    console.log('Response:', response.solution.innerText?.substring(0, 300) + '...');
}

/**
 * Session management example
 */
async function sessionExample() {
    console.log('\n=== Session Management ===\n');

    // Create a session
    const sessionResponse = await scrappey.createSession({
        // Optional: specify proxy country
        // proxyCountry: 'UnitedStates'
    });

    const sessionId = sessionResponse.session;
    console.log('Created session:', sessionId);

    // Use the session for requests (cookies persist)
    const response1 = await scrappey.get({
        url: 'https://httpbin.rs/cookies/set/session_token/abc123',
        session: sessionId
    });
    console.log('Set cookie, status:', response1.data);

    // Second request - cookies should persist
    const response2 = await scrappey.get({
        url: 'https://httpbin.rs/cookies',
        session: sessionId
    });
    console.log('Cookies:', response2.solution.innerText);

    // Destroy the session when done
    await scrappey.destroySession(sessionId);
    console.log('Session destroyed');
}

/**
 * Browser actions example
 */
async function browserActionsExample() {
    console.log('\n=== Browser Actions ===\n');

    const response = await scrappey.get({
        url: 'https://example.com',
        browserActions: [
            {
                type: 'wait_for_selector',
                cssSelector: 'h1'
            },
            {
                type: 'execute_js',
                code: 'document.querySelector("h1").innerText'
            },
            {
                type: 'screenshot'
            }
        ],
        screenshot: true
    });

    console.log('Status:', response.data);
    console.log('JavaScript result:', response.solution.javascriptReturn?.[0]);
    console.log('Screenshot captured:', !!response.solution.screenshot);
}

/**
 * Cloudflare bypass example
 */
async function cloudflareBypassExample() {
    console.log('\n=== Cloudflare Bypass ===\n');

    const response = await scrappey.get({
        url: 'https://nowsecure.nl',
        cloudflareBypass: true,
        // Premium proxy for better success rate
        premiumProxy: true
    });

    console.log('Status:', response.data);
    console.log('Verified:', response.solution.verified);
    console.log('Status Code:', response.solution.statusCode);
}

/**
 * Captcha solving example
 */
async function captchaSolvingExample() {
    console.log('\n=== Captcha Solving ===\n');

    const response = await scrappey.get({
        url: 'https://example.com',
        automaticallySolveCaptchas: true,
        alwaysLoad: ['recaptcha', 'hcaptcha', 'turnstile']
    });

    console.log('Status:', response.data);
    console.log('Captcha solved automatically if present');
}

/**
 * Data extraction example
 */
async function dataExtractionExample() {
    console.log('\n=== Data Extraction ===\n');

    const response = await scrappey.get({
        url: 'https://example.com',
        cssSelector: 'h1',
        innerText: true,
        includeLinks: true,
        includeImages: true
    });

    console.log('Status:', response.data);
    console.log('CSS Selector result:', response.solution.response);
    console.log('Inner text:', response.solution.innerText?.substring(0, 200));
}

/**
 * Request interception example
 */
async function interceptExample() {
    console.log('\n=== Request Interception ===\n');

    const response = await scrappey.get({
        url: 'https://httpbin.rs/get',
        interceptFetchRequest: '/get',
        abortOnDetection: [
            'analytics',
            'tracking',
            'ads'
        ]
    });

    console.log('Status:', response.data);
    console.log('Intercepted:', !!response.solution.interceptFetchRequestResponse);
}

// Main execution
async function main() {
    try {
        await basicGetExample();
        await postExample();
        await sessionExample();
        await browserActionsExample();
        await dataExtractionExample();

        // Uncomment to test antibot bypass (may use more credits)
        // await cloudflareBypassExample();
        // await captchaSolvingExample();
        // await interceptExample();

        console.log('\n✓ All examples completed successfully!\n');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response?.data) {
            console.error('API Error:', error.response.data);
        }
        process.exit(1);
    }
}

main();
