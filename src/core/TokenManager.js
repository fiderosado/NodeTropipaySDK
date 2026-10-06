//TropipayTokenManager
const {TropipayConfigError, fromAxiosError} = require('./errors');
const {decodeJwtPayload} = require('./utils');
const TropipayEndpoints = require('../classes/TropipayEndpoints');

/**
 * `expires_in` is documented as seconds (86400) but one example returns an epoch (1741987517).
 * Both are supported, with the JWT `exp` claim as fallback.
 */
function computeExpiresAt(expiresIn, accessToken, now = Date.now()) {
    const value = Number(expiresIn);
    if (Number.isFinite(value) && value > 0) {
        if (value > 1e12) return value;
        if (value > 1e9) return value * 1000;
        return now + value * 1000;
    }
    const payload = decodeJwtPayload(accessToken);
    if (payload && Number.isFinite(Number(payload.exp))) return Number(payload.exp) * 1000;
    return null;
}

/**
 * Keeps the client_credentials token alive: caches it, refreshes it before it expires
 * and shares a single in-flight request between concurrent callers.
 */
class TokenManager {
    #config;
    #http;
    #pending = null;
    #accessToken = null;
    #tokenType = 'Bearer';
    #expiresAt = null;
    #marginMs = 0;
    #data = {};

    constructor(config, http) {
        this.#config = config;
        this.#http = http;
        if (config.accessToken) {
            this.setToken({
                access_token: config.accessToken,
                token_type: config.tokenType,
                expires_in: config.expiresIn,
            });
        }
    }

    canRefresh() {
        return Boolean(this.#config.clientId && this.#config.clientSecret);
    }

    setToken(data = {}) {
        const now = Date.now();
        this.#data = {...data};
        this.#accessToken = data.access_token || null;
        this.#tokenType = data.token_type || 'Bearer';
        this.#expiresAt = computeExpiresAt(data.expires_in, this.#accessToken, now);
        const lifetime = this.#expiresAt ? this.#expiresAt - now : Infinity;
        this.#marginMs = Math.max(0, Math.min(this.#config.tokenRefreshMargin * 1000, lifetime / 2));
    }

    invalidate() {
        this.#accessToken = null;
        this.#expiresAt = null;
    }

    isValid() {
        if (!this.#accessToken) return false;
        if (this.#expiresAt === null) return true;
        return Date.now() < this.#expiresAt - this.#marginMs;
    }

    getData() {
        return this.#data;
    }

    getAccessToken() {
        return this.#accessToken;
    }

    getExpiresAt() {
        return this.#expiresAt;
    }

    getAuthorizationHeader() {
        return this.#accessToken ? `${this.#tokenType} ${this.#accessToken}` : undefined;
    }

    /**
     * Returns a valid "Bearer <token>" header value, requesting a new token when needed.
     */
    async getAuthorization({force = false} = {}) {
        if (!force && this.isValid()) return this.getAuthorizationHeader();
        if (!this.canRefresh()) {
            if (this.#accessToken && !force) return this.getAuthorizationHeader();
            throw new TropipayConfigError(
                'Tropipay: clientId and clientSecret are required to obtain an access token',
                ['clientId', 'clientSecret'].filter((key) => !this.#config[key]),
            );
        }
        if (!this.#pending) {
            this.#pending = this.#requestToken().finally(() => {
                this.#pending = null;
            });
        }
        await this.#pending;
        return this.getAuthorizationHeader();
    }

    async #requestToken() {
        const path = TropipayEndpoints.access.token;
        const body = {
            grant_type: 'client_credentials',
            client_id: this.#config.clientId,
            client_secret: this.#config.clientSecret,
        };
        if (this.#config.scopes) body.scope = this.#config.scopes;
        this.#config.logger.debug('Tropipay: requesting access token');
        try {
            const response = await this.#http.post(path, body);
            this.setToken(response.data);
            this.#config.logger.debug('Tropipay: access token ready');
            return response.data;
        } catch (error) {
            const tppError = fromAxiosError(error, {method: 'POST', path});
            this.#config.logger.error(`Tropipay: token request failed (${tppError.status || tppError.code})`);
            throw tppError;
        }
    }
}

module.exports = {TokenManager, computeExpiresAt};
