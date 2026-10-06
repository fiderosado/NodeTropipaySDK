const test = require('node:test');
const assert = require('node:assert/strict');
const {createClient} = require('./helpers');
const {TropipayModels} = require('../src');

const paymentCard = {
    concept: 'E-book Purchase',
    description: 'The Complete Guide to APIs',
    amount: 1999,
    currency: 'EUR',
    singleUse: true,
    favorite: false,
    reasonId: 4,
    reference: 'order-xyz-789',
    serviceDate: '2025-07-29',
    client: {
        name: 'John',
        lastName: 'McClane',
        address: 'Ave. Guadí 232',
        phone: '+34645553333',
        email: 'client@email.com',
        countryId: 2,
        termsAndConditions: true,
    },
};

const bankBeneficiary = {
    accountNumber: 'ES9121000418450200051332',
    firstName: 'Jane',
    lastName: 'Doe',
    address: '123 Main St',
    city: 'Madrid',
    province: 'Madrid',
    postalCode: '28001',
    countryISO: 'ES',
    currency: 'EUR',
    userRelationTypeId: 3,
};

const payout = {
    depositaccountId: 177309,
    accountId: 45787,
    currency: 'EUR',
    destinationCurrency: 'EUR',
    amount: 5000,
    destinationAmount: 5000,
    conceptTransfer: 'Monthly payment',
    reasonDes: 'Payment for services',
    reasonId: 9,
    paymentMethod: 'TPP',
};

