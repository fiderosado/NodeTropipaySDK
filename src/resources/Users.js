//TropipayUsers
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');
const v = require('../core/validation');

const endpoints = TropipayEndpoints.users;

/**
 * https://doc.tropipay.com/docs/api-reference/users
 */
class Users extends BaseResource {
    /** GET /users/profile — details of the authenticated user. */
    async getProfile(options) {
        return this._request({method: 'GET', path: endpoints.profile}, options);
    }

    /**
     * POST /users/sendSecurityCode
     * @param {{type: 'sms'|'email', phone?: string, callingCode?: string, email?: string}} payload
     */
    async sendSecurityCode(payload, options) {
        const body = this._payload(payload, {operation: 'sendSecurityCode', validate: v.validateSendSecurityCode}, options);
        return this._request({method: 'POST', path: endpoints.sendSecurityCode, body}, options);
    }

    /**
     * POST /users/validateToken — returns { isValid, user, token }. The returned short-lived token can be
     * passed as `{ token }` in the options of the operations that need a recently verified session.
     * @param {{securityCode: string, type: 'sms'|'email'|'totp'}} payload
     */
    async validateToken(payload, options) {
        const body = this._payload(payload, {operation: 'validateToken', validate: v.validateSecurityToken}, options);
        return this._request({method: 'POST', path: endpoints.validateToken, body}, options);
    }

    /**
     * POST /users/2fa — enable or disable two factor authentication.
     * @param {{enabled: boolean, type: 'totp'|'sms', securityCode: string}} payload
     */
    async configureTwoFactor(payload, options) {
        const body = this._payload(payload, {operation: 'configureTwoFactor', validate: v.validateTwoFactor}, options);
        return this._request({method: 'POST', path: endpoints.twoFactor, body}, options);
    }

    /** POST /users/2fa/secret — returns { secret, qrCodeUrl }. */
    async getTwoFactorSecret(options) {
        return this._request({method: 'POST', path: endpoints.twoFactorSecret}, options);
    }

    /**
     * POST /users/pass
     * @param {{oldPass: string, newPass: string}} payload
     */
    async changePassword(payload, options) {
        const body = this._payload(payload, {operation: 'changePassword', validate: v.validatePasswordChange}, options);
        return this._request({method: 'POST', path: endpoints.password, body}, options);
    }

    /** POST /users/disable — disables the user account. Irreversible from the API. */
    async disable(options) {
        return this._request({method: 'POST', path: endpoints.disable}, options);
    }
}

module.exports = Users;
