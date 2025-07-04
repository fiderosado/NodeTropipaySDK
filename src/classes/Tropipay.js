const axios = require("axios");
const jwt = require('jsonwebtoken');
const TropipayPayment = require("./TropipayPayment");
const TropipayDepositAccount = require("./TropipayDepositAccount");
const TropipayHooks = require("./TropipayHooks");

const tppConfig = {
    clientId: process.env.TROPIPAY_CLIENT_ID,
    clientSecret: process.env.TROPIPAY_CLIENT_SECRET,
    scopes: process.env.TROPIPAY_SCOPE,
    deployMode: process.env.NODE_ENV,
    tppServerUrl: process.env.TROPIPAY_SERVER,
};

class Tropipay {
    static _instance;
    #request;
    _render = 0;
    #_data = {};
    #_clientId;
    #_clientSecret;
    #_accessToken;
    #_refreshToken;
    #_scopes;
    #_deployMode;
    #_grantType;
    #_header;
    #_token_type;
    #_expires_in;
    #_tppServerUrl = "https://tropipay-dev.herokuapp.com";

    constructor() {
        console.log('- Tropipay: starting...');
        this._render += 1;
        /* INICIALIZAR VARIABLES */
        this.#_tppServerUrl = tppConfig.tppServerUrl || "https://tropipay-dev.herokuapp.com";
        this.#_accessToken = '';
        this.#_clientId = tppConfig.clientId;
        this.#_clientSecret = tppConfig.clientSecret;
        this.#_scopes = tppConfig.scopes;
        this.#_deployMode = tppConfig.deployMode;
        this.#_grantType = "client_credentials";
        this.#_header = tppConfig.header || {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
        this.#_data = {};
    }

    static getInstance() {
        if (!Tropipay._instance) {
            Tropipay._instance = new Tropipay();
        }
        return Tropipay._instance;
    }

    decodeAndValidateToken(token) {
        if (!token || !(typeof token === "string")) {
            //console.error('Error: Tropipay: the token params is empty...', token);
            return false;
        }
        try {
            const decodedToken = jwt.decode(token, {complete: true});
            const payload = decodedToken.payload;
            // Valida el tiempo de expiración del token
            const currentTimestamp = Math.floor(Date.now() / 1000) + 300; // adelanto el tiempo de expiracion a 5 minutos
            return !(payload.exp && payload.exp < currentTimestamp);
            
        } catch (error) {
            console.error('Error: Tropipay: Decoding or validating token:', error);
            return false;
        }
    }

    async Authorize() {
        const validToken = !(this.#_accessToken) ? false : this.decodeAndValidateToken(this.#_accessToken);
        if (!validToken) {
            //console.error('- Error: Tropipay: Authorize: Validating token error, autorizing...');
            if (!this.#request) {
                //console.error('- Error: Tropipay: Axios: Instance not exist, creating...');
                const baseURL = this.#_tppServerUrl || "https://tropipay-dev.herokuapp.com";
                this.#request = axios.create({
                    baseURL,
                    headers: this.#_header,
                });
                //if (this.#request) console.error('- Success: Tropipay: Axios: Instance is ready...');
            }
            return (async (context) => {
                const response = await context.#request.post(
                    "/api/v2/access/token",
                    {
                        client_id: context.#_clientId,
                        client_secret: context.#_clientSecret,
                        grant_type: context.#_grantType,
                        scope: context.#_scopes,
                    }, {
                        headers: context.#_header,
                    }
                )
                context.#_data = response.data;
                context.#_header.Authorization = `${response.data.token_type || "Bearer"} ${response.data.access_token}`;
                context.#_accessToken = response.data.access_token;
                context.#_refreshToken = response.data.refresh_token;
                context.#_expires_in = response.data.expires_in;
                context.#_token_type = response.data.token_type;
                Tropipay._instance = context;
                //console.error('- Success: Tropipay: Authorize is ready...');
                return context;
            })(this)
            return this
        } else {
            return this
        }
    }

    getData() {
        return this.#_data;
    }

    getHeader() {
        return this.#_header;
    }

    getTppServerUrl() {
        return this.#_tppServerUrl;
    }

    async CreateMediationPaymentCard(payload) {
        if (!payload) {
            return { error : 'CreateMediationPaymentCard need a payload...' };
        }
        const payment = TropipayPayment.getInstance(this);
        return await payment.CreateMediationPaymentCard(payload);
    }

    async GetDepositAccountsList() {
        const payment = TropipayDepositAccount.getInstance(this);
        return await payment.GetDepositAccountsList();
    }

    /* TODO:
    *   Create a new Deposit Account
    *   https://tpp.stoplight.io/docs/tropipay-api-doc/6bc05a0be7e81-create-a-new-deposit-account
    *   POST: https://tropipay-dev.herokuapp.com/api/v2/deposit_accounts
    */
    async CreateNewDepositAccount(payload) {
        if (!payload) {
            return { error : 'CreateNewDepositAccount need a payload...' };
        }
        const payment = TropipayDepositAccount.getInstance(this);
        return await payment.CreateNewDepositAccount(payload);
    }

    async CreatePaymentCard(paymentCardPayload) {
        if (!paymentCardPayload) {
            return { error : 'CreatePaymentCard need a PaymentCardPayload Model...' };
        }
        const payment = TropipayPayment.getInstance(this);
        return await payment.CreatePaymentCard( paymentCardPayload )
    }

    /*
    *  TODO: Get a list with all events that allow a subscription
    *   Endpoint for get full list of available events.
    *   Events are made up of an object with two fundamental properties (name, description)
    */
    async GetEventsAllowSubscriptionList() {
        const hooksi = TropipayHooks.getInstance(this);
        return await hooksi.GetEventsAllowSubscriptionList();
    }

    /*
    *  TODO: Get a list of all events subscribed with Hooks
    *   Endpoint for getting event hooks list by merchant.
    *   Events are made up of an object with three fundamental properties (event, target, value)
    *   https://tpp.stoplight.io/docs/tropipay-api-doc/a02a3c816f111-get-a-list-of-all-events-subscribed-with-hooks
    *   GET: https://tropipay-dev.herokuapp.com/api/v2/merchant/hooks
    */
    async GetEventsSubscribedHooksList() {
        const hooksi = TropipayHooks.getInstance(this);
        return await hooksi.GetEventsSubscribedHooksList();
    }

    /**
     * TODO:Subscribe to new event with a hook
     *  Endpoint allows a merchant to subscribe to an event, specifying the options to receive information at the time it is trigger.
     *  https://tpp.stoplight.io/docs/tropipay-api-doc/0b7235bfedb66-subscribe-to-new-event-with-a-hook
     *  POST: https://tropipay-dev.herokuapp.com/api/v2/hooks , Authorization required Bearer {token}
     */
    async SubscribeNewEventHook(payload) {
        if (!payload) {
            return { error : 'SubscribeNewEventHook need a payload...' };
        }
        const hooksi = TropipayHooks.getInstance(this);
        return await hooksi.SubscribeNewEventHook(payload);
    }
}

module.exports = Tropipay;
