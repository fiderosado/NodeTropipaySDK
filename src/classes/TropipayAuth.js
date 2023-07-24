//TropipayAuth;
const Crypto = require('crypto');
const TropipayEndpoints = require("./TropipayEndpoints");
const AppUrl = process.env.APP_URL;
const tppConfig = {
    clientId: process.env.TROPIPAY_CLIENT_ID,
    scopes: process.env.TROPIPAY_SCOPE,
    challengeMethod: process.env.CODE_CHALLENGE_METHOD,
    tppServerUrl: process.env.TROPIPAY_SERVER,
    responseType: "code"
};

class TropipayAuth {

    #authorizeUrl;
    #redirectUrl;

    base64URLEncode(str) {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    sha256(buffer) {
        return Crypto
            .createHash('sha256')
            .update(buffer)
            .digest();
    }

    constructor() {
        this.#redirectUrl = (AppUrl + '/api/oauth/callback');
        this.#authorizeUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.access.authorize;
    }

    Login() {

        const randomBytes = Crypto.randomBytes(64);
        console.log("CryptoJS.lib.WordArray.random--->", randomBytes);

        const codeVerifier = this.base64URLEncode(randomBytes);
        console.log("code_verifier-->", codeVerifier);

        const codeChallenge = this.base64URLEncode(this.sha256(codeVerifier));
        console.log("codeChallenge--->", codeChallenge);

        let urlParams = new URLSearchParams({
            response_type: tppConfig.responseType,
            client_id: tppConfig.client_id,
            code_challenge: codeChallenge,
            code_challenge_method: tppConfig.challengeMethod,
            state: "state",
            scope: tppConfig.scopes
        });

        urlParams.append("redirect_uri", redirectUrl);

        return (`${this.#authorizeUrl}?${urlParams.toString()}`)
    }

}

module.exports = TropipayAuth;