// [name, call, expected {method, path, params?, data?}]
const cases = [
    // Users
    ['users.getProfile', (t) => t.users.getProfile(), {method: 'GET', path: '/users/profile'}],
    ['users.sendSecurityCode', (t) => t.users.sendSecurityCode({type: 'sms', callingCode: '+1', phone: '234567890'}),
        {method: 'POST', path: '/users/sendSecurityCode', data: {type: 'sms', callingCode: '+1', phone: '234567890'}}],
    ['users.validateToken', (t) => t.users.validateToken({securityCode: '123456', type: 'sms'}),
        {method: 'POST', path: '/users/validateToken', data: {securityCode: '123456', type: 'sms'}}],
    ['users.configureTwoFactor', (t) => t.users.configureTwoFactor({enabled: true, type: 'totp', securityCode: '123456'}),
        {method: 'POST', path: '/users/2fa', data: {enabled: true, type: 'totp', securityCode: '123456'}}],
    ['users.getTwoFactorSecret', (t) => t.users.getTwoFactorSecret(), {method: 'POST', path: '/users/2fa/secret'}],
    ['users.changePassword', (t) => t.users.changePassword({oldPass: 'a', newPass: 'b'}),
        {method: 'POST', path: '/users/pass', data: {oldPass: 'a', newPass: 'b'}}],
    ['users.disable', (t) => t.users.disable(), {method: 'POST', path: '/users/disable'}],

    // Accounts
    ['accounts.list', (t) => t.accounts.list({type: 1}), {method: 'GET', path: '/accounts/', params: {type: 1}}],
    ['accounts.getBalance', (t) => t.accounts.getBalance('TP00-0000'), {method: 'GET', path: '/accounts/balance/TP00-0000'}],
    ['accounts.getAllBalances', (t) => t.accounts.getAllBalances(), {method: 'GET', path: '/accounts/allBalance'}],
    ['accounts.addTropicard', (t) => t.accounts.addTropicard({tropicardNumber: '1234567890123456', pin: '1234'}),
        {method: 'POST', path: '/accounts/', data: {tropicardNumber: '1234567890123456', pin: '1234'}}],
    ['accounts.getCryptoDepositAddress', (t) => t.accounts.getCryptoDepositAddress(21221),
        {method: 'GET', path: '/accounts/21221/selfcharge/crypto'}],
    ['accounts.listMovements', (t) => t.accounts.listMovements(21221, {limit: 5}),
        {method: 'GET', path: '/accounts/21221/movements', params: {limit: 5}}],

    // Movements
    ['movements.list', (t) => t.movements.list({limit: 20, offset: 0, filter: {currency: 'USD', state: [5, 6], amountGte: 1000, createdAtFrom: '2025-01-01', reference: {like: '%ORD%'}}}),
        {method: 'GET', path: '/movements/', params: {limit: 20, offset: 0, query: JSON.stringify([
            {key: 'currency', op: 'eq', value: 'USD'},
            {key: 'state', op: 'in', value: [5, 6]},
            {key: 'amount', op: 'gte', value: 1000},
            {key: 'createdAt', op: 'gte', value: '2025-01-01'},
            {key: 'reference', op: 'like', value: '%ORD%'},
        ])}}],
    ['movements.list raw conditions', (t) => t.movements.list({filter: [{key: 'amount', op: 'between', value: [100, 1000]}]}),
        {method: 'GET', path: '/movements/', params: {query: '[{"key":"amount","op":"between","value":[100,1000]}]'}}],
    ['movements.listByAccount', (t) => t.movements.listByAccount('acc_123'), {method: 'GET', path: '/accounts/acc_123/movements'}],
    ['movements.graphql', (t) => t.movements.graphql('query { x }', {a: 1}),
        {method: 'POST', path: '/movements/business', data: {query: 'query { x }', variables: {a: 1}}}],
    ['movements.refund', (t) => t.movements.refund({orderCode: 'ORD-1', amount: 5000, securityCode: '123456'}),
        {method: 'POST', path: '/movements/in/refund', data: {orderCode: 'ORD-1', amount: 5000, securityCode: '123456'}}],

    // Transfers
    ['transfers.payout', (t) => t.transfers.payout(payout), {method: 'POST', path: '/operations/payout', data: payout}],
    ['transfers.simulate', (t) => t.transfers.simulate({
        depositaccountId: 177309, paymentMethod: 'TPP', accountId: 58814, currencyToPay: 'USD', currencyToGet: 'EUR', amountToPay: 5000,
    }), {method: 'POST', path: '/operations/payout/simulate', data: {
        depositaccountId: 177309, paymentMethod: 'TPP', accountId: 58814, currencyToPay: 'USD', currencyToGet: 'EUR', amountToPay: 5000,
    }}],

    // Payment cards
    ['paymentCards.create', (t) => t.paymentCards.create(paymentCard), {method: 'POST', path: '/paymentcards', data: paymentCard}],
    ['paymentCards.list', (t) => t.paymentCards.list({limit: 10, offset: 0, state: 1}),
        {method: 'GET', path: '/paymentcards', params: {limit: 10, offset: 0, state: 1}}],
    ['paymentCards.get', (t) => t.paymentCards.get('d08d6f20'), {method: 'GET', path: '/paymentcards/d08d6f20'}],

    // Beneficiaries
    ['beneficiaries.createBank', (t) => t.beneficiaries.createBank(bankBeneficiary),
        {method: 'POST', path: '/deposit_accounts/', data: {beneficiaryType: 2, paymentType: '2', ...bankBeneficiary}}],
    ['beneficiaries.createCrypto', (t) => t.beneficiaries.createCrypto({accountNumber: '0xabc', firstName: 'A', lastName: 'B', currency: 'usdc', network: 'ETHEREUM'}),
        {method: 'POST', path: '/deposit_accounts/', data: {
            beneficiaryType: 3, paymentType: 100, countryDestinationId: 0, accountNumber: '0xabc', firstName: 'A', lastName: 'B', currency: 'usdc', network: 'ETHEREUM',
        }}],
    ['beneficiaries.list', (t) => t.beneficiaries.list({limit: 10, search: 'Jane'}),
        {method: 'GET', path: '/deposit_accounts/', params: {limit: 10, search: 'Jane'}}],
    ['beneficiaries.get', (t) => t.beneficiaries.get(12345), {method: 'GET', path: '/deposit_accounts/12345'}],
    ['beneficiaries.update', (t) => t.beneficiaries.update(12345, {alias: 'Primary', securityCode: '123456'}),
        {method: 'PUT', path: '/deposit_accounts/', data: {alias: 'Primary', securityCode: '123456', id: 12345}}],
    ['beneficiaries.delete', (t) => t.beneficiaries.delete(12345, {securityCode: '123456'}),
        {method: 'DELETE', path: '/deposit_accounts/12345', data: {securityCode: '123456'}}],
    ['beneficiaries.validateAccountNumber', (t) => t.beneficiaries.validateAccountNumber({accountNumber: 'EPj', paymentType: 100, currency: 'usdc', countryDestinationId: 0}),
        {method: 'POST', path: '/deposit_accounts/validate_account_number', data: {accountNumber: 'EPj', paymentType: 100, currency: 'usdc', countryDestinationId: 0}}],

    // Hooks
    ['hooks.listEvents', (t) => t.hooks.listEvents(), {method: 'GET', path: '/user/hooks/events'}],
    ['hooks.list', (t) => t.hooks.list(), {method: 'GET', path: '/user/hooks'}],
    ['hooks.subscribe', (t) => t.hooks.subscribe({event: 'user_login', target: 'web', value: 'https://x.test/hook'}),
        {method: 'POST', path: '/user/hooks', data: {event: 'user_login', target: 'web', value: 'https://x.test/hook'}}],
    ['hooks.update', (t) => t.hooks.update({event: 'user_login', target: 'email', value: 'a@b.c'}),
        {method: 'PUT', path: '/user/hooks', data: {event: 'user_login', target: 'email', value: 'a@b.c'}}],
    ['hooks.listByEvent', (t) => t.hooks.listByEvent('user_login'), {method: 'GET', path: '/user/hooks/user_login'}],
    ['hooks.get', (t) => t.hooks.get('user_login', 'web'), {method: 'GET', path: '/user/hooks/user_login/web'}],
    ['hooks.unsubscribe', (t) => t.hooks.unsubscribe('user_login', 'web'), {method: 'DELETE', path: '/user/hooks/user_login/web'}],

    // Scheduled transactions
    ['scheduledTransactions.list', (t) => t.scheduledTransactions.list({limit: 20, filters: {currency: ['EUR', 'USD'], frecuency: 'monthly'}}),
        {method: 'GET', path: '/scheduled_transaction', params: {limit: 20, 'q.currency.in': 'EUR,USD', 'q.frecuency': 'monthly'}}],
];

