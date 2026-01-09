/**
 * Fetch-Compatible Adapter for Scrappey
 * 
 * Provides a drop-in replacement for fetch that uses Scrappey behind the scenes.
 * Simply change your import from 'node-fetch' or use 'scrappey-wrapper/fetch' and
 * all requests will automatically go through Scrappey with antibot bypass.
 */

const Scrappey = require('../scrappey');

/**
 * Maps fetch options to Scrappey options
 * @param {Object} options - Fetch options object
 * @returns {Object} Scrappey options
 */
function mapFetchOptionsToScrappey(options = {}) {
    const scrappeyOptions = {};

    // Headers mapping
    if (options.headers) {
        if (options.headers && typeof options.headers.forEach === 'function') {
            // Headers object (has forEach method)
            const headersObj = {};
            options.headers.forEach((value, key) => {
                headersObj[key] = value;
            });
            scrappeyOptions.customHeaders = headersObj;
        } else if (typeof options.headers === 'object') {
            scrappeyOptions.customHeaders = options.headers;
        }
    }

    // Body/data mapping
    if (options.body !== undefined) {
        if (typeof options.body === 'string') {
            scrappeyOptions.postData = options.body;
        } else if (options.body && typeof options.body.entries === 'function') {
            // FormData-like object (has entries method)
            const formDataString = Array.from(options.body.entries())
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            scrappeyOptions.postData = formDataString;
        } else if (typeof options.body === 'object') {
            scrappeyOptions.postData = JSON.stringify(options.body);
        } else {
            scrappeyOptions.postData = String(options.body);
        }
    }

    // Timeout
    if (options.timeout || options.signal) {
        scrappeyOptions.timeout = options.timeout || 300000;
    }

    // Proxy (if provided in options)
    if (options.proxy) {
        scrappeyOptions.proxy = typeof options.proxy === 'string' 
            ? options.proxy 
            : `${options.proxy.protocol || 'http'}://${options.proxy.auth ? `${options.proxy.auth.username}:${options.proxy.auth.password}@` : ''}${options.proxy.host}:${options.proxy.port}`;
    }

    // Cookies
    if (options.cookies) {
        if (typeof options.cookies === 'string') {
            scrappeyOptions.cookies = options.cookies;
        } else if (Array.isArray(options.cookies)) {
            scrappeyOptions.cookiejar = options.cookies;
        }
    }

    // Referer
    if (options.referrer || options.referer) {
        scrappeyOptions.referer = options.referrer || options.referer;
    }

    // Scrappey-specific options (passed through)
    const scrappeySpecificOptions = [
        'requestType', 'apiKey', 'session', 'proxyCountry', 'noProxy', 'premiumProxy', 'mobileProxy',
        'cloudflareBypass', 'datadomeBypass', 'kasadaBypass', 'disableAntiBot',
        'automaticallySolveCaptchas', 'alwaysLoad', 'browserActions',
        'cssSelector', 'includeImages', 'includeLinks', 'screenshot',
        'video', 'pdf', 'filter', 'interceptFetchRequest', 'abortOnDetection',
        'whitelistedDomains', 'blackListedDomains', 'fullPageLoad',
        'listAllRedirects', 'blockCookieBanners', 'removeIframes',
        'mouseMovements', 'retries', 'cookiejar', 'localStorage'
    ];

    scrappeySpecificOptions.forEach(option => {
        if (options[option] !== undefined) {
            scrappeyOptions[option] = options[option];
        }
    });

    return scrappeyOptions;
}

/**
 * Transforms Scrappey response to fetch-like Response object
 * @param {Object} scrappeyResponse - Scrappey API response
 * @param {string} url - Original URL
 * @param {Object} options - Original fetch options
 * @returns {Response} Fetch-like Response object
 */
