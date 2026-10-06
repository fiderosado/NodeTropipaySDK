//TropipayBaseResource
const {serialize, pathSegment} = require('../core/utils');
const {requirePayload} = require('../core/validation');

/**
 * Per call options accepted by every resource method (last argument):
 * @typedef {object} RequestOptions
 * @property {string} [token] - bearer token to use instead of the managed one (e.g. a user-level token)
 * @property {string} [deviceId] - sent as X-Device-Id (biometric operations)
 * @property {object} [headers] - extra headers
 * @property {AbortSignal} [signal]
 * @property {boolean} [validate] - override the instance `validate` option for this call
 */
class BaseResource {
    #client;

    constructor(client) {
        this.#client = client;
    }

    /**
     * Replaces :params in an endpoint template, e.g. path('/paymentcards/:id', {id}).
     */
    _path(template, params = {}) {
        return template.replace(/:(\w+)/g, (match, name) => pathSegment(params[name], name));
    }

    _request(request, options = {}) {
        const {token, deviceId, headers, signal} = options;
        return this.#client.request({...request, token, deviceId, headers, signal});
    }

    _shouldValidate(options = {}) {
        return options.validate === undefined ? this.#client.getConfig().validate : options.validate;
    }

    /**
     * Serializes models, applies the normalizer and runs the validator when validation is on.
     */
    _payload(payload, {operation, normalize, validate}, options) {
        let body = serialize(payload);
        if (this._shouldValidate(options)) requirePayload(body, operation);
        if (normalize && body && typeof body === 'object') body = normalize(body);
        if (validate && this._shouldValidate(options)) validate(body);
        return body;
    }

    /**
     * Async iterator over offset paginated endpoints. Supports the shapes returned by the API:
     * arrays, `{ count, rows }` (what v3 actually returns) and `{ items, hasMore | totalCount }` (documented).
     */
    async* _paginate(fetchPage, {limit = 20, offset = 0, max = Infinity} = {}) {
        let current = offset;
        let yielded = 0;
        for (;;) {
            const page = await fetchPage({limit, offset: current});
            const items = pageItems(page);
            for (const item of items) {
                if (yielded >= max) return;
                yield item;
                yielded += 1;
            }
            if (items.length === 0 || !pageHasMore(page, items, current, limit)) return;
            current += items.length;
        }
    }
}

function pageItems(page) {
    if (Array.isArray(page)) return page;
    if (!page || typeof page !== 'object') return [];
    return page.rows || page.items || [];
}

function pageHasMore(page, items, offset, limit) {
    if (page && !Array.isArray(page)) {
        if (typeof page.hasMore === 'boolean') return page.hasMore;
        const total = page.count !== undefined ? page.count : page.totalCount;
        if (Number.isFinite(Number(total))) return offset + items.length < Number(total);
    }
    return items.length >= limit;
}

module.exports = BaseResource;
