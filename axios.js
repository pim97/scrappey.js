/**
 * Axios-Compatible Adapter Entry Point
 * 
 * Drop-in replacement for axios using Scrappey.
 * 
 * Usage:
 *   import axios from 'scrappey-wrapper/axios';
 *   axios.defaults.apiKey = 'YOUR_API_KEY';
 *   const response = await axios.get('https://example.com');
 */

module.exports = require('./src/adapters/axios');
