/**
 * Scrappey - Web Scraping API Wrapper
 * TypeScript declarations
 */

declare module 'scrappey-wrapper' {
    export = Scrappey;
}

/**
 * Browser action types
 */
type BrowserActionType = 
    | 'click'
    | 'type'
    | 'goto'
    | 'wait'
    | 'wait_for_selector'
    | 'wait_for_function'
    | 'wait_for_load_state'
    | 'wait_for_cookie'
    | 'execute_js'
    | 'scroll'
    | 'hover'
    | 'keyboard'
    | 'dropdown'
    | 'switch_iframe'
    | 'set_viewport'
    | 'if'
    | 'while'
    | 'solve_captcha'
    | 'remove_iframes';

/**
 * Captcha types supported by Scrappey
 */
type CaptchaType = 
    | 'turnstile'
    | 'recaptcha'
    | 'recaptchav2'
    | 'recaptchav3'
    | 'hcaptcha'
    | 'hcaptcha_inside'
    | 'hcaptcha_enterprise_inside'
    | 'funcaptcha'
    | 'perimeterx'
    | 'mtcaptcha'
    | 'mtcaptchaisolated'
    | 'v4guard'
    | 'custom'
    | 'fingerprintjscom'
    | 'fingerprintjs_curseforge';

/**
 * Keyboard action values
 */
type KeyboardValue = 
    | 'tab'
    | 'enter'
    | 'space'
    | 'arrowdown'
    | 'arrowup'
    | 'arrowleft'
    | 'arrowright'
    | 'backspace'
    | 'clear';

/**
 * Page load states
 */
type LoadState = 'domcontentloaded' | 'networkidle' | 'load';

/**
 * Request type mode
 * - 'browser': Headless browser (default) - more features, JS rendering, browser actions. Cost: 1 + 0.2 balance per request
 * - 'request': HTTP library with TLS - faster and cheaper. Cost: 0.2 balance per request
 */
type RequestType = 'browser' | 'request';

/**
 * Browser action definition
 */
interface BrowserAction {
    type: BrowserActionType;
    cssSelector?: string;
    text?: string;
    url?: string;
    wait?: number;
    waitForSelector?: string;
    waitForLoadState?: LoadState;
    code?: string;
    condition?: string;
    then?: BrowserAction[];
    or?: BrowserAction[];
    maxAttempts?: number;
    captcha?: CaptchaType;
    captchaData?: CaptchaData;
    websiteUrl?: string;
    websiteKey?: string;
    inputSelector?: string;
    clickSelector?: string;
    iframeSelector?: string;
    when?: 'beforeload' | 'afterload';
    ignoreErrors?: boolean;
    timeout?: number;
    direct?: boolean;
    value?: KeyboardValue | string;
    index?: number;
    width?: number;
    height?: number;
    repeat?: number;
    delayMs?: number;
    cookieName?: string;
    cookieValue?: string;
    cookieDomain?: string;
    pollIntervalMs?: number;
}

/**
 * Captcha solving data
 */
interface CaptchaData {
    sitekey?: string;
    action?: string;
    pageAction?: string;
    invisible?: boolean;
    base64Image?: string;
    cssSelector?: string;
    reset?: boolean;
    fast?: boolean;
}

/**
 * Cookie object
 */
