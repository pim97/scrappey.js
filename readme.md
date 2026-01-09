# Scrappey - Web Scraping API Wrapper

The official Node.js wrapper for the [Scrappey](https://scrappey.com) web scraping API. Bypass Cloudflare, Datadome, PerimeterX, and other antibot protections. Solve captchas automatically.

[![npm version](https://badge.fury.io/js/%40scrappey%2Fapi.svg)](https://www.npmjs.com/package/@scrappey/api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Antibot Bypass**: Cloudflare, Datadome, PerimeterX, Kasada, Akamai, and more
- **Captcha Solving**: reCAPTCHA, hCaptcha, Turnstile, FunCaptcha automatic solving
- **Browser Automation**: Full browser actions (click, type, scroll, execute JS)
- **Session Management**: Persistent sessions with cookie and state management
- **All HTTP Methods**: GET, POST, PUT, DELETE, PATCH support
- **Proxy Support**: Built-in residential proxies with country selection
- **Screenshots & Video**: Capture screenshots and record browser sessions
- **TypeScript Support**: Full TypeScript declarations included

## Installation

```bash
npm install @scrappey/api
```

## Quick Start

```javascript
const Scrappey = require('@scrappey/api');

const scrappey = new Scrappey('YOUR_API_KEY');

// Basic GET request
const response = await scrappey.get({
    url: 'https://example.com'
});

console.log(response.solution.response); // HTML content
console.log(response.solution.statusCode); // 200
```

## Drop-in Replacement for Axios/Fetch

**New in v2.0.0**: Use Scrappey as a drop-in replacement for axios or fetch! Simply change your import and all requests automatically go through Scrappey with antibot bypass, captcha solving, and proxy support.

### Axios Drop-in

Replace axios with Scrappey - just change the import:

```javascript
// Before
import axios from 'axios';
const response = await axios.get('https://example.com');

// After - just change the import!
import axios from '@scrappey/api/axios';
axios.defaults.apiKey = 'YOUR_API_KEY';
const response = await axios.get('https://example.com');
// Automatically bypasses Cloudflare, solves captchas, etc.
```

**All axios methods work:**
```javascript
import axios from '@scrappey/api/axios';

axios.defaults.apiKey = 'YOUR_API_KEY';

// GET request
const response = await axios.get('https://example.com', {
    headers: { 'Authorization': 'Bearer token' },
    params: { page: 1 }
});

// POST request
const response = await axios.post('https://api.example.com/submit', {
    name: 'John',
    email: 'john@example.com'
}, {
    headers: { 'Content-Type': 'application/json' }
});

// All standard axios options work
const response = await axios.get('https://example.com', {
    timeout: 5000,
    proxy: 'http://proxy:port',
    cookies: 'session=abc123',
    responseType: 'json'
});

// Scrappey-specific options also work
const response = await axios.get('https://protected-site.com', {
    cloudflareBypass: true,
    premiumProxy: true,
    automaticallySolveCaptchas: true
});
```

**Response format matches axios:**
```javascript
const response = await axios.get('https://example.com');
console.log(response.data);        // Response body
console.log(response.status);       // HTTP status code
console.log(response.statusText);   // Status text
console.log(response.headers);      // Response headers
console.log(response.scrappey);     // Additional Scrappey data (verified, cookies, etc.)
```

### Fetch Drop-in

Replace fetch with Scrappey:

```javascript
// Before
const response = await fetch('https://example.com');
const data = await response.json();

// After
import fetch from '@scrappey/api/fetch';
fetch.configure({ apiKey: 'YOUR_API_KEY' });

const response = await fetch('https://example.com', {
    cloudflareBypass: true
});
const data = await response.json();
```

**All fetch methods work:**
```javascript
import fetch from '@scrappey/api/fetch';

fetch.configure({ apiKey: 'YOUR_API_KEY' });

// GET request
const response = await fetch('https://example.com', {
    headers: { 'Authorization': 'Bearer token' }
});

// POST request
const response = await fetch('https://api.example.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John', email: 'john@example.com' })
});

// Response methods
const text = await response.text();
const json = await response.json();
const blob = await response.blob();
const arrayBuffer = await response.arrayBuffer();
```

### Migration Guide

**From Axios:**
1. Change import: `import axios from 'axios'` → `import axios from 'scrappey-wrapper/axios'`
2. Set API key: `axios.defaults.apiKey = 'YOUR_API_KEY'`
3. That's it! All your existing code works the same.

**From Fetch:**
1. Change import: `import fetch from 'node-fetch'` → `import fetch from 'scrappey-wrapper/fetch'`
2. Configure: `fetch.configure({ apiKey: 'YOUR_API_KEY' })`
3. All fetch calls now use Scrappey automatically.

### Configuration

**Axios:**
```javascript
import axios from '@scrappey/api/axios';

// Set defaults
axios.defaults.apiKey = 'YOUR_API_KEY';
axios.defaults.cloudflareBypass = true;
axios.defaults.premiumProxy = true;
axios.defaults.timeout = 60000;

// Or create custom instance
const scrappeyAxios = axios.create({
    apiKey: 'YOUR_API_KEY',
    cloudflareBypass: true,
    premiumProxy: true
});
```

**Fetch:**
```javascript
import fetch from '@scrappey/api/fetch';

// Configure globally
fetch.configure({
    apiKey: 'YOUR_API_KEY',
    cloudflareBypass: true,
    premiumProxy: true,
    timeout: 60000
});
```

### Supported Options

All standard axios/fetch options are supported:
- `headers` → `customHeaders`
- `data` / `body` → `postData`
- `params` → URL query string
- `timeout` → `timeout`
- `proxy` → `proxy`
- `cookies` → `cookies` or `cookiejar`
- `responseType: 'json'` → Uses `innerText` for JSON

Plus all Scrappey-specific options:
- `cloudflareBypass`, `datadomeBypass`, `kasadaBypass`
- `automaticallySolveCaptchas`, `alwaysLoad`
- `browserActions`, `screenshot`, `video`
- `session`, `premiumProxy`, `proxyCountry`
- And many more!

### Session Management

Both adapters support Scrappey session management:

```javascript
// Axios
import axios from '@scrappey/api/axios';
axios.defaults.apiKey = 'YOUR_API_KEY';

const session = await axios.createSession();
const sessionId = session.session;

await axios.get('https://example.com', { session: sessionId });
await axios.destroySession(sessionId);

// Fetch
import fetch from '@scrappey/api/fetch';
fetch.configure({ apiKey: 'YOUR_API_KEY' });

const session = await fetch.createSession();
const sessionId = session.session;

await fetch('https://example.com', { session: sessionId });
await fetch.destroySession(sessionId);
```

## API Reference

### Constructor

```javascript
const scrappey = new Scrappey(apiKey, options);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `apiKey` | `string` | Your Scrappey API key (required) |
| `options.baseUrl` | `string` | Custom API base URL (optional) |
| `options.timeout` | `number` | Default timeout in ms (default: 300000) |

### HTTP Methods

#### GET Request

```javascript
const response = await scrappey.get({
    url: 'https://example.com',
    session: 'optional-session-id',
    // ... other options
});
```

#### POST Request

```javascript
const response = await scrappey.post({
    url: 'https://api.example.com/submit',
    postData: {
        name: 'John Doe',
        email: 'john@example.com'
    },
    customHeaders: {
        'content-type': 'application/json'
    }
});
```

#### PUT, DELETE, PATCH

```javascript
await scrappey.put({ url, postData, ...options });
await scrappey.delete({ url, ...options });
await scrappey.patch({ url, postData, ...options });
```

### Session Management

```javascript
// Create a session
const session = await scrappey.createSession({
    proxyCountry: 'UnitedStates',
    // proxy: 'http://user:pass@ip:port'
});
const sessionId = session.session;

// Use the session
await scrappey.get({
    url: 'https://example.com',
    session: sessionId
});

// Check if session is active
const status = await scrappey.isSessionActive(sessionId);

// List all sessions
const sessions = await scrappey.listSessions(userId);

// Destroy session when done
await scrappey.destroySession(sessionId);
```

### Browser Actions

Execute browser automation actions:

```javascript
const response = await scrappey.get({
    url: 'https://example.com/login',
    browserActions: [
        {
            type: 'wait_for_selector',
            cssSelector: '#login-form'
        },
        {
            type: 'type',
            cssSelector: '#username',
            text: 'myuser'
        },
        {
            type: 'type',
            cssSelector: '#password',
            text: 'mypassword'
        },
        {
            type: 'click',
            cssSelector: '#submit',
            waitForSelector: '.dashboard'
        },
        {
            type: 'execute_js',
            code: 'document.querySelector(".user-info").innerText'
        }
    ]
});

// Access JS execution results
console.log(response.solution.javascriptReturn[0]);
```

#### Available Actions

| Action | Description |
|--------|-------------|
| `click` | Click on an element |
| `type` | Type text into an input |
| `goto` | Navigate to a URL |
| `wait` | Wait for milliseconds |
| `wait_for_selector` | Wait for element to appear |
| `wait_for_function` | Wait for JS condition |
| `wait_for_load_state` | Wait for page load state |
| `wait_for_cookie` | Wait for cookie to be set |
| `execute_js` | Execute JavaScript |
| `scroll` | Scroll to element or bottom |
| `hover` | Hover over element |
| `keyboard` | Press keyboard keys |
| `dropdown` | Select dropdown option |
| `switch_iframe` | Switch to iframe context |
| `set_viewport` | Set viewport size |
| `if` | Conditional actions |
| `while` | Loop actions |
| `solve_captcha` | Solve captcha |

### Antibot Bypass

```javascript
const response = await scrappey.get({
    url: 'https://protected-site.com',
    datadomeBypass: true,
    kasadaBypass: true,
    premiumProxy: true,
    proxyCountry: 'UnitedStates'
});
```

### Captcha Solving

```javascript
// Automatic captcha solving
const response = await scrappey.get({
    url: 'https://example.com',
    automaticallySolveCaptchas: true,
    alwaysLoad: ['recaptcha', 'hcaptcha', 'turnstile']
});

// Manual captcha solving with browser action
const response = await scrappey.get({
    url: 'https://example.com',
    browserActions: [
        {
            type: 'solve_captcha',
            captcha: 'turnstile',
            captchaData: {
                sitekey: '0x4AAAAAAA...',
                cssSelector: '.cf-turnstile'
            }
        }
    ]
});
```

### Screenshots & Video

```javascript
const response = await scrappey.get({
    url: 'https://example.com',
    screenshot: true,
    screenshotWidth: 1920,
    screenshotHeight: 1080,
    video: true
});

// Base64 screenshot
const screenshot = response.solution.screenshot;

// Video URL
const videoUrl = response.solution.videoUrl;
```

### Data Extraction

```javascript
const response = await scrappey.get({
    url: 'https://example.com',
    cssSelector: '.product-title',
    innerText: true,
    includeLinks: true,
    includeImages: true,
    regex: 'price: \\$([0-9.]+)'
});
```

### Request Interception

```javascript
const response = await scrappey.get({
    url: 'https://example.com',
    interceptFetchRequest: '/api/data',
    abortOnDetection: ['analytics', 'tracking', 'ads'],
    whitelistedDomains: ['example.com', 'cdn.example.com'],
    blackListedDomains: ['ads.com']
});

// Intercepted data
console.log(response.solution.interceptFetchRequestResponse);
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | Target URL (required) |
| `session` | `string` | Session ID for session reuse |
| `proxy` | `string` | Proxy string (http://user:pass@ip:port) |
| `proxyCountry` | `string` | Proxy country (e.g., "UnitedStates") |
| `premiumProxy` | `boolean` | Use premium proxy pool |
| `mobileProxy` | `boolean` | Use mobile proxy pool |
| `postData` | `object/string` | POST/PUT/PATCH request data |
| `customHeaders` | `object` | Custom HTTP headers |
| `cookies` | `string` | Cookie string to set |
| `cookiejar` | `array` | Cookie jar array |
| `localStorage` | `object` | LocalStorage data to set |
| `browserActions` | `array` | Browser actions to execute |
| `cloudflareBypass` | `boolean` | Enable Cloudflare bypass |
| `datadomeBypass` | `boolean` | Enable Datadome bypass |
| `kasadaBypass` | `boolean` | Enable Kasada bypass |
| `automaticallySolveCaptchas` | `boolean` | Auto-solve captchas |
| `cssSelector` | `string` | Extract content by CSS selector |
| `innerText` | `boolean` | Include page text content |
| `includeLinks` | `boolean` | Include all page links |
| `includeImages` | `boolean` | Include all page images |
| `screenshot` | `boolean` | Capture screenshot |
| `video` | `boolean` | Record video |
| `pdf` | `boolean` | Generate PDF |
| `filter` | `array` | Filter response fields |
| `timeout` | `number` | Request timeout (ms) |

## Response Structure

```javascript
{
    solution: {
        verified: true,           // Request verification status
        response: '<html>...',    // HTML content
        statusCode: 200,          // HTTP status code
        currentUrl: 'https://...', // Final URL after redirects
        userAgent: 'Mozilla/5.0...', // User agent used
        cookies: [...],           // Array of cookies
        cookieString: '...',      // Cookie string
        responseHeaders: {...},   // Response headers
        innerText: '...',         // Page text content
        screenshot: 'base64...',  // Base64 screenshot
        screenshotUrl: 'https://...', // Screenshot URL
        videoUrl: 'https://...',  // Video URL
        javascriptReturn: [...],  // JS execution results
    },
    timeElapsed: 1234,           // Request time (ms)
    data: 'success',             // 'success' or 'error'
    session: 'session-id',       // Session ID
    error: '...',                // Error message (if failed)
}
```

## Error Handling

```javascript
try {
    const response = await scrappey.get({ url: 'https://example.com' });
    
    if (response.data === 'error') {
        console.error('Error:', response.error);
        // Handle specific error codes
        // See: https://wiki.scrappey.com/getting-started
    }
} catch (error) {
    // Network or request error
    console.error('Request failed:', error.message);
}
```

## Examples

Multi-language examples are available in the [examples](./examples) directory:

- **Node.js**: [examples/nodejs](./examples/nodejs)
- **TypeScript**: [examples/typescript](./examples/typescript)
- **Python**: [examples/python](./examples/python)
- **Go**: [examples/go](./examples/go)
- **C#**: [examples/csharp](./examples/csharp)
- **PHP**: [examples/php](./examples/php)
- **Java**: [examples/java](./examples/java)
- **Ruby**: [examples/ruby](./examples/ruby)
- **Rust**: [examples/rust](./examples/rust)
- **cURL**: [examples/curl](./examples/curl)

## TypeScript

Full TypeScript support is included:

```typescript
import Scrappey = require('scrappey-wrapper');

const scrappey = new Scrappey('API_KEY');

const response = await scrappey.get({
    url: 'https://example.com',
    browserActions: [
        {
            type: 'execute_js',
            code: 'document.title'
        }
    ]
});

// Fully typed response
console.log(response.solution.statusCode);
```

## Links

- **Website**: [https://scrappey.com](https://scrappey.com)
- **Documentation**: [https://wiki.scrappey.com](https://wiki.scrappey.com)
- **Request Builder**: [https://app.scrappey.com/#/builder](https://app.scrappey.com/#/builder)
- **GitHub**: [https://github.com/pim97/scrappey.js](https://github.com/pim97/scrappey.js)
- **NPM**: [https://www.npmjs.com/package/scrappey-wrapper](https://www.npmjs.com/package/scrappey-wrapper)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

Please ensure that your web scraping activities comply with the website's terms of service and legal regulations. Scrappey is not responsible for any misuse or unethical use of the library. Use it responsibly and respect the website's policies.