for (const [name, call, expected] of cases) {
    test(`${name} -> ${expected.method} ${expected.path}`, async () => {
        const {tpp, apiCalls} = createClient();
        await call(tpp);
        const [request] = apiCalls();
        assert.equal(request.method, expected.method);
        assert.equal(request.path, `/api/v3${expected.path}`);
        assert.equal(request.headers.Authorization, 'Bearer token-1');
        if (expected.params) assert.deepEqual(request.params, expected.params);
        if (expected.data) assert.deepEqual(request.data, expected.data);
    });
}

test('paymentCards.createMediation keeps the legacy v2 endpoint', async () => {
    const {tpp, apiCalls} = createClient();
    await tpp.paymentCards.createMediation({amount: 1000});
    const [request] = apiCalls();
    assert.equal(request.url, 'https://sandbox.tropipay.me/api/v2/paymentcards/mediation');
    assert.equal(request.headers.Authorization, 'Bearer token-1');
});

test('tpp.request() reaches any endpoint with the managed token', async () => {
    const {tpp, apiCalls} = createClient();
    await tpp.request({method: 'GET', path: '/countries', query: {limit: 3}});
    const [request] = apiCalls();
    assert.equal(request.path, '/api/v3/countries');
    assert.deepEqual(request.params, {limit: 3});
});

