/**
 * Axios-Compatible Adapter for Scrappey
 * 
 * Provides a drop-in replacement for axios that uses Scrappey behind the scenes.
 * Simply change your import from 'axios' to 'scrappey-wrapper/axios' and all
 * requests will automatically go through Scrappey with antibot bypass.
 */

const Scrappey = require('../scrappey');

/**
 * Maps axios config to Scrappey options
 * @param {Object} config - Axios config object
 * @returns {Object} Scrappey options
 */
function mapAxiosConfigToScrappey(config = {}) {
    const scrappeyOptions = {};

    // Headers mapping
    if (config.headers) {
        scrappeyOptions.customHeaders = config.headers;
    }

    // Data/body mapping
    if (config.data !== undefined) {
        scrappeyOptions.postData = typeof config.data === 'string' 
            ? config.data 
            : JSON.stringify(config.data);
    }

    // Params to query string (handled in request method, not here)
    // We'll handle params when we have the actual URL

    // Timeout
    if (config.timeout) {
        scrappeyOptions.timeout = config.timeout;
    }

    // Proxy
    if (config.proxy) {
        scrappeyOptions.proxy = typeof config.proxy === 'string' 
            ? config.proxy 
            : `${config.proxy.protocol || 'http'}://${config.proxy.auth ? `${config.proxy.auth.username}:${config.proxy.auth.password}@` : ''}${config.proxy.host}:${config.proxy.port}`;
    }

    // Cookies
    if (config.cookies) {
        if (typeof config.cookies === 'string') {
            scrappeyOptions.cookies = config.cookies;
        } else if (Array.isArray(config.cookies)) {
            scrappeyOptions.cookiejar = config.cookies;
        }
    }

    // Response type handling
    if (config.responseType === 'json') {
        scrappeyOptions.innerText = true;
    }

    // Scrappey-specific options (passed through)
    const scrappeySpecificOptions = [
        'session', 'proxyCountry', 'noProxy', 'premiumProxy', 'mobileProxy',
        'cloudflareBypass', 'datadomeBypass', 'kasadaBypass', 'disableAntiBot',
        'automaticallySolveCaptchas', 'alwaysLoad', 'browserActions',
        'cssSelector', 'includeImages', 'includeLinks', 'screenshot',
        'video', 'pdf', 'filter', 'interceptFetchRequest', 'abortOnDetection',
        'whitelistedDomains', 'blackListedDomains', 'fullPageLoad',
        'listAllRedirects', 'blockCookieBanners', 'removeIframes',
        'mouseMovements', 'retries', 'cookiejar', 'localStorage', 'referer'
    ];

    scrappeySpecificOptions.forEach(option => {
        if (config[option] !== undefined) {
            scrappeyOptions[option] = config[option];
        }
    });

    return scrappeyOptions;
}

/**
 * Transforms Scrappey response to axios-like response
 * @param {Object} scrappeyResponse - Scrappey API response
 * @param {Object} config - Original axios config
 * @returns {Object} Axios-like response
 */
function transformScrappeyResponse(scrappeyResponse, config = {}) {
    const solution = scrappeyResponse.solution || {};
    
    // Determine response data
    let data;
    if (config.responseType === 'json' || solution.innerText) {
        try {
            data = JSON.parse(solution.innerText || solution.response || '{}');
        } catch (e) {
            data = solution.innerText || solution.response || '';
        }
    } else {
        data = solution.response || solution.innerText || '';
    }

    // Get status text
    const statusText = solution.statusCode === 200 ? 'OK' : 
                      solution.statusCode === 404 ? 'Not Found' :
                      solution.statusCode === 500 ? 'Internal Server Error' :
                      solution.statusCode ? `Status ${solution.statusCode}` : 'Unknown';

    const axiosResponse = {
        data: data,
        status: solution.statusCode || 200,
        statusText: statusText,
        headers: solution.responseHeaders || {},
        config: config,
        request: {},
        // Additional Scrappey-specific data
        scrappey: {
            verified: solution.verified,
            currentUrl: solution.currentUrl,
            userAgent: solution.userAgent,
            cookies: solution.cookies || [],
            cookieString: solution.cookieString,
            timeElapsed: scrappeyResponse.timeElapsed,
            session: scrappeyResponse.session,
            ipInfo: solution.ipInfo
        }
    };

    return axiosResponse;
}

/**
 * Creates an axios-compatible instance
 * @param {string} apiKey - Scrappey API key
 * @param {Object} defaultConfig - Default configuration
 * @returns {Object} Axios-compatible instance
 */
