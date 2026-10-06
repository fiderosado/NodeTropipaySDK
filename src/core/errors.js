//TropipayErrors

/**
 * Base error for every failure produced by the SDK.
 * It never stores request headers, so the bearer token or the client secret can not leak through it.
 */
class TropipayError extends Error {
    constructor(message, {
        status,
        code,
        type,
        details,
        param,
        i18n,
        raw,
        rateLimit,
        method,
        path,
        cause,
    } = {}) {
        super(message);
        this.name = 'TropipayError';
        this.status = status;
        this.code = code;
        this.type = type;
        this.details = details;
        this.param = param;
        this.i18n = i18n;
        this.raw = raw;
        this.rateLimit = rateLimit;
        this.method = method;
        this.path = path;
        if (cause) Object.defineProperty(this, 'cause', {value: cause, enumerable: false});
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            code: this.code,
            type: this.type,
            details: this.details,
            param: this.param,
            i18n: this.i18n,
            raw: this.raw,
            rateLimit: this.rateLimit,
            method: this.method,
            path: this.path,
        };
    }
}

/**
 * Thrown before calling the API when a payload does not satisfy the documented contract.
 */
class TropipayValidationError extends TropipayError {
    constructor(message, errors = []) {
        super(message, {code: 'SDK_VALIDATION_ERROR', type: 'validation_error', details: errors});
        this.name = 'TropipayValidationError';
        this.errors = errors;
    }
}

/**
 * Thrown when the SDK is missing configuration (credentials, server, etc.).
 */
class TropipayConfigError extends TropipayError {
    constructor(message, missing = []) {
        super(message, {code: 'SDK_CONFIG_ERROR', type: 'config_error', details: missing});
        this.name = 'TropipayConfigError';
        this.missing = missing;
    }
}

/**
 * Normalizes the error bodies documented by Tropipay. Both shapes exist in the v3 docs:
 *  - nested: { error: { type, code, message, details, i18n, param } }
 *  - flat:   { error: "invalid_request", message: "...", code: "E00123" }
 */
function parseErrorBody(body) {
    if (!body) return {};
    if (typeof body === 'string') return {message: body};
    if (typeof body !== 'object') return {};
    const {error} = body;
    if (error && typeof error === 'object') {
        return {
            message: error.message,
            code: error.code,
            type: error.type,
            details: error.details,
            param: error.param,
            i18n: error.i18n,
        };
    }
    if (typeof error === 'string') {
        return {message: body.message || error, code: body.code || error, type: error, details: body.details};
    }
    return {message: body.message, code: body.code, type: body.type, details: body.details};
}

function readHeader(headers, name) {
    if (!headers) return undefined;
    if (typeof headers.get === 'function') {
        const value = headers.get(name);
        if (value !== undefined && value !== null) return value;
    }
    return headers[name] ?? headers[name.toLowerCase()];
}

function parseRateLimit(headers) {
    const limit = readHeader(headers, 'x-ratelimit-limit');
    const remaining = readHeader(headers, 'x-ratelimit-remaining');
    const reset = readHeader(headers, 'x-ratelimit-reset');
    const retryAfter = readHeader(headers, 'retry-after');
    if ([limit, remaining, reset, retryAfter].every((v) => v === undefined || v === null)) return undefined;
    const toNumber = (v) => (v === undefined || v === null || v === '' ? undefined : Number(v));
    return {
        limit: toNumber(limit),
        remaining: toNumber(remaining),
        reset: toNumber(reset),
        retryAfter: toNumber(retryAfter),
    };
}

/**
 * Converts an axios error into a TropipayError without copying the request config (it holds the token).
 */
function fromAxiosError(error, {method, path} = {}) {
    if (error instanceof TropipayError) return error;
    const response = error && error.response;
    if (response) {
        const parsed = parseErrorBody(response.data);
        const message = parsed.message || `Tropipay request failed with status ${response.status}`;
        return new TropipayError(message, {
            ...parsed,
            status: response.status,
            raw: response.data,
            rateLimit: parseRateLimit(response.headers),
            method,
            path,
        });
    }
    return new TropipayError((error && error.message) || 'Tropipay request failed', {
        code: (error && error.code) || 'NETWORK_ERROR',
        type: 'network_error',
        method,
        path,
    });
}

module.exports = {
    TropipayError,
    TropipayValidationError,
    TropipayConfigError,
    parseErrorBody,
    parseRateLimit,
    fromAxiosError,
};
