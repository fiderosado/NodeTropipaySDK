//TropipayHttpClient
const axios = require('axios');
const {fromAxiosError} = require('./errors');
const {cleanQuery, sleep} = require('./utils');
const {TokenManager} = require('./TokenManager');
const {version} = require('../../package.json');

function retryDelay(error, attempt, maxDelay) {
    const rateLimit = error.rateLimit || {};
    let delay;
    if (Number.isFinite(rateLimit.retryAfter)) {
        delay = rateLimit.retryAfter * 1000;
    } else if (Number.isFinite(rateLimit.reset)) {
        const resetMs = rateLimit.reset > 1e12 ? rateLimit.reset : rateLimit.reset * 1000;
        delay = resetMs - Date.now();
    } else {
        delay = 500 * 2 ** (attempt - 1);
    }
    return Math.min(Math.max(delay, 0), maxDelay);
}

/**
 * Single HTTP entry point for every resource: injects the current token on each request,
 * re-authorizes once on 401 and retries 429 responses.
 */
class HttpClient {
    #config;
    #axios;

    constructor(config) {
        this.#config = config;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': config.userAgent || `sertropipay/${version}`,
            ...config.headers,
        };
        delete headers.Authorization;
        this.#axios = axios.create({
            baseURL: config.serverUrl + config.apiPath,
            timeout: config.timeout,
            headers,
            ...(config.httpAdapter ? {adapter: config.httpAdapter} : {}),
        });
        this.tokens = new TokenManager(config, this.#axios);
    }

    get baseUrl() {
        return this.#config.serverUrl + this.#config.apiPath;
    }

    /**
     * @param {object} request
     * @param {string} request.method
     * @param {string} request.path - relative to the API base (or absolute to `baseUrl` when given)
     * @param {object} [request.query]
     * @param {*} [request.body]
     * @param {object} [request.headers]
     * @param {string} [request.token] - use this bearer token instead of the managed one (user-level tokens)
     * @param {string} [request.deviceId] - sent as X-Device-Id (biometric operations)
     * @param {boolean} [request.auth=true]
     * @param {string} [request.baseUrl] - override the API base (legacy endpoints)
     * @param {AbortSignal} [request.signal]
     */
    async request({method = 'GET', path, query, body, headers, token, deviceId, auth = true, baseUrl, signal}) {
        const logger = this.#config.logger;
        let attempt = 0;
        let reauthorized = false;
        for (;;) {
            const requestHeaders = {...(headers || {})};
            const device = deviceId || this.#config.deviceId;
            if (device) requestHeaders['X-Device-Id'] = device;
            if (auth) {
                requestHeaders.Authorization = token
                    ? (/^\w+\s/.test(token) ? token : `Bearer ${token}`)
                    : await this.tokens.getAuthorization();
            }
            logger.debug(`Tropipay: ${method} ${path}`);
            try {
                const response = await this.#axios.request({
                    method,
                    url: path,
                    params: cleanQuery(query),
                    data: body,
                    headers: requestHeaders,
                    ...(baseUrl ? {baseURL: baseUrl} : {}),
                    ...(signal ? {signal} : {}),
                });
                logger.debug(`Tropipay: ${method} ${path} -> ${response.status}`);
                return response.data;
            } catch (error) {
                const tppError = fromAxiosError(error, {method, path});
                if (tppError.status === 401 && auth && !token && !reauthorized && this.tokens.canRefresh()) {
                    reauthorized = true;
                    this.tokens.invalidate();
                    logger.warn('Tropipay: 401 received, renewing access token and retrying');
                    continue;
                }
                if (tppError.status === 429 && attempt < this.#config.maxRetries) {
                    attempt += 1;
                    const delay = retryDelay(tppError, attempt, this.#config.maxRetryDelay);
                    logger.warn(`Tropipay: rate limited, retry ${attempt} in ${delay}ms`);
                    await sleep(delay);
                    continue;
                }
                logger.error(`Tropipay: ${method} ${path} failed (${tppError.status || tppError.code}): ${tppError.message}`);
                throw tppError;
            }
        }
    }
}

module.exports = {HttpClient, retryDelay};