function transformScrappeyResponseToFetch(scrappeyResponse, url, options = {}) {
    const solution = scrappeyResponse.solution || {};
    
    // Determine response body
    let body;
    let contentType = 'text/html';
    
    if (solution.innerText) {
        // Try to parse as JSON if it looks like JSON
        try {
            JSON.parse(solution.innerText);
            body = solution.innerText;
            contentType = 'application/json';
        } catch (e) {
            body = solution.innerText;
        }
    } else {
        body = solution.response || '';
    }

    // Get status
    const status = solution.statusCode || 200;
    const statusText = status === 200 ? 'OK' : 
                      status === 404 ? 'Not Found' :
                      status === 500 ? 'Internal Server Error' :
                      `Status ${status}`;

    // Headers - create a Headers-like object
    const headersObj = {};
    if (solution.responseHeaders) {
        Object.entries(solution.responseHeaders).forEach(([key, value]) => {
            headersObj[key.toLowerCase()] = String(value);
        });
    }
    if (!headersObj['content-type'] && contentType) {
        headersObj['content-type'] = contentType;
    }

    // Create Headers-like object
    const headers = {
        get: (name) => headersObj[name.toLowerCase()],
        has: (name) => name.toLowerCase() in headersObj,
        set: (name, value) => { headersObj[name.toLowerCase()] = value; },
        forEach: (callback) => {
            Object.entries(headersObj).forEach(([key, value]) => callback(value, key));
        },
        entries: () => Object.entries(headersObj),
        keys: () => Object.keys(headersObj),
        values: () => Object.values(headersObj)
    };

    // Create Response-like object
    const response = {
        ok: status >= 200 && status < 300,
        status: status,
        statusText: statusText,
        headers: headers,
        url: solution.currentUrl || url,
        redirected: solution.currentUrl && solution.currentUrl !== url,
        type: 'default',
        body: null,
        bodyUsed: false,
        
        // Additional Scrappey-specific data
        scrappey: {
            verified: solution.verified,
            currentUrl: solution.currentUrl,
            userAgent: solution.userAgent,
            cookies: solution.cookies || [],
            cookieString: solution.cookieString,
            timeElapsed: scrappeyResponse.timeElapsed,
            session: scrappeyResponse.session,
            ipInfo: solution.ipInfo,
            innerText: solution.innerText,
            response: solution.response
        },

        // Response methods
        async json() {
            if (this.bodyUsed) {
                throw new TypeError('Body already consumed');
            }
            this.bodyUsed = true;
            try {
                return JSON.parse(solution.innerText || solution.response || '{}');
            } catch (e) {
                throw new SyntaxError('Unexpected end of JSON input');
            }
        },

        async text() {
            if (this.bodyUsed) {
                throw new TypeError('Body already consumed');
            }
            this.bodyUsed = true;
            return solution.innerText || solution.response || '';
        },

        async arrayBuffer() {
            if (this.bodyUsed) {
                throw new TypeError('Body already consumed');
            }
            this.bodyUsed = true;
            const text = solution.innerText || solution.response || '';
            return Buffer.from(text).buffer;
        },

        async blob() {
            if (this.bodyUsed) {
                throw new TypeError('Body already consumed');
            }
            this.bodyUsed = true;
            const text = solution.innerText || solution.response || '';
            // Return a Blob-like object
            return {
                size: Buffer.byteLength(text),
                type: headers.get('content-type') || 'text/plain',
                async text() { return text; },
                async arrayBuffer() { return Buffer.from(text).buffer; }
            };
        },

        clone() {
            return transformScrappeyResponseToFetch(scrappeyResponse, url, options);
        }
    };

    return response;
}

/**
 * Default configuration
 */
let defaultConfig = {
    apiKey: process.env.SCRAPPEY_API_KEY || '',
    timeout: 300000
};

/**
 * Fetch-compatible function
 * @param {string|Request} url - URL or Request object
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch-like Response
 */
