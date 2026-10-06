const test = require('node:test');
const assert = require('node:assert/strict');
const {createClient} = require('./helpers');
const {TropipayError, TropipayValidationError} = require('../src');

test('nested error bodies are parsed', async () => {
    const {tpp} = createClient({
        'GET /api/v3/accounts/': {status: 404, data: {error: {type: 'invalid_request_error', code: 'account_not_found', message: 'No such account', param: 'accountId'}}},
    });
    await assert.rejects(tpp.accounts.list(), (error) => {
        assert.ok(error instanceof TropipayError);
        assert.equal(error.status, 404);
        assert.equal(error.code, 'account_not_found');
        assert.equal(error.type, 'invalid_request_error');
        assert.equal(error.param, 'accountId');
        assert.equal(error.message, 'No such account');
        assert.equal(error.method, 'GET');
        assert.equal(error.path, '/accounts/');
        return true;
    });
});

test('flat error bodies are parsed', async () => {
    const {tpp} = createClient({
        'POST /api/v3/paymentcards': {status: 400, data: {error: 'invalid_request', message: 'The `amount` parameter is required.', code: 'E00123'}},
    });
    await assert.rejects(tpp.paymentCards.create({}, {validate: false}), (error) => {
        assert.equal(error.code, 'E00123');
        assert.equal(error.type, 'invalid_request');
        assert.equal(error.message, 'The `amount` parameter is required.');
        return true;
    });
});

test('errors never contain the bearer token or the client secret', async () => {
    const {tpp} = createClient({'GET /api/v3/users/profile': {status: 500, data: {error: {message: 'boom'}}}});
    await assert.rejects(tpp.users.getProfile(), (error) => {
        const serialized = JSON.stringify(error) + String(error.stack);
        assert.ok(!serialized.includes('token-1'));
        assert.ok(!serialized.includes('client-secret'));
        return true;
    });
});

test('network errors become TropipayError with the network code', async () => {
    const {tpp} = createClient({
        'GET /api/v3/users/profile': () => {
            const error = new Error('socket hang up');
            error.code = 'ECONNRESET';
            throw error;
        },
    });
    await assert.rejects(tpp.users.getProfile(), (error) => error instanceof TropipayError && error.code === 'ECONNRESET' && error.status === undefined);
});

test('429 responses are retried using Retry-After and expose rate limit info', async () => {
    let attempts = 0;
    const {tpp} = createClient({
        'GET /api/v3/accounts/allBalance': () => (++attempts < 3
            ? {status: 429, data: {error: 'rate_limited'}, headers: {'retry-after': '0', 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '0'}}
            : {data: [{balance: 1, currency: 'EUR'}]}),
    });
    const balances = await tpp.accounts.getAllBalances();
    assert.equal(attempts, 3);
    assert.deepEqual(balances, [{balance: 1, currency: 'EUR'}]);
});

test('429 is thrown after maxRetries', async () => {
    const {tpp} = createClient({
        'GET /api/v3/accounts/allBalance': {status: 429, data: {error: 'rate_limited'}, headers: {'retry-after': '0', 'x-ratelimit-limit': '60'}},
    }, {maxRetries: 1});
    await assert.rejects(tpp.accounts.getAllBalances(), (error) => error.status === 429 && error.rateLimit.limit === 60);
});