interface Cookie {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Cookie jar entry
 */
interface CookieJarEntry {
    key: string;
    value: string;
    domain: string;
    path?: string;
}

/**
 * Browser specification
 */
interface BrowserSpec {
    name: 'firefox' | 'chrome' | 'safari';
    minVersion?: number;
    maxVersion?: number;
}

/**
 * Request options for all HTTP methods
 */
interface RequestOptions {
    /** Target URL to scrape */
    url: string;
    /** Request mode: 'browser' (headless, default) or 'request' (HTTP, faster/cheaper) */
    requestType?: RequestType;
    /** Session ID for session reuse */
    session?: string;
    /** Proxy string (http://user:pass@ip:port) */
    proxy?: string;
    /** Request proxy from specific country */
    proxyCountry?: string;
    /** Disable proxy usage */
    noProxy?: boolean;
    /** Use premium proxy pool */
    premiumProxy?: boolean;
    /** Use mobile proxy pool */
    mobileProxy?: boolean;
    /** Data for POST/PUT/PATCH requests */
    postData?: Record<string, any> | string;
    /** Custom HTTP headers */
    customHeaders?: Record<string, string>;
    /** HTTP Referer header */
    referer?: string;
    /** Cookie string to set */
    cookies?: string;
    /** Cookie jar array format */
    cookiejar?: CookieJarEntry[];
    /** LocalStorage data to set */
    localStorage?: Record<string, string>;
    /** Browser actions to execute */
    browserActions?: BrowserAction[];
    /** Enable Cloudflare bypass */
    cloudflareBypass?: boolean;
    /** Enable Datadome bypass */
    datadomeBypass?: boolean;
    /** Enable Kasada bypass */
    kasadaBypass?: boolean;
    /** Disable automatic antibot detection */
    disableAntiBot?: boolean;
    /** Automatically solve detected captchas */
    automaticallySolveCaptchas?: boolean;
    /** Always load specific captcha types */
    alwaysLoad?: ('recaptcha' | 'hcaptcha' | 'turnstile')[];
    /** Extract content matching CSS selector */
    cssSelector?: string;
    /** Include inner text of elements */
    innerText?: boolean;
    /** Include image URLs in response */
    includeImages?: boolean;
    /** Include link URLs in response */
    includeLinks?: boolean;
    /** Regex pattern(s) to extract content */
    regex?: string | string[];
    /** Capture page screenshot */
    screenshot?: boolean;
    /** Upload screenshot to storage */
    screenshotUpload?: boolean;
    /** Screenshot width in pixels */
    screenshotWidth?: number;
    /** Screenshot height in pixels */
    screenshotHeight?: number;
    /** Record browser session as video */
    video?: boolean;
    /** Return screenshot as base64 */
    base64?: boolean;
    /** Return HTML response as base64 */
    base64Response?: boolean;
    /** Generate PDF of page */
    pdf?: boolean;
    /** Return only specified fields */
    filter?: string[];
    /** URL pattern(s) to intercept and return */
    interceptFetchRequest?: string | string[];
    /** URL patterns to block/abort */
    abortOnDetection?: string[];
    /** Wait for abort patterns before continuing */
    waitForAbortOnDetection?: boolean;
    /** Timeout for waiting (ms) */
    waitForAbortOnDetectionTimeout?: number;
    /** Only allow requests to these domains */
    whitelistedDomains?: string[];
    /** Block requests to these domains */
    blackListedDomains?: string[];
    /** Wait for full page load */
    fullPageLoad?: boolean;
    /** Don't wait for page load */
    dontWaitOnPageLoad?: boolean;
    /** Wait for URL to match pattern */
    waitForUrl?: string;
    /** Track and return all redirects */
    listAllRedirects?: boolean;
    /** Remove all iframes from page */
    removeIframes?: boolean;
    /** Block cookie consent banners */
    blockCookieBanners?: boolean;
    /** Enable human-like mouse movements */
    mouseMovements?: boolean;
    /** Force mouse movement simulation */
    forceMouseMovement?: boolean;
    /** Browser specification */
    browser?: BrowserSpec[];
    /** Custom user agent string */
    userAgent?: string;
    /** Browser locale settings */
    locales?: string[];
    /** Force new browser instance */
    forceUniqueFingerprint?: boolean;
    /** IPv4 address for WebRTC spoofing */
    webrtcIpv4?: string;
    /** IPv6 address for WebRTC spoofing */
    webrtcIpv6?: string;
    /** Number of retry attempts */
    retries?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Use AI to parse HTML */
    autoparse?: boolean;
    /** Structure definition for autoparse */
    structure?: Record<string, any>;
    /** AI model for autoparse */
    model?: string;
    /** API key for AI service */
    api_key?: string;
    /** Close session after use */
    closeAfterUse?: boolean;
}

/**
 * Session creation options
 */
interface SessionOptions {
    /** Custom session ID */
    session?: string;
    /** Proxy string */
    proxy?: string;
    /** Proxy country */
    proxyCountry?: string;
    /** Use premium proxy */
    premiumProxy?: boolean;
    /** Use mobile proxy */
    mobileProxy?: boolean;
    /** Browser specification */
    browser?: BrowserSpec[];
    /** Custom user agent */
    userAgent?: string;
    /** Browser locale settings */
    locales?: string[];
    /** User ID for session tracking */
    userId?: number;
}

/**
 * WebSocket creation options
 */
interface WebSocketOptions {
    /** User ID */
    userId: number;
    /** Proxy string */
    proxy?: string;
    /** Session TTL in seconds */
    session_ttl?: number;
    /** Run headless */
    headless?: 'true' | 'false';
    /** Enable GeoIP */
    geoip?: 'true' | 'false';
}

/**
 * Detected antibot providers
 */
interface DetectedAntibotProviders {
    providers: string[];
    confidence: Record<string, number>;
    primaryProvider: string;
}

/**
 * IP information
 */
interface IpInfo {
    ip?: string;
    country?: string;
    city?: string;
    [key: string]: any;
}

/**
 * Solution object in response
 */
interface Solution {
    /** Request verification status */
    verified: boolean;
    /** Response type */
    type?: 'browser' | 'request';
    /** HTML content of the page */
    response?: string;
    /** HTTP status code */
    statusCode?: number;
    /** Final URL after redirects */
    currentUrl?: string;
    /** User agent used */
    userAgent?: string;
    /** Array of cookie objects */
    cookies?: Cookie[];
    /** Cookies as semicolon-separated string */
    cookieString?: string;
    /** HTTP response headers */
    responseHeaders?: Record<string, string>;
    /** HTTP request headers */
    requestHeaders?: Record<string, string>;
    /** Request body */
    requestBody?: string;
    /** HTTP method used */
    method?: string;
    /** IP information */
    ipInfo?: IpInfo;
    /** Text content of the page */
    innerText?: string;
    /** LocalStorage data */
    localStorageData?: Record<string, string>;
    /** Base64-encoded screenshot */
    screenshot?: string;
    /** URL to uploaded screenshot */
    screenshotUrl?: string;
    /** URL to recorded video */
    videoUrl?: string;
    /** Intercepted request data */
    interceptFetchRequestResponse?: any;
    /** Return values from JavaScript execution */
    javascriptReturn?: any[];
    /** Base64-encoded HTML response */
    base64Response?: string;
    /** All redirect URLs */
    listAllRedirectsResponse?: string[];
    /** Additional cost for proxy/premium features */
    additionalCost?: number;
    /** WebSocket endpoint */
    ws?: string;
    wsEndpoint?: string;
    /** Detected antibot providers */
    detectedAntibotProviders?: DetectedAntibotProviders;
    /** AI parsed data */
    autoparse?: any;
}

/**
 * API response
 */
interface ScrappeyResponse {
    /** Response data */
    solution: Solution;
    /** Request time in milliseconds */
    timeElapsed: number;
    /** Request status */
    data: 'success' | 'error';
    /** Session ID */
    session: string;
    /** Error message if failed */
    error?: string;
    /** Error info URL */
    info?: string;
    /** Browser fingerprint (on session create) */
    fingerprint?: Record<string, any>;
    /** Browser context info */
    context?: Record<string, any>;
}

/**
 * Session list response
 */
interface SessionListResponse {
    sessions: Array<{
        session: string;
        lastAccessed: number;
    }>;
    open: number;
    limit: number;
    timeElapsed: number;
}

/**
 * Session active response
 */
interface SessionActiveResponse {
    active: boolean;
}

/**
 * Scrappey client options
 */
interface ScrappeyOptions {
    /** Custom API base URL */
    baseUrl?: string;
    /** Default request timeout (ms) */
    timeout?: number;
}

/**
 * Generic request data
 */
interface GenericRequestData extends RequestOptions {
    cmd: string;
    [key: string]: any;
}

/**
 * Scrappey API wrapper class
 */
declare class Scrappey {
    /**
     * Creates a new Scrappey instance
     * @param apiKey - Your Scrappey API key
     * @param options - Configuration options
     */
    constructor(apiKey: string, options?: ScrappeyOptions);

