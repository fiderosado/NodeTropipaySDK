const {AxiosError} = require('axios');
const {Tropipay} = require('../src');

/**
 * Fake axios adapter. `routes` maps "METHOD /path" (path relative to the server) to a response
 * ({status, data, headers}) or a function (call) => response. Every request is recorded in `calls`.
 */
function mockAdapter(routes = {}) {
    const calls = [];
    const adapter = async (config) => {
        const fullUrl = /^https?:\/\//.test(config.url) ? config.url : (config.baseURL || '') + config.url;
        const path = fullUrl.replace(/^https?:\/\/[^/]+/, '');
        let data = config.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) { /* raw body */ }
        }
        const headers = typeof config.headers.toJSON === 'function' ? config.headers.toJSON() : {...config.headers};
        const call = {method: config.method.toUpperCase(), path, url: fullUrl, params: config.params, data, headers};
        calls.push(call);

        const key = `${call.method} ${path}`;
        let route = routes[key] !== undefined ? routes[key] : routes['*'];
        if (typeof route === 'function') route = await route(call, calls);
        if (route === undefined) route = {status: 200, data: {ok: true, key}};
        const response = {
            data: route.data,
            status: route.status || 200,
            statusText: String(route.status || 200),
            headers: route.headers || {},
            config,
            request: {},
        };
        if (response.status >= 400) {
            throw new AxiosError(`Request failed with status code ${response.status}`, 'ERR_BAD_REQUEST', config, {}, response);
        }
        return response;
    };
    adapter.calls = calls;
    return adapter;
}

const TOKEN_ROUTE = 'POST /api/v3/access/token';

function tokenResponse(token = 'token-1', expiresIn = 86400) {
    return {status: 200, data: {access_token: token, token_type: 'Bearer', expires_in: expiresIn, scope: 'ALL'}};
}

function createClient(routes = {}, options = {}) {
    const adapter = mockAdapter({[TOKEN_ROUTE]: tokenResponse(), ...routes});
    const tpp = new Tropipay({
        clientId: 'client-id',
        clientSecret: 'client-secret',
        environment: 'sandbox',
        httpAdapter: adapter,
        maxRetryDelay: 0,
        ...options,
    });
    return {tpp, adapter, calls: adapter.calls, apiCalls: () => adapter.calls.filter((c) => c.path !== TOKEN_ROUTE.slice(5))};
}

module.exports = {mockAdapter, tokenResponse, createClient, TOKEN_ROUTE};
