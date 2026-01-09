/**
 * Scrappey - Web Scraping API Wrapper
 * 
 * A comprehensive Node.js wrapper for the Scrappey web scraping API.
 * Supports all HTTP methods, session management, browser actions, 
 * antibot bypass, captcha solving, and more.
 * 
 * @see https://scrappey.com
 * @see https://wiki.scrappey.com
 */

const axios = require('axios').default;

/**
 * @typedef {Object} BrowserAction
 * @property {'click'|'type'|'goto'|'wait'|'wait_for_selector'|'wait_for_function'|'wait_for_load_state'|'wait_for_cookie'|'execute_js'|'scroll'|'hover'|'keyboard'|'dropdown'|'switch_iframe'|'set_viewport'|'if'|'while'|'solve_captcha'|'remove_iframes'} type - The action type
 * @property {string} [cssSelector] - CSS selector for the target element
 * @property {string} [text] - Text to type (for 'type' action)
 * @property {string} [url] - URL to navigate to (for 'goto' action)
 * @property {number} [wait] - Wait time in milliseconds after action
 * @property {string} [waitForSelector] - Wait for this selector after action
 * @property {string} [code] - JavaScript code to execute
 * @property {string} [condition] - JavaScript condition for 'if'/'while' actions
 * @property {BrowserAction[]} [then] - Actions to run if condition is true
 * @property {BrowserAction[]} [or] - Actions to run if condition is false
 * @property {number} [maxAttempts] - Maximum iterations for 'while' action
 * @property {'turnstile'|'recaptcha'|'recaptchav2'|'recaptchav3'|'hcaptcha'|'funcaptcha'|'perimeterx'|'mtcaptcha'|'custom'} [captcha] - Captcha type to solve
 * @property {Object} [captchaData] - Additional captcha solving data
 * @property {'beforeload'|'afterload'} [when] - When to execute the action
 * @property {boolean} [ignoreErrors] - Continue execution if action fails
 * @property {number} [timeout] - Timeout in milliseconds
 * @property {boolean} [direct] - Use direct action instead of cursor simulation
 */

/**
 * @typedef {Object} RequestOptions
 * @property {string} url - The target URL to scrape
 * @property {string} [session] - Session ID for session reuse
 * @property {string} [proxy] - Proxy string (http://user:pass@ip:port)
 * @property {string} [proxyCountry] - Request proxy from specific country
 * @property {boolean} [noProxy] - Disable proxy usage
 * @property {boolean} [premiumProxy] - Use premium proxy pool
 * @property {boolean} [mobileProxy] - Use mobile proxy pool
 * @property {Object} [postData] - Data to send with POST/PUT/PATCH requests
 * @property {Object} [customHeaders] - Custom HTTP headers
 * @property {string} [cookies] - Cookie string to set
 * @property {Array} [cookiejar] - Cookie jar array format
 * @property {Object} [localStorage] - LocalStorage data to set
 * @property {BrowserAction[]} [browserActions] - Array of browser actions to execute
 * @property {boolean} [cloudflareBypass] - Enable Cloudflare bypass
 * @property {boolean} [datadomeBypass] - Enable Datadome bypass
 * @property {boolean} [kasadaBypass] - Enable Kasada bypass
 * @property {boolean} [disableAntiBot] - Disable automatic antibot detection
 * @property {boolean} [automaticallySolveCaptchas] - Auto-solve detected captchas
 * @property {string[]} [alwaysLoad] - Always load specific captcha types
 * @property {string} [cssSelector] - Extract content matching CSS selector
 * @property {boolean} [innerText] - Include inner text of elements
 * @property {boolean} [includeImages] - Include image URLs in response
 * @property {boolean} [includeLinks] - Include link URLs in response
 * @property {boolean} [screenshot] - Capture page screenshot
 * @property {number} [screenshotWidth] - Screenshot width in pixels
 * @property {number} [screenshotHeight] - Screenshot height in pixels
 * @property {boolean} [video] - Record browser session as video
 * @property {boolean} [pdf] - Generate PDF of page
 * @property {string[]} [filter] - Return only specified fields
 * @property {string|string[]} [interceptFetchRequest] - URL pattern(s) to intercept
 * @property {string[]} [abortOnDetection] - URL patterns to block
 * @property {string[]} [whitelistedDomains] - Only allow requests to these domains
 * @property {string[]} [blackListedDomains] - Block requests to these domains
 * @property {boolean} [fullPageLoad] - Wait for full page load
 * @property {boolean} [listAllRedirects] - Track and return all redirects
 * @property {boolean} [blockCookieBanners] - Block cookie consent banners
 * @property {boolean} [removeIframes] - Remove all iframes from page
 * @property {boolean} [mouseMovements] - Enable human-like mouse movements
 * @property {number} [timeout] - Request timeout in milliseconds
 * @property {number} [retries] - Number of retry attempts on failure
 * @property {Array} [browser] - Browser specification
 * @property {string} [userAgent] - Custom user agent string
 * @property {string[]} [locales] - Browser locale settings
 */

/**
 * @typedef {Object} SessionOptions
 * @property {string} [session] - Custom session ID
 * @property {string} [proxy] - Proxy string
 * @property {string} [proxyCountry] - Proxy country
 * @property {boolean} [premiumProxy] - Use premium proxy
 * @property {boolean} [mobileProxy] - Use mobile proxy
 * @property {Array} [browser] - Browser specification
 * @property {string} [userAgent] - Custom user agent
 * @property {string[]} [locales] - Browser locale settings
 */

