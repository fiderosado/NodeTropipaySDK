const {resolveConfig} = require('../core/config');
const {HttpClient} = require('../core/HttpClient');
const Users = require('../resources/Users');
const Accounts = require('../resources/Accounts');
const Movements = require('../resources/Movements');
const Transfers = require('../resources/Transfers');
const PaymentCards = require('../resources/PaymentCards');
const Beneficiaries = require('../resources/Beneficiaries');
const Hooks = require('../resources/Hooks');
const ScheduledTransactions = require('../resources/ScheduledTransactions');
const webhooks = require('../webhooks');

const LEGACY = {validate: false};

const legacyError = (error) => (error && error.raw) || {message: error && error.message};

/**
 * Tropipay API v3 client.
 *
 * Keeps the original idea of the SDK: one authorized instance shared by the server side.
 *   const tpp = await Tropipay.getInstance().Authorize();
 *   const card = await tpp.paymentCards.create({...});
 *
 * Several accounts can live side by side with `new Tropipay({...})`.
 */
class Tropipay {
    static _instance;
    #config;
    #http;

    /**
     * @param {object|import('./TropipayConfig')} [options] - see README "Configuration". process.env is the fallback.
     */
    constructor(options = {}) {
        this.#config = resolveConfig(options);
        this.#http = new HttpClient(this.#config);

        this.users = new Users(this);
        this.movements = new Movements(this);
        this.accounts = new Accounts(this, this.movements);
        this.transfers = new Transfers(this);
        this.paymentCards = new PaymentCards(this, this.#config.serverUrl);
        this.beneficiaries = new Beneficiaries(this);
        this.depositAccounts = this.beneficiaries;
        this.hooks = new Hooks(this);
        this.scheduledTransactions = new ScheduledTransactions(this);
    }

    /**
     * Shared instance (created on first call). Options are only used the first time;
     * use Tropipay.configure() to replace the shared instance.
     */
    static getInstance(options) {
        if (!Tropipay._instance) {
            Tropipay._instance = new Tropipay(options);
        }
        return Tropipay._instance;
    }

    /** Replaces the shared instance with a new one built from `options`. */
    static configure(options) {
        Tropipay._instance = new Tropipay(options);
        return Tropipay._instance;
    }

    /** Creates an independent instance (multi account). */
    static create(options) {
        return new Tropipay(options);
    }

    /**
     * Obtains (or reuses) the client_credentials token. Concurrent calls share one request and
     * the token is renewed automatically before it expires, so calling this is optional.
     * @param {{force?: boolean}} [params]
     * @returns {Promise<Tropipay>}
     */
    async authorize({force = false} = {}) {
        await this.#http.tokens.getAuthorization({force});
        return this;
    }

    /** Legacy name of authorize(). */
    async Authorize() {
        return this.authorize();
    }

    /**
     * Generic request to any API v3 endpoint not covered by a resource.
     * @param {{method?: string, path: string, query?: object, body?: any, headers?: object, token?: string,
     *   deviceId?: string, auth?: boolean, baseUrl?: string, signal?: AbortSignal}} request
     */
    request(request) {
        return this.#http.request(request);
    }

    isAuthorized() {
        return this.#http.tokens.isValid();
    }

    getAccessToken() {
        return this.#http.tokens.getAccessToken();
    }

    /** Uses an externally obtained token (e.g. a user-level token) as the managed one. */
    setAccessToken(accessToken, {expiresIn, tokenType} = {}) {
        this.#http.tokens.setToken({access_token: accessToken, expires_in: expiresIn, token_type: tokenType});
        return this;
    }

    /** Public configuration (the client secret is never returned). */
    getConfig() {
        const {clientSecret, httpAdapter, logger, accessToken, ...safe} = this.#config;
        return {...safe, hasClientSecret: Boolean(clientSecret)};
    }

    getBaseUrl() {
        return this.#http.baseUrl;
    }

    /** Last token response ({ access_token, token_type, expires_in, scope, ... }). */
    getData() {
        return this.#http.tokens.getData();
    }

    /** Default headers including the current Authorization header (legacy). */
    getHeader() {
        const header = {'Content-Type': 'application/json', Accept: 'application/json'};
        const authorization = this.#http.tokens.getAuthorizationHeader();
        if (authorization) header.Authorization = authorization;
        return header;
    }

    getTppServerUrl() {
        return this.#config.serverUrl;
    }

    /**
     * Verifies the `signatureV3` of a payment card urlNotification payload with this instance credentials.
     */
    verifyPaymentNotification(payload) {
        return webhooks.verifyPaymentNotification(payload, this.#config);
    }

    /**
     * Verifies the X-Tropipay-Signature header of a hook request.
     */
    verifyHookSignature(rawBody, signature, secret) {
        return webhooks.verifyHookSignature({rawBody, signature, secret});
    }

    /* ---------------------------------------------------------------------------------------------
     * Legacy API (1.x). Same names and return shapes as before, now backed by API v3.
     * They never throw: they return the data, `false` or `{ error }` as they used to.
     * ------------------------------------------------------------------------------------------- */

    /** @deprecated use paymentCards.create() */
    async CreatePaymentCard(paymentCardPayload) {
        if (!paymentCardPayload) {
            return {error: 'CreatePaymentCard need a PaymentCardPayload Model...'};
        }
        try {
            const data = await this.paymentCards.create(paymentCardPayload, LEGACY);
            return {success: {data}};
        } catch (error) {
            return {error: legacyError(error)};
        }
    }

    /** @deprecated use paymentCards.createMediation() */
    async CreateMediationPaymentCard(payload) {
        if (!payload) {
            return {error: 'CreateMediationPaymentCard need a payload...'};
        }
        return this.paymentCards.createMediation(payload, LEGACY).catch(() => false);
    }

    /** @deprecated use beneficiaries.list() */
    async GetDepositAccountsList() {
        return this.beneficiaries.list({}, LEGACY).catch(() => false);
    }

    /** @deprecated use beneficiaries.create() */
    async CreateNewDepositAccount(payload) {
        if (!payload) {
            return {error: 'CreateNewDepositAccount need a payload...'};
        }
        return this.beneficiaries.create(payload, LEGACY).catch(() => false);
    }

    /** @deprecated use hooks.listEvents() */
    async GetEventsAllowSubscriptionList() {
        return this.hooks.listEvents(LEGACY).catch(() => false);
    }

    /** @deprecated use hooks.list() */
    async GetEventsSubscribedHooksList() {
        return this.hooks.list(LEGACY).catch(() => false);
    }

    /** @deprecated use hooks.subscribe() */
    async SubscribeNewEventHook(payload) {
        if (!payload) {
            return {error: 'SubscribeNewEventHook need a payload...'};
        }
        return this.hooks.subscribe(payload, LEGACY).catch(() => false);
    }
}

module.exports = Tropipay;
