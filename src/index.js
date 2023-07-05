const axios = require("axios");
import {ClientCredentials} from "./classes/ClientCredentials";
class Tropipay {

    static instance = this;
    static tppServerUrl = {
        "production": "https://www.tropipay.com",
        "development": "https://tropipay-dev.herokuapp.com"
    };
    static clientId;
    static clientSecret;
    static request;
    static deployMode;
    static grant_type = "client_credentials";
    static _headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };
    static _accessToken;
    static _refreshToken;
    static _token_type;
    static _expires_in;
    static _scopes;

    constructor(clientCredentials) {
        if (clientCredentials) {
            Tropipay._scopes = clientCredentials.scopes;
            Tropipay.clientId = clientCredentials.client_id;
            Tropipay.clientSecret = clientCredentials.client_secret;
            Tropipay.deployMode = clientCredentials.deploy_mode;
            Tropipay.tppServerUrl = clientCredentials.tpp_server_url;
            Tropipay.request = axios.create({
                baseURL: Tropipay.tppServerUrl[Tropipay.deployMode || "development"],
                headers: Tropipay._headers,
            });
        }
    }

    static getInstance(clientCredentials) {
        if (!Tropipay.instance) {
            Tropipay.instance = new Tropipay(clientCredentials);
        }
        return Tropipay.instance;
    }

    static set setAccessToken(value) {
        this._headers.Authorization = `Bearer ${value}`;
        this._accessToken = value;
    }
    static set setRefreshToken(value) {
        this._refreshToken = value;
    }

    static set setTokenType(value) {
        this._token_type = value;
    }

    static set setExpiresIn(value) {
        this._expires_in = value;
    }
}

module.exports = { Tropipay , ClientCredentials };