function createAxiosInstance(apiKey, defaultConfig = {}) {
    const scrappey = new Scrappey(apiKey, {
        baseUrl: defaultConfig.baseURL || defaultConfig.baseUrl,
        timeout: defaultConfig.timeout
    });

    // Merge defaults
    const defaults = {
        apiKey: apiKey,
        ...defaultConfig
    };

    /**
     * Request method (core axios method)
     */
    async function request(configOrUrl, requestConfig) {
        // Support both axios-style config and url + config
        let url, config;
        if (typeof configOrUrl === 'string') {
            url = configOrUrl;
            config = requestConfig || {};
        } else {
            url = configOrUrl.url;
            config = configOrUrl;
        }

        if (!url) {
            throw new Error('URL is required');
        }

        // Merge with defaults
        const mergedConfig = { ...defaults, ...config, url };
        
        // Handle params - append to URL as query string
        let finalUrl = url;
        if (mergedConfig.params) {
            const urlObj = new URL(url);
            Object.entries(mergedConfig.params).forEach(([key, value]) => {
                urlObj.searchParams.append(key, value);
            });
            finalUrl = urlObj.toString();
        }

        // Map axios config to Scrappey options
        const scrappeyOptions = mapAxiosConfigToScrappey(mergedConfig);
        scrappeyOptions.url = finalUrl;

        // Determine HTTP method
        const method = (mergedConfig.method || 'get').toLowerCase();
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
            const axiosResponse = transformScrappeyResponse(scrappeyResponse, mergedConfig);

            // Validate status if validateStatus is provided
            if (mergedConfig.validateStatus && !mergedConfig.validateStatus(axiosResponse.status)) {
                const error = new Error(`Request failed with status code ${axiosResponse.status}`);
                error.response = axiosResponse;
                error.config = mergedConfig;
                throw error;
            }

            // Check if Scrappey marked it as failed
            if (scrappeyResponse.data === 'error') {
                const error = new Error(scrappeyResponse.error || 'Request failed');
                error.response = transformScrappeyResponse(scrappeyResponse, mergedConfig);
                error.config = mergedConfig;
                throw error;
            }

            return axiosResponse;
        } catch (error) {
            // If it's already an axios error, rethrow
            if (error.response) {
                throw error;
            }
            
            // Otherwise, wrap it
            const axiosError = new Error(error.message || 'Request failed');
            axiosError.config = mergedConfig;
            axiosError.request = {};
            throw axiosError;
        }
    }

    // Convenience methods
    const instance = {
        request,
        get: (url, config) => request({ ...config, method: 'get', url }),
        post: (url, data, config) => request({ ...config, method: 'post', url, data }),
        put: (url, data, config) => request({ ...config, method: 'put', url, data }),
        delete: (url, config) => request({ ...config, method: 'delete', url }),
        patch: (url, data, config) => request({ ...config, method: 'patch', url, data }),
        head: (url, config) => request({ ...config, method: 'head', url }),
        options: (url, config) => request({ ...config, method: 'options', url }),
        defaults: defaults,
        create: (newConfig) => createAxiosInstance(apiKey, { ...defaults, ...newConfig }),
        // Scrappey-specific methods
        createSession: (options) => scrappey.createSession(options),
        destroySession: (session) => scrappey.destroySession(session),
        listSessions: (userId) => scrappey.listSessions(userId),
        isSessionActive: (session) => scrappey.isSessionActive(session)
    };

    return instance;
}

/**
 * Default instance (requires apiKey to be set in defaults)
 */
let defaultInstance = null;

/**
 * Create or get default axios instance
 */
function getDefaultInstance() {
    if (!defaultInstance) {
        const apiKey = process.env.SCRAPPEY_API_KEY || '';
        if (!apiKey) {
            throw new Error('Scrappey API key is required. Set SCRAPPEY_API_KEY environment variable or configure axios.defaults.apiKey');
        }
        defaultInstance = createAxiosInstance(apiKey);
    }
    return defaultInstance;
}

/**
 * Main export - axios-compatible API
 */
const axiosAdapter = function(configOrUrl, config) {
    // If called as function, use default instance
    if (typeof configOrUrl === 'string') {
        return getDefaultInstance().request({ url: configOrUrl, ...config });
    }
    return getDefaultInstance().request(configOrUrl);
};

// Attach convenience methods
axiosAdapter.get = (url, config) => getDefaultInstance().get(url, config);
axiosAdapter.post = (url, data, config) => getDefaultInstance().post(url, data, config);
axiosAdapter.put = (url, data, config) => getDefaultInstance().put(url, data, config);
axiosAdapter.delete = (url, config) => getDefaultInstance().delete(url, config);
axiosAdapter.patch = (url, data, config) => getDefaultInstance().patch(url, data, config);
axiosAdapter.head = (url, config) => getDefaultInstance().head(url, config);
axiosAdapter.options = (url, config) => getDefaultInstance().options(url, config);

// Defaults object
axiosAdapter.defaults = {
    apiKey: process.env.SCRAPPEY_API_KEY || '',
    timeout: 300000
};

// Create method
axiosAdapter.create = (config) => {
    const apiKey = config.apiKey || axiosAdapter.defaults.apiKey || process.env.SCRAPPEY_API_KEY;
    if (!apiKey) {
        throw new Error('API key is required. Provide apiKey in config or set SCRAPPEY_API_KEY environment variable');
    }
    return createAxiosInstance(apiKey, config);
};

// Scrappey-specific methods
axiosAdapter.createSession = (options) => getDefaultInstance().createSession(options);
axiosAdapter.destroySession = (session) => getDefaultInstance().destroySession(session);
axiosAdapter.listSessions = (userId) => getDefaultInstance().listSessions(userId);
axiosAdapter.isSessionActive = (session) => getDefaultInstance().isSessionActive(session);

module.exports = axiosAdapter;
