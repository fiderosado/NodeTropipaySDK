const axios = require("axios");
const jwt = require('jsonwebtoken');

function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {'default': e};
}

var axios__default = _interopDefaultLegacy(axios);

class Tropipay {
    static instance;
    rendered = 0;
    #request;
    static tppServerUrl = {
        development: "https://tropipay-dev.herokuapp.com",
        production: "https://www.tropipay.com"

    };
    #_clientId;
    #_clientSecret;
    #_accessToken;
    #_refreshToken;
    #_dataAutorization;
    #_scopes;
    #_deployMode;
    #_grantType;
    #_header;
    #_token_type;
    #_expires_in;

    constructor({
                    clientId,
                    clientSecret,
                    scopes,
                    deployMode,
                    header,
                    accessToken,
                    refreshToken,
                    token_type,
                    expires_in
                }) {//, tppServerUrl
        this.rendered = this.rendered + 1;
        this.#_clientId = clientId;
        this.#_clientSecret = clientSecret;
        this.#_scopes = scopes;
        this.#_deployMode = deployMode;
        this.#_grantType = "client_credentials";
        this.#_header = header || {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
        this.#request = axios__default["default"].create({
            baseURL: "https://tropipay-dev.herokuapp.com" || this.tppServerUrl[deployMode ?? "development"],
            headers: this.#_header,
        });
        this.#_accessToken = accessToken || '';
        this.#_refreshToken = refreshToken || '';
        this.#_token_type = token_type || 'Bearer';
        this.#_expires_in = expires_in || 0;
        console.info("- Tropipay Instance Created...");
    }

    static setConfig(tppConfig) {
        if (!Tropipay.instance) {
            Tropipay.instance = new Tropipay(tppConfig);
        }
        return Tropipay.instance;
    }

    async getAuthorization() {
        const validToken = await this.decodeAndValidateToken(this.#_accessToken);
        if ( !validToken ) {
            const auth = await new Promise((resolve, reject) => {
                this.#request
                    .post(
                        "/api/v2/access/token",
                        {
                            client_id: this.#_clientId,
                            client_secret: this.#_clientSecret,
                            grant_type: this.#_grantType,
                            scope: this.#_scopes,
                        },
                        {
                            headers: this.#_header,
                        }
                    )
                    .then(({data}) => {
                        this.#_dataAutorization = data;
                        this.setAccessToken({token: data.access_token, type: data.token_type});
                        this.setRefreshToken(data.refresh_token);
                        this.setExpiresIn(data.expires_in);
                        this.setTokenType(data.token_type);
                        console.info("- Tropipay Authorization Successful...", data);
                        resolve(this);
                    })
                    .catch((error) => {
                        console.error("- Error: Tropipay SDK has an error: ", error);
                        if (axios__default["default"].isAxiosError(error)) {
                            reject(
                                new Error(
                                    `Could not obtain the access token from credentials  ${error}`
                                )
                            );
                        }
                        reject(new Error(`- Error: Tropipay SDK -> getAuthorization -> Error: ${error}`));
                    });
            });
        }
        return this;
    }

    Authorize() {
        this.getAuthorization();
        return this;
    }

    getInstance() {
        return this;
    }

    getRendered() {
        return this.rendered;
    }

    setAccessToken({token, type}) {
        this.#_header.Authorization = `${type || "Bearer"} ${token}`;
        this.#_accessToken = token;
    }

    setRefreshToken(token) {
        this.#_refreshToken = token;
    }

    setTokenType(type) {
        this.#_token_type = type;
    }

    setExpiresIn(time) {
        this.#_expires_in = time;
    }

    getDataAutorization() {
        return this.#_dataAutorization;
    }

    async decodeAndValidateToken(token) {
        if (!token || !(typeof token === "string")){
            console.error('Error: Tropipay: the token params is empty...');
            return false;
        }
        try {
            // Decodifica el token en base64
            const decodedToken = jwt.decode(token, {complete: true});

            // Obtiene el payload del token decodificado
            const payload = decodedToken.payload;

            // Valida el tiempo de expiración del token
            const currentTimestamp = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
            if (payload.exp && payload.exp < currentTimestamp) {
                console.error('Error: Tropipay: Token expired');
                return false
            }
            return true;
        } catch (error) {
            console.error('Error: Tropipay: Decoding or validating token:', error);
            return false;
        }
    }

}

module.exports = Tropipay;
