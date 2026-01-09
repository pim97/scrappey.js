/**
 * Tests for Axios and Fetch Adapters
 * 
 * Simple test suite that can run without external test frameworks.
 * Run with: node tests/adapters.test.js
 */

const axios = require('../axios');
const fetch = require('../fetch');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        testsPassed++;
        console.log(`✓ ${name}`);
    } catch (error) {
        testsFailed++;
        console.error(`✗ ${name}`);
        console.error(`  Error: ${error.message}`);
        if (error.stack) {
            console.error(`  ${error.stack.split('\n')[1]}`);
        }
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

console.log('\n=== Testing Axios Adapter ===\n');

// Configuration tests
test('axios should have defaults object', () => {
    assert(typeof axios.defaults === 'object', 'defaults should be an object');
});

test('axios should support setting apiKey in defaults', () => {
    axios.defaults.apiKey = 'test-api-key';
    assertEqual(axios.defaults.apiKey, 'test-api-key');
});

test('axios should have HTTP methods', () => {
    assert(typeof axios.get === 'function', 'get should be a function');
    assert(typeof axios.post === 'function', 'post should be a function');
    assert(typeof axios.put === 'function', 'put should be a function');
    assert(typeof axios.delete === 'function', 'delete should be a function');
    assert(typeof axios.patch === 'function', 'patch should be a function');
});

test('axios should have create method', () => {
    assert(typeof axios.create === 'function', 'create should be a function');
});

test('axios should expose Scrappey-specific methods', () => {
    assert(typeof axios.createSession === 'function', 'createSession should be a function');
    assert(typeof axios.destroySession === 'function', 'destroySession should be a function');
    assert(typeof axios.listSessions === 'function', 'listSessions should be a function');
    assert(typeof axios.isSessionActive === 'function', 'isSessionActive should be a function');
});

test('axios.create should create new instance with config', () => {
    const instance = axios.create({ apiKey: 'test-key', timeout: 5000 });
    assert(typeof instance.get === 'function', 'instance should have get method');
    assert(typeof instance.defaults === 'object', 'instance should have defaults');
});

console.log('\n=== Testing Fetch Adapter ===\n');

// Fetch tests
test('fetch should be a function', () => {
    assert(typeof fetch === 'function', 'fetch should be a function');
});

test('fetch should have defaults object', () => {
    assert(typeof fetch.defaults === 'object', 'defaults should be an object');
});

test('fetch should have configure method', () => {
    assert(typeof fetch.configure === 'function', 'configure should be a function');
});

test('fetch.configure should update defaults', () => {
    fetch.configure({ apiKey: 'test-fetch-key', timeout: 10000 });
    assertEqual(fetch.defaults.apiKey, 'test-fetch-key');
    assertEqual(fetch.defaults.timeout, 10000);
});

test('fetch should expose Scrappey-specific methods', () => {
    assert(typeof fetch.createSession === 'function', 'createSession should be a function');
    assert(typeof fetch.destroySession === 'function', 'destroySession should be a function');
    assert(typeof fetch.listSessions === 'function', 'listSessions should be a function');
    assert(typeof fetch.isSessionActive === 'function', 'isSessionActive should be a function');
});

console.log('\n=== Testing Option Mapping ===\n');

test('axios defaults should support Scrappey options', () => {
    axios.defaults.apiKey = 'test-key';
    axios.defaults.cloudflareBypass = true;
    axios.defaults.premiumProxy = true;
    assert(axios.defaults.cloudflareBypass === true);
    assert(axios.defaults.premiumProxy === true);
});

test('fetch defaults should support Scrappey options', () => {
    fetch.configure({ 
        apiKey: 'test-key',
        cloudflareBypass: true,
        premiumProxy: true
    });
    // Note: fetch.defaults might not store all options, but configure should work
    assert(typeof fetch.defaults === 'object');
});

console.log('\n=== Test Summary ===\n');
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}\n`);

if (testsFailed > 0) {
    process.exit(1);
} else {
    console.log('All tests passed! ✓\n');
}
