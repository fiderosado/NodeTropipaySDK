//TropipayScheduledTransactions
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');

/**
 * Builds the `q.` filters: {currency: 'EUR'} -> q.currency=EUR, {currency: ['EUR','USD']} -> q.currency.in=EUR,USD
 */
function filterQuery(filters = {}) {
    const query = {};
    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
            query[`q.${key}.in`] = value.join(',');
        } else {
            query[`q.${key}`] = value;
        }
    }
    return query;
}

/**
 * https://doc.tropipay.com/docs/reference/scheduled
 */
class ScheduledTransactions extends BaseResource {
    /**
     * GET /scheduled_transaction
     * @param {{limit?: number, filters?: object}} [params] - filters keys are sent as q.<key> (arrays use the `in` operator)
     */
    async list(params = {}, options) {
        const {limit, filters} = params;
        const query = {limit, ...filterQuery(filters)};
        return this._request({method: 'GET', path: TropipayEndpoints.scheduledTransactions.list, query}, options);
    }
}

module.exports = ScheduledTransactions;
module.exports.filterQuery = filterQuery;
