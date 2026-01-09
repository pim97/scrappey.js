/**
 * Axios-Compatible Adapter TypeScript Declarations
 */

import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

/**
 * Extended axios config with Scrappey-specific options
 */
interface ScrappeyAxiosRequestConfig extends AxiosRequestConfig {
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
 * Extended axios response with Scrappey-specific data
 */
interface ScrappeyAxiosResponse<T = any> extends AxiosResponse<T> {
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
    };
}

/**
 * Axios-compatible instance with Scrappey support
 */
interface ScrappeyAxiosInstance extends AxiosInstance {
    (config: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse>;
    (url: string, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse>;
    
    get<T = any>(url: string, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse<T>>;
    delete<T = any>(url: string, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse<T>>;
    head<T = any>(url: string, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse<T>>;
    options<T = any>(url: string, config?: ScrappeyAxiosRequestConfig): Promise<ScrappeyAxiosResponse<T>>;
    
    defaults: ScrappeyAxiosRequestConfig;
    create(config?: ScrappeyAxiosRequestConfig): ScrappeyAxiosInstance;
    
    // Scrappey-specific methods
    createSession(options?: any): Promise<any>;
    destroySession(session: string): Promise<any>;
    listSessions(userId: number): Promise<any>;
    isSessionActive(session: string): Promise<{ active: boolean }>;
}

declare const axios: ScrappeyAxiosInstance;

export = axios;
