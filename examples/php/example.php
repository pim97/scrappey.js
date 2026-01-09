<?php
/**
 * Scrappey - PHP Example
 *
 * This example demonstrates how to use the Scrappey API from PHP.
 *
 * Prerequisites:
 *   PHP 8.0+ with curl extension
 *
 * Run:
 *   php example.php
 *
 * Get your API key at: https://scrappey.com
 */

$API_KEY = getenv('SCRAPPEY_API_KEY') ?: 'YOUR_API_KEY_HERE';
$BASE_URL = 'https://publisher.scrappey.com/api/v1';

/**
 * Scrappey API client
 */
class Scrappey {
    private string $apiKey;
    private string $baseUrl;
    
    public function __construct(string $apiKey, string $baseUrl = 'https://publisher.scrappey.com/api/v1') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }
    
    /**
     * Send request to Scrappey API
     */
    public function request(array $data): array {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => "{$this->baseUrl}?key={$this->apiKey}",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 300,
        ]);
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("HTTP request failed: $error");
        }
        
        if ($statusCode >= 400) {
            throw new Exception("HTTP error: $statusCode");
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Send GET request
     */
    public function get(string $url, array $options = []): array {
        return $this->request(array_merge([
            'cmd' => 'request.get',
            'url' => $url,
        ], $options));
    }
    
    /**
     * Send POST request
     */
    public function post(string $url, mixed $postData = null, array $options = []): array {
        return $this->request(array_merge([
            'cmd' => 'request.post',
            'url' => $url,
            'postData' => $postData,
        ], $options));
    }
    
    /**
     * Create session
     */
    public function createSession(array $options = []): array {
        return $this->request(array_merge([
            'cmd' => 'sessions.create',
        ], $options));
    }
    
    /**
     * Destroy session
     */
    public function destroySession(string $session): array {
        return $this->request([
            'cmd' => 'sessions.destroy',
            'session' => $session,
        ]);
    }
}

/**
 * Basic GET request example
 */
function basicGetExample(Scrappey $scrappey): void {
    echo "\n=== Basic GET Request ===\n\n";
    
    $response = $scrappey->get('https://httpbin.rs/get');
    
    echo "Status: {$response['data']}\n";
    echo "Status Code: {$response['solution']['statusCode']}\n";
    echo "Session: {$response['session']}\n";
}

/**
 * POST request example
 */
function postExample(Scrappey $scrappey): void {
    echo "\n=== POST Request ===\n\n";
    
    $response = $scrappey->post('https://httpbin.rs/post', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ], [
        'customHeaders' => ['content-type' => 'application/json'],
    ]);
    
    echo "Status: {$response['data']}\n";
    echo "Verified: " . ($response['solution']['verified'] ? 'true' : 'false') . "\n";
}

/**
 * Session management example
 */
function sessionExample(Scrappey $scrappey): void {
    echo "\n=== Session Management ===\n\n";
    
    // Create session
    $sessionResponse = $scrappey->createSession();
    $sessionId = $sessionResponse['session'];
    echo "Created session: $sessionId\n";
    
    // Use session
    $response1 = $scrappey->get('https://httpbin.rs/cookies/set/token/abc123', [
        'session' => $sessionId,
    ]);
    echo "Set cookie, status: {$response1['data']}\n";
    
    // Get cookies
    $response2 = $scrappey->get('https://httpbin.rs/cookies', [
        'session' => $sessionId,
    ]);
    $innerText = $response2['solution']['innerText'] ?? '';
    echo "Cookies: " . substr($innerText, 0, 100) . "...\n";
    
    // Destroy session
    $scrappey->destroySession($sessionId);
    echo "Session destroyed\n";
}

/**
 * Browser actions example
 */
function browserActionsExample(Scrappey $scrappey): void {
    echo "\n=== Browser Actions ===\n\n";
    
    $response = $scrappey->get('https://example.com', [
        'browserActions' => [
            [
                'type' => 'wait_for_selector',
                'cssSelector' => 'h1',
            ],
            [
                'type' => 'execute_js',
                'code' => "document.querySelector('h1').innerText",
            ],
            [
                'type' => 'execute_js',
                'code' => 'document.title',
            ],
        ],
    ]);
    
    echo "Status: {$response['data']}\n";
    
    $jsReturn = $response['solution']['javascriptReturn'] ?? [];
    if (count($jsReturn) > 0) {
        echo "Heading: {$jsReturn[0]}\n";
    }
    if (count($jsReturn) > 1) {
        echo "Title: {$jsReturn[1]}\n";
    }
}

/**
 * Cloudflare bypass example
 */
function cloudflareBypassExample(Scrappey $scrappey): void {
    echo "\n=== Cloudflare Bypass ===\n\n";
    
    $response = $scrappey->get('https://nowsecure.nl', [
        'cloudflareBypass' => true,
        'premiumProxy' => true,
    ]);
    
    echo "Status: {$response['data']}\n";
    echo "Verified: " . ($response['solution']['verified'] ? 'true' : 'false') . "\n";
    echo "Status Code: {$response['solution']['statusCode']}\n";
}

/**
 * Captcha solving example
 */
function captchaSolvingExample(Scrappey $scrappey): void {
    echo "\n=== Captcha Solving ===\n\n";
    
    $response = $scrappey->get('https://example.com', [
        'automaticallySolveCaptchas' => true,
        'alwaysLoad' => ['recaptcha', 'hcaptcha', 'turnstile'],
    ]);
    
    echo "Status: {$response['data']}\n";
    echo "Captcha solved automatically if present\n";
}

/**
 * Screenshot example
 */
function screenshotExample(Scrappey $scrappey): void {
    echo "\n=== Screenshot Capture ===\n\n";
    
    $response = $scrappey->get('https://example.com', [
        'screenshot' => true,
        'screenshotWidth' => 1920,
        'screenshotHeight' => 1080,
    ]);
    
    echo "Status: {$response['data']}\n";
    $screenshot = $response['solution']['screenshot'] ?? '';
    echo "Screenshot captured: " . ($screenshot ? 'true' : 'false') . "\n";
    if ($screenshot) {
        echo "Screenshot size: " . strlen($screenshot) . " bytes (base64)\n";
    }
}

// Main execution
try {
    $scrappey = new Scrappey($API_KEY);
    
    basicGetExample($scrappey);
    postExample($scrappey);
    sessionExample($scrappey);
    browserActionsExample($scrappey);
    screenshotExample($scrappey);
    
    // Uncomment to test antibot bypass
    // cloudflareBypassExample($scrappey);
    // captchaSolvingExample($scrappey);
    
    echo "\n✓ All examples completed successfully!\n\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
