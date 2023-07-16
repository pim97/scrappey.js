const axios = require('axios').default;

class Scrappey {

    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://publisher.scrappey.com/api/v1';
    }

    /**
     * Creates a session
     * @param {*} session 
     * @returns 
     */
    async createSession(data) {
        return await this.sendRequest({
            endpoint: "sessions.create",
            ...data
        })
    }

    /**
     * Destroys a session
     * @param {*} session 
     * @returns 
     */
    async destroySession(session) {
        return await this.sendRequest({
            endpoint: "sessions.destroy",
            data: {
                session: session
            }
        })
    }

    /**
     * Send a GET request
     * @param {*} data 
     * @returns 
     */
    async get(data) {

        const { url } = data
        if (!url) {
            throw Error(`URL is required to send a request`)
        }

        return await this.sendRequest({
            endpoint: "request.get",
            ...data
        })
    }

    /**
     * Sends a POST request
     * @param {*} data 
     * @returns 
     */
    async post(data) {
        return await this.sendRequest({
            endpoint: "request.post",
            ...data
        })
    }

    /**
     * Sends the actual request to scrappey as a proxy
     * @param {*} dataOptions 
     * @returns 
     */
    async sendRequest(dataOptions) {

        const { endpoint } = dataOptions;

        if (!endpoint) {
            throw Error(`Endpoint is required, examples: request.get, request.post, sessions.create, sessions.destroy`)
        }

        if (!dataOptions) {
            throw Error(`Data is required`)
        }

        if (!this.apiKey) {
            throw Error(`API Key is required`)
        }

        const url = `${this.baseUrl}?key=${this.apiKey}`;

        const options = {
            url,
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                cmd: endpoint,
                ...dataOptions
            }
        };

        try {
            const response = await axios(options, { timeout: 5 * 60 * 1000 });
            return response.data
        } catch (exp) {
            throw exp
        }

    }


}

module.exports = Scrappey;