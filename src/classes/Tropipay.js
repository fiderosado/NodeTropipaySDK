const axios = require("axios");

function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {'default': e};
}

var axios__default = _interopDefaultLegacy(axios);

class Tropipay {
    static _instance;
    static tppServerUrl = {
        development: "https://tropipay-dev.herokuapp.com",
        production: "https://www.tropipay.com"

    };
    #_dataAutorization;
    constructor({clientId, clientSecret, scopes, deployMode , header , accessToken , refreshToken , token_type , expires_in}) {//, tppServerUrl
        this._clientId = clientId;
        this._clientSecret = clientSecret;
        this._scopes = scopes;
        this._deployMode = deployMode;
        this._grantType = "client_credentials";
        this._header = header || {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
        this.request = axios__default["default"].create({
            baseURL: "https://tropipay-dev.herokuapp.com" || this.tppServerUrl[deployMode ?? "development"],
            headers: this._header,
        });
        this._accessToken = accessToken||'';
        this._refreshToken = refreshToken||'';
        this._token_type = token_type || 'Bearer';
        this._expires_in = expires_in || 0;
        console.info("- Tropipay Instance Created...");
    }

    static setConfig(tppConfig) {
        if (!Tropipay._instance) {
            Tropipay._instance = new Tropipay(tppConfig);
        }
        return Tropipay._instance;
    }

    getInstance() {
        return this;
    }

    async getAuthorization() {
        try {
            const {data} = await this.request.post(
                "/api/v2/access/token",
                {
                    client_id: this._clientId,
                    client_secret: this._clientSecret,
                    grant_type: this._grantType,
                    scope: this._scopes,
                },
                {
                    headers: this._header,
                }
            );
            this.#_dataAutorization = data;
            this.setAccessToken({token: data.access_token, type: data.token_type});
            this.setRefreshToken(data.refresh_token);
            this.setExpiresIn(data.expires_in);
            this.setTokenType(data.token_type);
            console.info("- Tropipay Autorization Successful...", data);
            //return this;
        } catch (error) {
            console.error("- Error: Tropipay SDK has an error: ", error);
            if (axios__default["default"].isAxiosError(error)) {
                throw new Error(
                    `Could not obtain the access token from credentials  ${error}`
                );
            }
            throw new Error(`- Error: Tropipay SDK -> getAuthorization -> Error: ${error}`);
        }

    }

    Authorize() {
        return this.getAuthorization().then(() => this);
    }

    setAccessToken({token, type}) {
        this._header.Authorization = `${type || "Bearer"} ${token}`;
        this._accessToken = token;
    }

    setRefreshToken(token) {
        this._refreshToken = token;
    }

    setTokenType(type) {
        this._token_type = type;
    }

    setExpiresIn(time) {
        this._expires_in = time;
    }

    getDataAutorization() {
        return this.#_dataAutorization;
    }
}

module.exports = Tropipay;
