//TropipayAuth;
const TropipayEndpoints = require("./TropipayEndpoints");
const AppUrl = process.env.APP_URL;
const tppConfig = {
    clientId: process.env.TROPIPAY_CLIENT_ID,
    scopes: process.env.TROPIPAY_SCOPE,
    challengeMethod: process.env.CODE_CHALLENGE_METHOD,
    tppServerUrl: process.env.TROPIPAY_SERVER,
    responseType : "code"
};

class TropipayAuth {

    #authorizeUrl;
    #redirectUrl;

    constructor() {
        this.#redirectUrl = ( AppUrl + '/api/oauth/callback');
        this.#authorizeUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.access.authorize;
    }

    Login(){

        let urlParams = new URLSearchParams({
            response_type: tppConfig.responseType,
            client_id: tppConfig.client_id,
            code_challenge: code_challenge,
            code_challenge_method: tppConfig.challengeMethod,
            state: "state",
            scope: tppConfig.scopes
        });

        linkParams.append("redirect_uri", redirectUrl );

        return (`${this.#authorizeUrl}?${urlParams.toString()}`)
    }

}

module.exports = TropipayAuth;