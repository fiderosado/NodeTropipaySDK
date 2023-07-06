const axios = require("axios");

function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {'default': e};
}

var axios__default = _interopDefaultLegacy(axios);

class Tropipay {
    static instance;
    static tppServerUrl = {
        "production": "https://www.tropipay.com",
        "development": "https://tropipay-dev.herokuapp.com"
    };
    static clientId;
    static clientSecret;
    static request;
    static dataAutorization;
    static deployMode;
    static grantType = "client_credentials";
    static _headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    static _accessToken;
    static _refreshToken;
    static _token_type;
    static _expires_in;
    static _scopes;

    constructor({clientId, clientSecret, scopes, deployMode}) {//, tppServerUrl
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this._scopes = scopes;
        this.deployMode = deployMode;
        this._headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
        this.grantType = "client_credentials";
        this.request = axios__default["default"].create({
            baseURL: Tropipay.tppServerUrl[deployMode || "development"],
            headers: this._headers,
        });
        console.info("- Tropipay Instance Created...");
    }

    static getInstance(clientCredentials) {
        if (!this.instance) {
            this.instance = new Tropipay(clientCredentials);
        }
        return this.instance;
    }

    async getAuthorization() {
        try {
            const {data} = await this.request.post(
                "/api/v2/access/token",
                {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: this.grantType,
                    scope: this._scopes,
                },
                {
                    headers: this._headers,
                }
            );
            this.dataAutorization = data;
            this.setAccessToken(data.access_token, data.token_type);
            this.setRefreshToken(data.refresh_token);
            this.setExpiresIn(data.expires_in);
            this.setTokenType(data.token_type);
            console.info("- Tropipay Autorization Successful...", data);
            return this.instance;

        } catch (error) {
            console.error("- Error: Tropipay SDK has an error: ", error );
            if (axios__default["default"].isAxiosError(error)) {
                throw new Error(
                    `Could not obtain the access token from credentials  ${error}`
                );
            }
            throw new Error(`- Error: Tropipay SDK -> getAuthorization -> Error: ${error}`);
        }

    }


    async setAccessToken(token, type) {
        this._headers.Authorization = `${type || "Bearer"} ${token}`;
        this._accessToken = token;
    }

    async setRefreshToken(token) {
        this._refreshToken = token;
    }

    async setTokenType(type) {
        this._token_type = type;
    }

    async setExpiresIn(time) {
        this._expires_in = time;
    }

    static get getDataAutorization() {
        return this.dataAutorization;
    }
}

module.exports = Tropipay;
