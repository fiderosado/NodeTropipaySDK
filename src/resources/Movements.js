//TropipayMovements
const BaseResource = require('./BaseResource');
const TropipayEndpoints = require('../classes/TropipayEndpoints');
const v = require('../core/validation');

const endpoints = TropipayEndpoints.movements;

// Fields of the `Movement` type exposed by POST /movements/business (from the live schema).
const DEFAULT_GRAPHQL_FIELDS = 'id reference concept state bankOrderCode createdAt completedAt amount { value currency } netAmount { value currency } fee { value currency } conversionRate sender recipient';

const FILTER_OPERATORS = ['eq', 'ne', 'in', 'notIn', 'gt', 'gte', 'lt', 'lte', 'like', 'iLike', 'between'];

// Documented filter keys -> [api key, operator]
const FILTER_ALIASES = {
    amountGte: ['amount', 'gte'],
    amountLte: ['amount', 'lte'],
    createdAtFrom: ['createdAt', 'gte'],
    createdAtTo: ['createdAt', 'lte'],
    completedAtFrom: ['completedAt', 'gte'],
    completedAtTo: ['completedAt', 'lte'],
};

/**
 * The API expects `query` as a JSON array of conditions: [{"key":"currency","op":"eq","value":"USD"}].
 * Accepts that array as is, or an object that is converted:
 *   {currency: 'USD', state: [5, 6], amountGte: 1000, createdAtFrom: '2025-01-01'}
 *   {amount: {gte: 100, lte: 5000}, reference: {like: '%ORD%'}}
 */
function toFilterConditions(filter) {
    if (Array.isArray(filter)) return filter;
    const conditions = [];
    for (const [name, value] of Object.entries(filter)) {
        if (value === undefined || value === null) continue;
        if (FILTER_ALIASES[name]) {
            const [key, op] = FILTER_ALIASES[name];
            conditions.push({key, op, value});
        } else if (Array.isArray(value)) {
            conditions.push({key: name, op: 'in', value});
        } else if (typeof value === 'object' && !(value instanceof Date)) {
            for (const [op, operand] of Object.entries(value)) {
                if (!FILTER_OPERATORS.includes(op)) {
                    throw new TypeError(`Unknown movements filter operator "${op}". Use one of: ${FILTER_OPERATORS.join(', ')}`);
                }
                conditions.push({key: name, op, value: operand});
            }
        } else {
            conditions.push({key: name, op: 'eq', value});
        }
    }
    return conditions;
}

function listQuery({limit, offset, filter, query} = {}) {
    const rawFilter = filter !== undefined ? filter : query;
    let encoded = rawFilter;
    if (rawFilter && typeof rawFilter === 'object') {
        const conditions = toFilterConditions(rawFilter);
        encoded = conditions.length ? JSON.stringify(conditions) : undefined;
    }
    return {limit, offset, query: encoded};
}

/**
 * https://doc.tropipay.com/docs/api-reference/movements
 */
class Movements extends BaseResource {
    /**
     * GET /movements/ — returns { count, rows, limit, offset }.
     * @param {{limit?: number, offset?: number, filter?: object|Array<{key: string, op: string, value: any}>}} [params]
     *   filter examples: {currency: 'USD', amountGte: 1000} or [{key: 'currency', op: 'eq', value: 'USD'}].
     *   Operators: eq, ne, in, notIn, gt, gte, lt, lte, like, iLike, between.
     */
    async list(params, options) {
        return this._request({method: 'GET', path: endpoints.list, query: listQuery(params)}, options);
    }

    /** GET /accounts/{accountId}/movements — same params as list(). */
    async listByAccount(accountId, params, options) {
        const path = this._path(TropipayEndpoints.accounts.movements, {accountId});
        return this._request({method: 'GET', path, query: listQuery(params)}, options);
    }

    /**
     * Iterates over every movement page by page.
     * @example for await (const movement of tpp.movements.iterate({filter: {currency: 'EUR'}})) {}
     */
    iterate(params = {}, options) {
        const {limit = 50, offset = 0, max, accountId, ...rest} = params;
        const fetchPage = (page) => (accountId
            ? this.listByAccount(accountId, {...rest, ...page}, options)
            : this.list({...rest, ...page}, options));
        return this._paginate(fetchPage, {limit, offset, max});
    }

    /**
     * POST /movements/business — raw GraphQL query.
     * @param {string} query
     * @param {object} [variables]
     */
    async graphql(query, variables, options) {
        return this._request({method: 'POST', path: endpoints.business, body: {query, variables}}, options);
    }

    /**
     * Advanced search through the GraphQL endpoint using the documented `movements` query.
     * @param {{filter?: object, pagination?: {limit?: number, offset?: number}, fields?: string}} [params]
     */
    async search({filter, pagination, fields = DEFAULT_GRAPHQL_FIELDS} = {}, options) {
        const query = `query GetMovements($filter: MovementFilter, $pagination: PaginationInput) { movements(filter: $filter, pagination: $pagination) { items { ${fields} } totalCount } }`;
        return this.graphql(query, {filter, pagination}, options);
    }

    /**
     * POST /movements/in/refund — requires 2FA and the ALLOW_REFUND permission.
     * @param {{orderCode: string, amount: number, securityCode: string}} payload
     */
    async refund(payload, options) {
        const body = this._payload(payload, {operation: 'refund', validate: v.validateRefund}, options);
        return this._request({method: 'POST', path: endpoints.refund, body}, options);
    }
}

module.exports = Movements;
module.exports.toFilterConditions = toFilterConditions;
