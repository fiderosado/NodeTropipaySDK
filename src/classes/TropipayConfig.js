/**
 * Explicit configuration for a Tropipay instance. A plain object with the same keys works too.
 * Every key is optional; missing values are read from process.env.
 */
class TropipayConfig {
    constructor({
                    clientId,
                    clientSecret,
                    scopes,
                    deployMode,
                    environment,
                    serverUrl,
                    tppServerUrl,
                    header,
                    headers,
                    accessToken,
                    refreshToken,
                    token_type,
                    expires_in,
                    deviceId,
                    timeout,
                    maxRetries,
                    maxRetryDelay,
                    tokenRefreshMargin,
                    validate,
                    userAgent,
                    logger,
                    httpAdapter,
                } = {}) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
        this.deployMode = deployMode;
        this.environment = environment;
        this.serverUrl = serverUrl;
        this.tppServerUrl = tppServerUrl;
        this.header = header;
        this.headers = headers;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.token_type = token_type;
        this.expires_in = expires_in;
        this.deviceId = deviceId;
        this.timeout = timeout;
        this.maxRetries = maxRetries;
        this.maxRetryDelay = maxRetryDelay;
        this.tokenRefreshMargin = tokenRefreshMargin;
        this.validate = validate;
        this.userAgent = userAgent;
        this.logger = logger;
        this.httpAdapter = httpAdapter;
    }

    toObject() {
        return {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            scopes: this.scopes,
            deployMode: this.deployMode,
            environment: this.environment,
            serverUrl: this.serverUrl,
            tppServerUrl: this.tppServerUrl,
            header: this.header,
            headers: this.headers,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            token_type: this.token_type,
            expires_in: this.expires_in,
            deviceId: this.deviceId,
            timeout: this.timeout,
            maxRetries: this.maxRetries,
            maxRetryDelay: this.maxRetryDelay,
            tokenRefreshMargin: this.tokenRefreshMargin,
            validate: this.validate,
            userAgent: this.userAgent,
            logger: this.logger,
            httpAdapter: this.httpAdapter,
        };
    }
}

module.exports = TropipayConfig;
