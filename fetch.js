/**
 * Fetch-Compatible Adapter Entry Point
 * 
 * Drop-in replacement for fetch using Scrappey.
 * 
 * Usage:
 *   import fetch from 'scrappey-wrapper/fetch';
 *   fetch.configure({ apiKey: 'YOUR_API_KEY' });
 *   const response = await fetch('https://example.com');
 */

module.exports = require('./src/adapters/fetch');