    /** API key */
    readonly apiKey: string;
    /** API base URL */
    readonly baseUrl: string;
    /** Default timeout */
    readonly timeout: number;

    /**
     * Sends a generic request to the Scrappey API
     * @param data - Request data with cmd and other options
     */
    request(data: GenericRequestData): Promise<ScrappeyResponse>;

    /**
     * Sends a GET request
     * @param options - Request options
     */
    get(options: RequestOptions): Promise<ScrappeyResponse>;

    /**
     * Sends a POST request
     * @param options - Request options
     */
    post(options: RequestOptions): Promise<ScrappeyResponse>;

    /**
     * Sends a PUT request
     * @param options - Request options
     */
    put(options: RequestOptions): Promise<ScrappeyResponse>;

    /**
     * Sends a DELETE request
     * @param options - Request options
     */
    delete(options: RequestOptions): Promise<ScrappeyResponse>;

    /**
     * Sends a PATCH request
     * @param options - Request options
     */
    patch(options: RequestOptions): Promise<ScrappeyResponse>;

    /**
     * Creates a new browser session
     * @param options - Session options
     */
    createSession(options?: SessionOptions): Promise<ScrappeyResponse>;

    /**
     * Destroys an existing session
     * @param session - Session ID to destroy
     */
    destroySession(session: string): Promise<ScrappeyResponse>;

    /**
     * Lists all active sessions for a user
     * @param userId - User ID
     */
    listSessions(userId: number): Promise<SessionListResponse>;

    /**
     * Checks if a session is currently active
     * @param session - Session ID to check
     */
    isSessionActive(session: string): Promise<SessionActiveResponse>;

    /**
     * Creates a WebSocket-based browser connection
     * @param options - WebSocket options
     */
    createWebSocket(options: WebSocketOptions): Promise<ScrappeyResponse>;
}

export = Scrappey;