/**
 * @typedef {Object} ScrappeyResponse
 * @property {Object} solution - Response data
 * @property {boolean} solution.verified - Request verification status
 * @property {string} [solution.response] - HTML content of the page
 * @property {number} [solution.statusCode] - HTTP status code
 * @property {string} [solution.currentUrl] - Final URL after redirects
 * @property {string} [solution.userAgent] - User agent used
 * @property {Array} [solution.cookies] - Array of cookie objects
 * @property {string} [solution.cookieString] - Cookies as string
 * @property {Object} [solution.responseHeaders] - HTTP response headers
 * @property {string} [solution.innerText] - Text content of the page
 * @property {string} [solution.screenshot] - Base64 screenshot
 * @property {string} [solution.screenshotUrl] - Screenshot URL
 * @property {string} [solution.videoUrl] - Video recording URL
 * @property {Array} [solution.javascriptReturn] - JS execution results
 * @property {number} timeElapsed - Request time in milliseconds
 * @property {'success'|'error'} data - Request status
 * @property {string} session - Session ID
 * @property {string} [error] - Error message if failed
 * @property {Object} [fingerprint] - Browser fingerprint (on session create)
 */

class Scrappey {
    /**
     * Creates a new Scrappey instance
     * @param {string} apiKey - Your Scrappey API key
     * @param {Object} [options] - Configuration options
     * @param {string} [options.baseUrl] - Custom API base URL
     * @param {number} [options.timeout] - Default request timeout (ms)
     */
    constructor(apiKey, options = {}) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        
        this.apiKey = apiKey;
        this.baseUrl = options.baseUrl || 'https://publisher.scrappey.com/api/v1';
        this.timeout = options.timeout || 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Sends a request to the Scrappey API
     * @param {Object} data - Request data with cmd and other options
     * @returns {Promise<ScrappeyResponse>}
     */
    async request(data) {
        const { cmd, ...options } = data;
        
        if (!cmd) {
            throw new Error('Command (cmd) is required');
        }

        const url = `${this.baseUrl}?key=${this.apiKey}`;

        const response = await axios({
            url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                cmd,
                ...options
            },
            timeout: options.timeout || this.timeout
        });

        return response.data;
    }

    // ============================================
    // HTTP Request Methods
    // ============================================

    /**
     * Sends a GET request
     * @param {RequestOptions} options - Request options
     * @returns {Promise<ScrappeyResponse>}
     */
    async get(options) {
        return this.request({
            cmd: 'request.get',
            ...options
        });
    }

    /**
     * Sends a POST request
     * @param {RequestOptions} options - Request options
     * @returns {Promise<ScrappeyResponse>}
     */
    async post(options) {
        return this.request({
            cmd: 'request.post',
            ...options
        });
    }

    /**
     * Sends a PUT request
     * @param {RequestOptions} options - Request options
     * @returns {Promise<ScrappeyResponse>}
     */
    async put(options) {
        return this.request({
            cmd: 'request.put',
            ...options
        });
    }

    /**
     * Sends a DELETE request
     * @param {RequestOptions} options - Request options
     * @returns {Promise<ScrappeyResponse>}
     */
    async delete(options) {
        return this.request({
            cmd: 'request.delete',
            ...options
        });
    }

    /**
     * Sends a PATCH request
     * @param {RequestOptions} options - Request options
     * @returns {Promise<ScrappeyResponse>}
     */
    async patch(options) {
        return this.request({
            cmd: 'request.patch',
            ...options
        });
    }

    // ============================================
    // Session Management
    // ============================================

    /**
     * Creates a new browser session
     * @param {SessionOptions} [options] - Session options
     * @returns {Promise<ScrappeyResponse>}
     */
    async createSession(options = {}) {
        return this.request({
            cmd: 'sessions.create',
            ...options
        });
    }

    /**
     * Destroys an existing session
     * @param {string} session - Session ID to destroy
     * @returns {Promise<ScrappeyResponse>}
     */
    async destroySession(session) {
        return this.request({
            cmd: 'sessions.destroy',
            session
        });
    }

    /**
     * Lists all active sessions for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Session list with count
     */
    async listSessions(userId) {
        return this.request({
            cmd: 'sessions.list',
            userId
        });
    }

    /**
     * Checks if a session is currently active
     * @param {string} session - Session ID to check
     * @returns {Promise<{active: boolean}>}
     */
    async isSessionActive(session) {
        return this.request({
            cmd: 'sessions.active',
            session
        });
    }

    // ============================================
    // WebSocket Connections
    // ============================================

    /**
     * Creates a WebSocket-based browser connection
     * @param {Object} options - WebSocket options
     * @param {number} options.userId - User ID
     * @param {string} [options.proxy] - Proxy string
     * @param {number} [options.session_ttl] - Session TTL in seconds
     * @param {string} [options.headless] - Run headless ('true'/'false')
     * @returns {Promise<ScrappeyResponse>}
     */
    async createWebSocket(options) {
        return this.request({
            cmd: 'websocket.create',
            ...options
        });
    }
}

module.exports = Scrappey;
