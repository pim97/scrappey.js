/**
 * Scrappey - TypeScript Example
 *
 * This example demonstrates how to use the Scrappey API from TypeScript.
 *
 * Prerequisites:
 *   npm install @scrappey/api typescript ts-node @types/node
 *
 * Run:
 *   npx ts-node example.ts
 *
 * Get your API key at: https://scrappey.com
 */

import Scrappey = require('@scrappey/api');

const API_KEY: string = process.env.SCRAPPEY_API_KEY || 'YOUR_API_KEY_HERE';

const scrappey = new Scrappey(API_KEY);

/**
 * Basic GET request example
 */
async function basicGetExample(): Promise<void> {
    console.log('\n=== Basic GET Request ===\n');

    const response = await scrappey.get({
        url: 'https://httpbin.rs/get'
    });

    console.log('Status:', response.data);
    console.log('Status Code:', response.solution.statusCode);
    console.log('Session:', response.session);
}

/**
 * POST request with typed data
 */
async function postExample(): Promise<void> {
    console.log('\n=== POST Request ===\n');

    interface UserData {
        name: string;
        email: string;
        age: number;
    }

    const userData: UserData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
    };

    const response = await scrappey.post({
        url: 'https://httpbin.rs/post',
        postData: userData,
        customHeaders: {
            'content-type': 'application/json'
        }
    });

    console.log('Status:', response.data);
    console.log('Verified:', response.solution.verified);
}

/**
 * Session management with type safety
 */
async function sessionExample(): Promise<void> {
    console.log('\n=== Session Management ===\n');

    // Create session
    const createResponse = await scrappey.createSession({
        proxyCountry: 'UnitedStates'
    });

    const sessionId: string = createResponse.session;
    console.log('Created session:', sessionId);

    // Use session
    const getResponse = await scrappey.get({
        url: 'https://httpbin.rs/get',
        session: sessionId
    });
    console.log('Request status:', getResponse.data);

    // Check if session is active
    const activeResponse = await scrappey.isSessionActive(sessionId);
    console.log('Session active:', activeResponse.active);

    // Destroy session
    await scrappey.destroySession(sessionId);
    console.log('Session destroyed');
}

/**
 * Browser actions with full typing
 */
async function browserActionsExample(): Promise<void> {
    console.log('\n=== Browser Actions ===\n');

    const response = await scrappey.get({
        url: 'https://example.com',
        browserActions: [
            {
                type: 'wait_for_selector',
                cssSelector: 'h1',
                timeout: 10000
            },
            {
                type: 'execute_js',
                code: `({
                    title: document.title,
                    heading: document.querySelector('h1')?.textContent,
                    links: Array.from(document.links).map(l => l.href)
                })`
            },
            {
                type: 'scroll',
                cssSelector: 'body',
                repeat: 2,
                delayMs: 500
            }
        ]
    });

    console.log('Status:', response.data);
    
    if (response.solution.javascriptReturn) {
        const result = response.solution.javascriptReturn[0] as {
            title: string;
            heading: string;
            links: string[];
        };
        console.log('Title:', result.title);
        console.log('Heading:', result.heading);
        console.log('Links count:', result.links?.length);
    }
}

/**
 * Antibot bypass example
 */
async function antibotBypassExample(): Promise<void> {
    console.log('\n=== Antibot Bypass ===\n');

    const response = await scrappey.get({
        url: 'https://nowsecure.nl',
        cloudflareBypass: true,
        premiumProxy: true,
        proxyCountry: 'UnitedStates',
        automaticallySolveCaptchas: true,
        alwaysLoad: ['turnstile']
    });

    console.log('Status:', response.data);
    console.log('Verified:', response.solution.verified);
    console.log('Status Code:', response.solution.statusCode);
    
    if (response.solution.detectedAntibotProviders) {
        console.log('Detected providers:', response.solution.detectedAntibotProviders.providers);
    }
}

/**
 * Complex workflow with conditional actions
 */
async function complexWorkflowExample(): Promise<void> {
    console.log('\n=== Complex Workflow ===\n');

    const response = await scrappey.get({
        url: 'https://example.com',
        browserActions: [
            {
                type: 'wait_for_load_state',
                waitForLoadState: 'networkidle'
            },
            {
                type: 'execute_js',
                code: 'document.querySelectorAll("a").length'
            },
            {
                type: 'if',
                condition: 'document.querySelector("h1") !== null',
                then: [
                    {
                        type: 'execute_js',
                        code: 'document.querySelector("h1").textContent'
                    }
                ],
                or: [
                    {
                        type: 'execute_js',
                        code: '"No heading found"'
                    }
                ]
            }
        ],
        screenshot: true,
        screenshotWidth: 1920,
        screenshotHeight: 1080
    });

    console.log('Status:', response.data);
    console.log('JavaScript results:', response.solution.javascriptReturn);
    console.log('Screenshot captured:', !!response.solution.screenshot);
}

// Main execution
async function main(): Promise<void> {
    try {
        await basicGetExample();
        await postExample();
        await sessionExample();
        await browserActionsExample();
        await complexWorkflowExample();

        // Uncomment to test antibot bypass
        // await antibotBypassExample();

        console.log('\n✓ All examples completed successfully!\n');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

main();
