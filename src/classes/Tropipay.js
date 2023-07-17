const axios = require("axios");
const jwt = require('jsonwebtoken');
const TropipayPayment = require("./TropipayPayment");
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
            if (payload.exp && payload.exp < currentTimestamp) {
                //console.error('Error: Tropipay: Token expired');
                return false
            }
            return true;
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
                this.#request = axios.create({
                    baseURL: "https://tropipay-dev.herokuapp.com" || this.tppServerUrl[deployMode ?? "development"],
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

    async CreateMediationPaymentCard(payload) {
        if (!payload) {
            return { error : 'CreateMediationPaymentCard need a payload...' };
        }
        const payment = TropipayPayment.getInstance(this);
        return await payment.CreateMediationPaymentCard(payload);
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
}

module.exports = Tropipay;
