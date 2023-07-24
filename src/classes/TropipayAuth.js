//TropipayAuth;
const { setCookie, deleteCookie } = require('cookies-next')
const Crypto = require('crypto')
const TropipayEndpoints = require('./TropipayEndpoints')
const AppUrl = process.env.APP_URL
const tppConfig = {
    clientId: process.env.TROPIPAY_CLIENT_ID,
    scopes: process.env.TROPIPAY_SCOPE_FRONT,
    challengeMethod: process.env.CODE_CHALLENGE_METHOD,
    tppServerUrl: process.env.TROPIPAY_SERVER,
    responseType: 'code'
}

class TropipayAuth {

    #authorizeUrl
    #redirectUrl

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
        this.#redirectUrl = (AppUrl + '/api/oauth/callback')
        this.#authorizeUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.access.authorize
    }

    Login () {

        const randomBytes = Crypto.randomBytes(64);
        const codeVerifier = this.base64URLEncode(randomBytes);
        const codeChallenge = this.base64URLEncode(this.sha256(codeVerifier));
        const state = Crypto.randomBytes(8).toString('hex');

        let urlParams = new URLSearchParams({
            response_type: tppConfig.responseType,
            client_id: tppConfig.clientId,
            code_challenge: codeChallenge,
            code_challenge_method: tppConfig.challengeMethod,
            state: state,
            scope: tppConfig.scopes
        })

        urlParams.append('redirect_uri', this.#redirectUrl);

        return {
            url : `${this.#authorizeUrl}?${urlParams.toString()}`,
            code_verifier : codeVerifier ,
            state : state
        }
    }

}

module.exports = TropipayAuth;