test('models are serialized and the legacy `cient` field is sent as `client`', async () => {
    const {tpp, apiCalls} = createClient();
    const client = new TropipayModels.CientModel('John', 'Doe', 'Street 1', '+34600', 'j@d.com', 'true', 2);
    const card = new TropipayModels.PaymentCardModel(
        'ref-1', 'Bicycle', 'Two wheels', 'true', 1000, 'EUR', 'true', 4, 1, 'es',
        'https://ok', 'https://ko', 'https://notify', '2025-08-20', 'false', ['EXT', 'TPP'], false, client,
    );
    await tpp.paymentCards.create(card);
    const [request] = apiCalls();
    assert.equal(request.data.cient, undefined);
    assert.deepEqual(request.data.client, {
        name: 'John', lastName: 'Doe', address: 'Street 1', phone: '+34600', email: 'j@d.com', termsAndConditions: true, countryId: 2,
    });
    assert.equal(request.data.singleUse, true);
    assert.equal(request.data.favorite, true);
    assert.equal(request.data.directPayment, false);
});

test('plain objects with `cient` are also fixed', async () => {
    const {tpp, apiCalls} = createClient();
    const {client, ...rest} = paymentCard;
    await tpp.paymentCards.create({...rest, cient: client});
    assert.deepEqual(apiCalls()[0].data.client, client);
    assert.equal(apiCalls()[0].data.cient, undefined);
});

test('iterate() walks every page of movements using hasMore', async () => {
    let page = 0;
    const {tpp} = createClient({
        'GET /api/v3/movements/': () => {
            page += 1;
            return {data: {items: [{id: page * 10 + 1}, {id: page * 10 + 2}], hasMore: page < 3}};
        },
    });
    const ids = [];
    for await (const movement of tpp.movements.iterate({limit: 2})) ids.push(movement.id);
    assert.deepEqual(ids, [11, 12, 21, 22, 31, 32]);
});

test('iterate() walks { count, rows } pages (real API shape)', async () => {
    const all = [1, 2, 3, 4, 5].map((id) => ({id}));
    const {tpp, apiCalls} = createClient({
        'GET /api/v3/deposit_accounts/': (call) => ({
            data: {count: all.length, rows: all.slice(call.params.offset, call.params.offset + call.params.limit)},
        }),
    });
    const ids = [];
    for await (const beneficiary of tpp.beneficiaries.iterate({limit: 2})) ids.push(beneficiary.id);
    assert.deepEqual(ids, [1, 2, 3, 4, 5]);
    assert.deepEqual(apiCalls().map((c) => c.params.offset), [0, 2, 4]);
});

test('movements filter rejects unknown operators', async () => {
    const {tpp} = createClient();
    await assert.rejects(tpp.movements.list({filter: {amount: {bigger: 1}}}), /Unknown movements filter operator "bigger"/);
});

test('iterate() stops on short pages for array endpoints and respects max', async () => {
    const {tpp, apiCalls} = createClient({
        'GET /api/v3/paymentcards': (call) => ({data: call.params.offset === 0 ? [{id: 'a'}, {id: 'b'}] : [{id: 'c'}]}),
    });
    const ids = [];
    for await (const card of tpp.paymentCards.iterate({limit: 2})) ids.push(card.id);
    assert.deepEqual(ids, ['a', 'b', 'c']);
    assert.deepEqual(apiCalls().map((c) => c.params.offset), [0, 2]);

    const limited = [];
    for await (const card of tpp.paymentCards.iterate({limit: 2, max: 1})) limited.push(card.id);
    assert.deepEqual(limited, ['a']);
});

test('movements.search builds the documented GraphQL query', async () => {
    const {tpp, apiCalls} = createClient();
    await tpp.movements.search({filter: {state: ['COMPLETED']}, pagination: {limit: 20, offset: 0}, fields: 'id amount'});
    const [request] = apiCalls();
    assert.match(request.data.query, /\$pagination: PaginationInput\)/);
    assert.match(request.data.query, /movements\(filter: \$filter, pagination: \$pagination\) \{ items \{ id amount \} totalCount \}/);
    assert.deepEqual(request.data.variables, {filter: {state: ['COMPLETED']}, pagination: {limit: 20, offset: 0}});
});

test('path params are url encoded', async () => {
    const {tpp, apiCalls} = createClient();
    await tpp.hooks.get('user login', 'web/x');
    assert.equal(apiCalls()[0].path, '/api/v3/user/hooks/user%20login/web%2Fx');
});
