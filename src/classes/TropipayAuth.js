//TropipayAuth;
//const { setCookie, deleteCookie } = require('cookies-next')
const axios = require('axios');
const Crypto = require('crypto')
const TropipayEndpoints = require('./TropipayEndpoints');
const AppUrl = process.env.APP_URL;
const tppConfig = {
    clientId: process.env.TROPIPAY_CLIENT_ID,
    clientSecret: process.env.TROPIPAY_CLIENT_SECRET,
    scopes: process.env.TROPIPAY_SCOPE_FRONT,
    challengeMethod: process.env.CODE_CHALLENGE_METHOD,
    tppServerUrl: process.env.TROPIPAY_SERVER,
    responseType: 'code'
}
const deleteWhiteSpaces = (url) => {
    return url.replace(/\s+/g, "");
}

const queryStringToJson = (queryString) => {
    return Object.fromEntries(new URLSearchParams(queryString));
}

const jsonToQueryString = (obj) => {
    const queryParams = new URLSearchParams(Object.entries(obj));
    return queryParams.toString();
}

class TropipayAuth {

    #authorizeUrl;
    #authorizationTokenUrl;
    #userProfileUrl;
    #redirectUrl;
    #defaultHeaders;

    base64URLEncode (str) {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')
    }

    sha256 (buffer) {
        return Crypto
            .createHash('sha256')
            .update(buffer)
            .digest()
    }

    constructor () {
        this.#redirectUrl = (AppUrl + '/api/auth/callback');
        this.#authorizeUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.access.authorize
        this.#authorizationTokenUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.access.token,
            this.#userProfileUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.users.profile,
            this.#defaultHeaders = { 'Content-Type': 'application/json' }
    }

    Login (params) {

        const randomBytes = Crypto.randomBytes(64);
        const codeVerifier = this.base64URLEncode(randomBytes);
        const codeChallenge = this.base64URLEncode(this.sha256(codeVerifier));
        const state = Crypto.randomBytes(8).toString('hex');

        const urlToRedirect = `${this.#redirectUrl} ${ params ? `?${jsonToQueryString(params??{})}&`:"" }`

        let urlParams = new URLSearchParams({
            response_type: tppConfig.responseType,
            client_id: tppConfig.clientId,
            code_challenge: codeChallenge,
            code_challenge_method: tppConfig.challengeMethod,
            state: state,
            scope: tppConfig.scopes,
            redirect_uri : deleteWhiteSpaces(urlToRedirect)
        })

        return {
            url: deleteWhiteSpaces(`${this.#authorizeUrl}?${urlParams.toString()}`) ,
            code_verifier: codeVerifier,
            state: state
        }
    }

    async GetAuthorizationToken (authorizationCode, codeVerifier) {
        if (!authorizationCode || !codeVerifier) return false
        const authorizationTokenResponse = await axios.post(
            this.#authorizationTokenUrl,
            {
                grant_type: 'authorization_code',
                code: authorizationCode,
                client_id: tppConfig.clientId,
                client_secret: tppConfig.clientSecret,
                redirect_uri: AppUrl,
                code_verifier: codeVerifier,
                scope: tppConfig.scopes,
            },
            {
                headers: this.#defaultHeaders,
            }
        )
        if (authorizationTokenResponse.status == 200) {
            return authorizationTokenResponse.data
        }
        return false
    }

    async GetProfile(accessToken , tokenType){
        if (!accessToken) return false
        const userProfileResponse = await axios.get(
            this.#userProfileUrl,
            {
                headers: { ...this.#defaultHeaders , ...{'Authorization': `${tokenType} ${accessToken}`} },
            }
        )
        if (userProfileResponse.status == 200) {
            return userProfileResponse.data
        }
        return false
    }
}

module.exports = TropipayAuth;