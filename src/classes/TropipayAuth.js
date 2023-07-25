//TropipayAuth;
//const { setCookie, deleteCookie } = require('cookies-next')
const axios = require('axios')
const Crypto = require('crypto')
const TropipayEndpoints = require('./TropipayEndpoints')
const AppUrl = process.env.APP_URL
const tppConfig = {
    clientId: process.env.TROPIPAY_CLIENT_ID,
    clientSecret: process.env.TROPIPAY_CLIENT_SECRET,
    scopes: process.env.TROPIPAY_SCOPE_FRONT,
    challengeMethod: process.env.CODE_CHALLENGE_METHOD,
    tppServerUrl: process.env.TROPIPAY_SERVER,
    responseType: 'code'
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
        this.#redirectUrl = (AppUrl + '/api/auth/callback')
        this.#authorizeUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.access.authorize
        this.#authorizationTokenUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.access.token,
            this.#userProfileUrl = TropipayEndpoints.tppServerUrl + TropipayEndpoints.users.profile,
            this.#defaultHeaders = { 'Content-Type': 'application/json' }
    }

    Login () {

        const randomBytes = Crypto.randomBytes(64)
        const codeVerifier = this.base64URLEncode(randomBytes)
        const codeChallenge = this.base64URLEncode(this.sha256(codeVerifier))
        const state = Crypto.randomBytes(8).toString('hex')

        let urlParams = new URLSearchParams({
            response_type: tppConfig.responseType,
            client_id: tppConfig.clientId,
            code_challenge: codeChallenge,
            code_challenge_method: tppConfig.challengeMethod,
            state: state,
            scope: tppConfig.scopes
        })

        urlParams.append('redirect_uri', this.#redirectUrl)

        return {
            url: `${this.#authorizeUrl}?${urlParams.toString()}`,
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
        console.log('authorizationTokenResponse-->', authorizationTokenResponse)
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
        console.log('userProfileResponse-->', userProfileResponse)
        return false
    }
}

module.exports = TropipayAuth