async function fetchAdapter(url, options = {}) {
    // Handle Request object
    if (typeof url === 'object' && url.url) {
        options = { ...url, ...options };
        url = url.url;
    }

    if (typeof url !== 'string') {
        throw new TypeError('URL must be a string');
    }

    // Merge with defaults
    const mergedOptions = { ...defaultConfig, ...options };
    
    // Get API key
    const apiKey = mergedOptions.apiKey || defaultConfig.apiKey || process.env.SCRAPPEY_API_KEY;
    if (!apiKey) {
        throw new Error('Scrappey API key is required. Set SCRAPPEY_API_KEY environment variable or provide apiKey in options');
    }

    // Create Scrappey instance
    const scrappey = new Scrappey(apiKey, {
        baseUrl: mergedOptions.baseURL || mergedOptions.baseUrl,
        timeout: mergedOptions.timeout || defaultConfig.timeout
    });

    // Map fetch options to Scrappey options
    const scrappeyOptions = mapFetchOptionsToScrappey(mergedOptions);
    scrappeyOptions.url = url;

    // Determine HTTP method
    const method = (mergedOptions.method || 'GET').toLowerCase();
    let scrappeyResponse;

    try {
        // Call appropriate Scrappey method
        switch (method) {
            case 'get':
                scrappeyResponse = await scrappey.get(scrappeyOptions);
                break;
            case 'post':
                scrappeyResponse = await scrappey.post(scrappeyOptions);
                break;
            case 'put':
                scrappeyResponse = await scrappey.put(scrappeyOptions);
                break;
            case 'delete':
                scrappeyResponse = await scrappey.delete(scrappeyOptions);
                break;
            case 'patch':
                scrappeyResponse = await scrappey.patch(scrappeyOptions);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }

        // Transform response
        const fetchResponse = transformScrappeyResponseToFetch(scrappeyResponse, url, mergedOptions);

        // Check if Scrappey marked it as failed
        if (scrappeyResponse.data === 'error') {
            const error = new Error(scrappeyResponse.error || 'Request failed');
            error.response = fetchResponse;
            throw error;
        }

        // If response is not ok, throw error (like fetch does)
        if (!fetchResponse.ok) {
            const error = new Error(`HTTP error! status: ${fetchResponse.status}`);
            error.response = fetchResponse;
            throw error;
        }

        return fetchResponse;
    } catch (error) {
        // If it's already a fetch error, rethrow
        if (error.response) {
            throw error;
        }
        
        // Otherwise, wrap it
        throw new Error(error.message || 'Request failed');
    }
}

/**
 * Configure default options
 */
fetchAdapter.defaults = defaultConfig;

/**
 * Configure function
 */
fetchAdapter.configure = (config) => {
    defaultConfig = { ...defaultConfig, ...config };
    fetchAdapter.defaults = defaultConfig; // Update the exposed defaults object
};

/**
 * Scrappey-specific methods
 */
fetchAdapter.createSession = async (options = {}) => {
    const apiKey = options.apiKey || defaultConfig.apiKey || process.env.SCRAPPEY_API_KEY;
    if (!apiKey) {
        throw new Error('API key is required');
    }
    const scrappey = new Scrappey(apiKey);
    return scrappey.createSession(options);
};

fetchAdapter.destroySession = async (session, options = {}) => {
    const apiKey = options.apiKey || defaultConfig.apiKey || process.env.SCRAPPEY_API_KEY;
    if (!apiKey) {
        throw new Error('API key is required');
    }
    const scrappey = new Scrappey(apiKey);
    return scrappey.destroySession(session);
};

fetchAdapter.listSessions = async (userId, options = {}) => {
    const apiKey = options.apiKey || defaultConfig.apiKey || process.env.SCRAPPEY_API_KEY;
    if (!apiKey) {
        throw new Error('API key is required');
    }
    const scrappey = new Scrappey(apiKey);
    return scrappey.listSessions(userId);
};

fetchAdapter.isSessionActive = async (session, options = {}) => {
    const apiKey = options.apiKey || defaultConfig.apiKey || process.env.SCRAPPEY_API_KEY;
    if (!apiKey) {
        throw new Error('API key is required');
    }
    const scrappey = new Scrappey(apiKey);
    return scrappey.isSessionActive(session);
};

module.exports = fetchAdapter;