const invalidCases = [
    ['paymentCards.create without required fields', (t) => t.paymentCards.create({concept: 'x'}), /description is required/],
    ['paymentCards.create amount below 100', (t) => t.paymentCards.create({concept: 'x', description: 'y', amount: 99, currency: 'EUR', singleUse: false, favorite: false}), /amount must be at least 100/],
    ['paymentCards.create decimal amount', (t) => t.paymentCards.create({concept: 'x', description: 'y', amount: 10.5, currency: 'EUR', singleUse: false, favorite: false}), /integer amount in cents/],
    ['paymentCards.create unknown currency', (t) => t.paymentCards.create({concept: 'x', description: 'y', amount: 100, currency: 'CUP', singleUse: false, favorite: false}), /currency must be one of/],
    ['paymentCards.create singleUse without reference', (t) => t.paymentCards.create({concept: 'x', description: 'y', amount: 100, currency: 'EUR', singleUse: true, favorite: false}), /reference is required/],
    ['paymentCards.create incomplete client', (t) => t.paymentCards.create({concept: 'x', description: 'y', amount: 100, currency: 'EUR', singleUse: true, favorite: false, reference: 'r', serviceDate: '2025-01-01', client: {name: 'a'}}), /client.lastName is required.*client.countryId or client.countryIso.*termsAndConditions must be true/],
    ['paymentCards.create reason 9 without reasonDes', (t) => t.paymentCards.create({concept: 'x', description: 'y', amount: 100, currency: 'EUR', singleUse: false, favorite: false, reasonId: 9}), /reasonDes is required/],
    ['beneficiaries.create bank without country', (t) => t.beneficiaries.createBank({accountNumber: 'ES1', firstName: 'a', lastName: 'b'}), /userRelationTypeId is required.*countryISO is required/],
    ['beneficiaries.createCrypto without names', (t) => t.beneficiaries.createCrypto({accountNumber: '0x1'}), /firstName is required/],
    ['beneficiaries.update without security code', (t) => t.beneficiaries.update(1, {alias: 'x'}), /securityCode is required/],
    ['beneficiaries.delete without security code', (t) => t.beneficiaries.delete(1, {}), /securityCode is required/],
    ['beneficiaries.get without id', (t) => t.beneficiaries.get(), /beneficiaryId is required/],
    ['transfers.payout without amount', (t) => t.transfers.payout({depositaccountId: 1}), /amount is required/],
    ['transfers.simulate without currencies', (t) => t.transfers.simulate({depositaccountId: 1, amountToPay: 100}), /currencyToPay is required/],
    ['hooks.subscribe invalid target', (t) => t.hooks.subscribe({event: 'user_login', target: 'sms', value: 'x'}), /target must be one of: web, email/],
    ['movements.refund without securityCode', (t) => t.movements.refund({orderCode: 'o', amount: 100}), /securityCode is required/],
    ['users.sendSecurityCode sms without phone', (t) => t.users.sendSecurityCode({type: 'sms'}), /phone is required/],
    ['users.validateToken invalid type', (t) => t.users.validateToken({securityCode: '1', type: 'push'}), /type must be one of/],
    ['users.configureTwoFactor enabled as string', (t) => t.users.configureTwoFactor({enabled: 'yes', type: 'totp', securityCode: '1'}), /enabled must be a boolean/],
    ['users.changePassword missing newPass', (t) => t.users.changePassword({oldPass: 'a'}), /newPass is required/],
    ['accounts.addTropicard bad pin', (t) => t.accounts.addTropicard({tropicardNumber: '1234567890123456', pin: '12'}), /pin must have 4 digits/],
    ['payload missing', (t) => t.transfers.payout(), /needs a payload object/],
];

for (const [name, call, message] of invalidCases) {
    test(`validation: ${name}`, async () => {
        const {tpp, calls} = createClient();
        await assert.rejects(call(tpp), (error) => {
            assert.ok(error instanceof TropipayValidationError, `expected TropipayValidationError, got ${error && error.name}`);
            assert.match(error.message, message);
            return true;
        });
        assert.equal(calls.length, 0, 'no request must be sent');
    });
}

test('validation can be disabled per instance and per call', async () => {
    const {tpp, apiCalls} = createClient({}, {validate: false});
    await tpp.paymentCards.create({concept: 'only'});
    assert.equal(apiCalls().length, 1);

    const second = createClient();
    await second.tpp.transfers.payout({amount: 1}, {validate: false});
    assert.equal(second.apiCalls().length, 1);
});
