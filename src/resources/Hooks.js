//TropipayHooks
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');
const v = require('../core/validation');

const endpoints = TropipayEndpoints.hooks;

/**
 * User hooks (webhook subscriptions). https://doc.tropipay.com/docs/api-reference/webhooks
 */
class Hooks extends BaseResource {
    /** GET /user/hooks/events — [{ name, description }] */
    async listEvents(options) {
        return this._request({method: 'GET', path: endpoints.events}, options);
    }

    /** GET /user/hooks — every subscription of the user. */
    async list(options) {
        return this._request({method: 'GET', path: endpoints.list}, options);
    }

    /**
     * POST /user/hooks
     * @param {{event: string, target: 'web'|'email', value: string}} payload
     */
    async subscribe(payload, options) {
        const body = this._payload(payload, {operation: 'hooks.subscribe', validate: v.validateHook}, options);
        return this._request({method: 'POST', path: endpoints.create, body}, options);
    }

    /**
     * PUT /user/hooks
     * @param {{event: string, target: 'web'|'email', value: string}} payload
     */
    async update(payload, options) {
        const body = this._payload(payload, {operation: 'hooks.update', validate: v.validateHook}, options);
        return this._request({method: 'PUT', path: endpoints.update, body}, options);
    }

    /** GET /user/hooks/{eventName} — every target subscribed to an event. */
    async listByEvent(eventName, options) {
        return this._request({method: 'GET', path: this._path(endpoints.byEvent, {eventName})}, options);
    }

    /** GET /user/hooks/{eventName}/{targetName} */
    async get(eventName, targetName, options) {
        const path = this._path(endpoints.byEventAndTarget, {eventName, targetName});
        return this._request({method: 'GET', path}, options);
    }

    /** DELETE /user/hooks/{eventName}/{targetName} */
    async unsubscribe(eventName, targetName, options) {
        const path = this._path(endpoints.byEventAndTarget, {eventName, targetName});
        return this._request({method: 'DELETE', path}, options);
    }
}

module.exports = Hooks;
