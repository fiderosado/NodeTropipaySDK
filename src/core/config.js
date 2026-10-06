//TropipayConfig resolution
const {TropipayConfigError} = require('./errors');

const ENVIRONMENTS = {
    sandbox: 'https://sandbox.tropipay.me',
    production: 'https://www.tropipay.com',
};

const API_PATH = '/api/v3';
const LEGACY_API_PATH = '/api/v2';

const DEFAULTS = {
    timeout: 30000,
    maxRetries: 2,
    maxRetryDelay: 10000,
    tokenRefreshMargin: 300,
    validate: true,
};

const noopLogger = {debug() {}, info() {}, warn() {}, error() {}};

const emittedWarnings = new Set();

function warnOnce(code, message) {
    if (emittedWarnings.has(code)) return;
    emittedWarnings.add(code);
    process.emitWarning(message, {code});
}

/**
 * Accepts "https://sandbox.tropipay.me", "https://sandbox.tropipay.me/" or "https://sandbox.tropipay.me/api/v3"
 * and returns the bare server url.
 */
function normalizeServerUrl(url) {
    return String(url).trim().replace(/\/+$/, '').replace(/\/api(\/v\d+)?$/, '');
}

const pick = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

/**
 * Builds the final config from explicit options (or a TropipayConfig instance) with process.env as fallback.
 * Env keys: TROPIPAY_CLIENT_ID, TROPIPAY_CLIENT_SECRET, TROPIPAY_SCOPE, TROPIPAY_SERVER, TROPIPAY_ENV.
 */
function resolveConfig(options = {}, env = process.env) {
    const input = options && typeof options.toObject === 'function' ? options.toObject() : (options || {});

    const explicitServer = pick(input.serverUrl, input.tppServerUrl, env.TROPIPAY_SERVER);
    let environment = pick(input.environment, env.TROPIPAY_ENV);
    environment = environment ? String(environment).toLowerCase() : undefined;

    if (environment && !ENVIRONMENTS[environment]) {
        throw new TropipayConfigError(
            `Unknown Tropipay environment "${environment}". Use one of: ${Object.keys(ENVIRONMENTS).join(', ')}`,
            ['environment'],
        );
    }

    let serverUrl;
    if (explicitServer) {
        serverUrl = normalizeServerUrl(explicitServer);
    } else if (environment) {
        serverUrl = ENVIRONMENTS[environment];
    } else {
        environment = 'sandbox';
        serverUrl = ENVIRONMENTS.sandbox;
        warnOnce(
            'SERTROPIPAY_DEFAULT_SANDBOX',
            'sertropipay: no TROPIPAY_SERVER / TROPIPAY_ENV configured, using the sandbox environment.',
        );
    }

    if (/herokuapp\.com/i.test(serverUrl)) {
        warnOnce(
            'SERTROPIPAY_LEGACY_SERVER',
            `sertropipay: ${serverUrl} is the legacy Tropipay dev server. The API v3 sandbox is ${ENVIRONMENTS.sandbox}`,
        );
    }

    if (!environment) {
        environment = Object.keys(ENVIRONMENTS).find((key) => ENVIRONMENTS[key] === serverUrl) || 'custom';
    }

    const logger = input.logger || noopLogger;

    return {
        clientId: pick(input.clientId, env.TROPIPAY_CLIENT_ID),
        clientSecret: pick(input.clientSecret, env.TROPIPAY_CLIENT_SECRET),
        scopes: pick(input.scopes, env.TROPIPAY_SCOPE),
        deployMode: pick(input.deployMode, env.NODE_ENV),
        environment,
        serverUrl,
        apiPath: pick(input.apiPath, API_PATH),
        legacyApiPath: pick(input.legacyApiPath, LEGACY_API_PATH),
        headers: {...(input.header || {}), ...(input.headers || {})},
        accessToken: pick(input.accessToken),
        expiresIn: pick(input.expires_in, input.expiresIn),
        tokenType: pick(input.token_type, input.tokenType),
        deviceId: pick(input.deviceId),
        timeout: pick(input.timeout, DEFAULTS.timeout),
        maxRetries: pick(input.maxRetries, DEFAULTS.maxRetries),
        maxRetryDelay: pick(input.maxRetryDelay, DEFAULTS.maxRetryDelay),
        tokenRefreshMargin: pick(input.tokenRefreshMargin, DEFAULTS.tokenRefreshMargin),
        validate: input.validate === undefined ? DEFAULTS.validate : Boolean(input.validate),
        userAgent: input.userAgent,
        httpAdapter: input.httpAdapter,
        logger: {...noopLogger, ...logger},
    };
}

module.exports = {
    ENVIRONMENTS,
    API_PATH,
    LEGACY_API_PATH,
    DEFAULTS,
    resolveConfig,
    normalizeServerUrl,
};
