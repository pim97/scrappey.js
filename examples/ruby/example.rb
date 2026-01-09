# Scrappey - Ruby Example
#
# This example demonstrates how to use the Scrappey API from Ruby.
#
# Prerequisites:
#   Ruby 3.0+
#   gem install json (usually built-in)
#
# Run:
#   ruby example.rb
#
# Get your API key at: https://scrappey.com

require 'net/http'
require 'json'
require 'uri'

API_KEY = ENV['SCRAPPEY_API_KEY'] || 'YOUR_API_KEY_HERE'
BASE_URL = 'https://publisher.scrappey.com/api/v1'

# Scrappey API client
class Scrappey
  def initialize(api_key, base_url = BASE_URL)
    @api_key = api_key
    @base_url = base_url
  end

  # Send request to Scrappey API
  def request(data)
    uri = URI("#{@base_url}?key=#{@api_key}")
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300
    
    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/json'
    request.body = data.to_json
    
    response = http.request(request)
    
    unless response.is_a?(Net::HTTPSuccess)
      raise "HTTP error: #{response.code} #{response.message}"
    end
    
    JSON.parse(response.body)
  end

  # Send GET request
  def get(url, **options)
    request({ cmd: 'request.get', url: url }.merge(options))
  end

  # Send POST request
  def post(url, post_data = nil, **options)
    request({ cmd: 'request.post', url: url, postData: post_data }.merge(options))
  end

  # Create session
  def create_session(**options)
    request({ cmd: 'sessions.create' }.merge(options))
  end

  # Destroy session
  def destroy_session(session)
    request({ cmd: 'sessions.destroy', session: session })
  end

  # Check if session is active
  def session_active?(session)
    request({ cmd: 'sessions.active', session: session })
  end
end

# Basic GET request example
def basic_get_example(scrappey)
  puts "\n=== Basic GET Request ===\n\n"
  
  response = scrappey.get('https://httpbin.rs/get')
  
  puts "Status: #{response['data']}"
  puts "Status Code: #{response.dig('solution', 'statusCode')}"
  puts "Session: #{response['session']}"
end

# POST request example
def post_example(scrappey)
  puts "\n=== POST Request ===\n\n"
  
  response = scrappey.post(
    'https://httpbin.rs/post',
    { name: 'John Doe', email: 'john@example.com' },
    customHeaders: { 'content-type' => 'application/json' }
  )
  
  puts "Status: #{response['data']}"
  puts "Verified: #{response.dig('solution', 'verified')}"
end

# Session management example
def session_example(scrappey)
  puts "\n=== Session Management ===\n\n"
  
  # Create session
  session_response = scrappey.create_session
  session_id = session_response['session']
  puts "Created session: #{session_id}"
  
  # Use session
  response1 = scrappey.get('https://httpbin.rs/cookies/set/token/abc123', session: session_id)
  puts "Set cookie, status: #{response1['data']}"
  
  # Get cookies
  response2 = scrappey.get('https://httpbin.rs/cookies', session: session_id)
  inner_text = response2.dig('solution', 'innerText') || ''
  puts "Cookies: #{inner_text[0, 100]}..."
  
  # Destroy session
  scrappey.destroy_session(session_id)
  puts "Session destroyed"
end

# Browser actions example
def browser_actions_example(scrappey)
  puts "\n=== Browser Actions ===\n\n"
  
  response = scrappey.get(
    'https://example.com',
    browserActions: [
      { type: 'wait_for_selector', cssSelector: 'h1' },
      { type: 'execute_js', code: "document.querySelector('h1').innerText" },
      { type: 'execute_js', code: 'document.title' }
    ]
  )
  
  puts "Status: #{response['data']}"
  
  js_return = response.dig('solution', 'javascriptReturn') || []
  puts "Heading: #{js_return[0]}" if js_return[0]
  puts "Title: #{js_return[1]}" if js_return[1]
end

# Cloudflare bypass example
def cloudflare_bypass_example(scrappey)
  puts "\n=== Cloudflare Bypass ===\n\n"
  
  response = scrappey.get(
    'https://nowsecure.nl',
    cloudflareBypass: true,
    premiumProxy: true
  )
  
  puts "Status: #{response['data']}"
  puts "Verified: #{response.dig('solution', 'verified')}"
  puts "Status Code: #{response.dig('solution', 'statusCode')}"
end

# Captcha solving example
def captcha_solving_example(scrappey)
  puts "\n=== Captcha Solving ===\n\n"
  
  response = scrappey.get(
    'https://example.com',
    automaticallySolveCaptchas: true,
    alwaysLoad: ['recaptcha', 'hcaptcha', 'turnstile']
  )
  
  puts "Status: #{response['data']}"
  puts "Captcha solved automatically if present"
end

# Screenshot example
def screenshot_example(scrappey)
  puts "\n=== Screenshot Capture ===\n\n"
  
  response = scrappey.get(
    'https://example.com',
    screenshot: true,
    screenshotWidth: 1920,
    screenshotHeight: 1080
  )
  
  puts "Status: #{response['data']}"
  screenshot = response.dig('solution', 'screenshot')
  puts "Screenshot captured: #{!!screenshot}"
  puts "Screenshot size: #{screenshot.length} bytes (base64)" if screenshot
end

# Main execution
begin
  scrappey = Scrappey.new(API_KEY)
  
  basic_get_example(scrappey)
  post_example(scrappey)
  session_example(scrappey)
  browser_actions_example(scrappey)
  screenshot_example(scrappey)
  
  # Uncomment to test antibot bypass
  # cloudflare_bypass_example(scrappey)
  # captcha_solving_example(scrappey)
  
  puts "\n✓ All examples completed successfully!\n\n"
  
rescue StandardError => e
  puts "Error: #{e.message}"
  exit 1
end
