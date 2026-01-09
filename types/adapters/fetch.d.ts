/**
 * Fetch-Compatible Adapter TypeScript Declarations
 */

/**
 * Extended fetch options with Scrappey-specific options
 */
interface ScrappeyFetchOptions extends RequestInit {
    /** Scrappey API key (if not set in defaults) */
    apiKey?: string;
    /** Session ID for session reuse */
    session?: string;
    /** Proxy country */
    proxyCountry?: string;
    /** Use premium proxy */
    premiumProxy?: boolean;
    /** Use mobile proxy */
    mobileProxy?: boolean;
    /** Enable Cloudflare bypass */
    cloudflareBypass?: boolean;
    /** Enable Datadome bypass */
    datadomeBypass?: boolean;
    /** Enable Kasada bypass */
    kasadaBypass?: boolean;
    /** Automatically solve captchas */
    automaticallySolveCaptchas?: boolean;
    /** Always load specific captcha types */
    alwaysLoad?: ('recaptcha' | 'hcaptcha' | 'turnstile')[];
    /** Browser actions to execute */
    browserActions?: any[];
    /** Capture screenshot */
    screenshot?: boolean;
    /** Record video */
    video?: boolean;
    /** And other Scrappey options... */
    [key: string]: any;
}

/**
 * Extended Response with Scrappey-specific data
 */
interface ScrappeyResponse extends Response {
    /** Additional Scrappey-specific data */
    scrappey?: {
        verified: boolean;
        currentUrl?: string;
        userAgent?: string;
        cookies?: any[];
        cookieString?: string;
        timeElapsed?: number;
        session?: string;
        ipInfo?: any;
        innerText?: string;
        response?: string;
    };
}

/**
 * Fetch-compatible function with Scrappey support
 */
interface ScrappeyFetch {
    (url: string | Request, init?: ScrappeyFetchOptions): Promise<ScrappeyResponse>;
    
    /** Default configuration */
    defaults: {
        apiKey?: string;
        timeout?: number;
        [key: string]: any;
    };
    
    /** Configure defaults */
    configure(config: ScrappeyFetchOptions): void;
    
    // Scrappey-specific methods
    createSession(options?: any): Promise<any>;
    destroySession(session: string, options?: any): Promise<any>;
    listSessions(userId: number, options?: any): Promise<any>;
    isSessionActive(session: string, options?: any): Promise<{ active: boolean }>;
}

declare const fetch: ScrappeyFetch;

export = fetch;
