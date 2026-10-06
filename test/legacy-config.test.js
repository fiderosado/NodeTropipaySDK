const test = require('node:test');
const assert = require('node:assert/strict');
const {createClient, mockAdapter} = require('./helpers');
const {Tropipay, TropipayAuth, TropipaySession, TropipayModels, TropipayConfig, TropipayConfigError} = require('../src');
const {resolveConfig} = require('../src/core/config');
const TropipayDepositAccount = require('../src/classes/TropipayDepositAccount');
const TropipayHooks = require('../src/classes/TropipayHooks');

test('CreatePaymentCard keeps the 1.x { success: { data } } / { error } contract', async () => {
    const ok = createClient({'POST /api/v3/paymentcards': {data: {id: 'card-1', shortUrl: 'https://tppay.me/x'}}});
    assert.deepEqual(await ok.tpp.CreatePaymentCard({amount: 1}), {success: {data: {id: 'card-1', shortUrl: 'https://tppay.me/x'}}});

    const ko = createClient({'POST /api/v3/paymentcards': {status: 400, data: {error: {code: 'VALIDATION_ERROR', message: 'bad'}}}});
    assert.deepEqual(await ko.tpp.CreatePaymentCard({amount: 1}), {error: {error: {code: 'VALIDATION_ERROR', message: 'bad'}}});

    assert.deepEqual(await ok.tpp.CreatePaymentCard(), {error: 'CreatePaymentCard need a PaymentCardPayload Model...'});
});

test('1.x list/create methods return data or false', async () => {
    const {tpp} = createClient({
        'GET /api/v3/deposit_accounts/': {data: {items: []}},
        'POST /api/v3/deposit_accounts/': {status: 400, data: {error: 'x'}},
        'GET /api/v3/user/hooks/events': {data: [{name: 'user_login'}]},
        'GET /api/v3/user/hooks': {status: 500, data: {}},
        'POST /api/v3/user/hooks': {data: {action: 'subscribe', status: 'success'}},
        'POST /api/v2/paymentcards/mediation': {data: {id: 'm1'}},
    });
    assert.deepEqual(await tpp.GetDepositAccountsList(), {items: []});
    assert.equal(await tpp.CreateNewDepositAccount({any: 1}), false);
    assert.deepEqual(await tpp.GetEventsAllowSubscriptionList(), [{name: 'user_login'}]);
    assert.equal(await tpp.GetEventsSubscribedHooksList(), false);
    assert.deepEqual(await tpp.SubscribeNewEventHook({event: 'x'}), {action: 'subscribe', status: 'success'});
    assert.deepEqual(await tpp.CreateMediationPaymentCard({a: 1}), {id: 'm1'});
});

test('legacy wrapper classes delegate to the Tropipay instance', async () => {
    const {tpp} = createClient({
        'POST /api/v3/paymentcards': {data: {id: 'c'}},
        'GET /api/v3/deposit_accounts/': {data: {items: [1]}},
        'GET /api/v3/user/hooks': {data: [2]},
    });
    assert.deepEqual(await TropipaySession.getInstance(tpp).CreatePaymentCard({}), {success: {data: {id: 'c'}}});
    assert.deepEqual(await TropipayDepositAccount.getInstance(tpp).GetDepositAccountsList(), {items: [1]});
    assert.deepEqual(await TropipayHooks.getInstance(tpp).GetEventsSubscribedHooksList(), [2]);
    assert.throws(() => TropipaySession.getInstance(), /need the Tropipay context/);
});

test('models accept positional (1.x) and object arguments', () => {
    const positional = new TropipayModels.CientModel('n', 'l', 'a', 'p', 'e', 'true', undefined, 'ES');
    const object = new TropipayModels.ClientModel({name: 'n', lastName: 'l', address: 'a', phone: 'p', email: 'e', termsAndConditions: true, countryIso: 'ES', city: 'Madrid'});
    assert.deepEqual(positional.toObject(), {name: 'n', lastName: 'l', address: 'a', phone: 'p', email: 'e', termsAndConditions: true, countryIso: 'ES'});
    assert.equal(object.toObject().city, 'Madrid');
    assert.equal(TropipayModels.CientPayload, TropipayModels.ClientModel);

    const card = new TropipayModels.PaymentCardModel({concept: 'c', amount: 100, cient: {name: 'x'}});
    assert.deepEqual(card.toObject(), {concept: 'c', amount: 100, client: {name: 'x'}});
    assert.deepEqual(card.cient, {name: 'x'});
});

test('ExternalDepositAccountModel applies its defaults only to missing values', () => {
    assert.deepEqual(new TropipayModels.ExternalDepositAccountModel().toObject(), {beneficiaryType: 2, searchBy: 1, userRelationTypeId: 3});
    const custom = new TropipayModels.ExternalDepositAccountModel(2, undefined, undefined, 'ES1', 'alias', 0);
    assert.equal(custom.toObject().userRelationTypeId, 0);
    assert.equal(custom.toObject().searchBy, 1);
});

test('v3 beneficiary models carry the documented defaults', () => {
    assert.deepEqual(new TropipayModels.BeneficiaryModel({firstName: 'a'}).toObject(), {beneficiaryType: 2, paymentType: '2', firstName: 'a'});
    assert.deepEqual(new TropipayModels.CryptoBeneficiaryModel({accountNumber: 'w'}).toObject(), {beneficiaryType: 3, paymentType: 100, countryDestinationId: 0, accountNumber: 'w'});
    assert.deepEqual(new TropipayModels.HookModel('user_login', 'web', 'https://x').toObject(), {event: 'user_login', target: 'web', value: 'https://x'});
});

test('config: environments, server url normalization and env fallback', () => {
    assert.equal(resolveConfig({environment: 'production'}, {}).serverUrl, 'https://www.tropipay.com');
    assert.equal(resolveConfig({environment: 'SANDBOX'}, {}).serverUrl, 'https://sandbox.tropipay.me');
    assert.equal(resolveConfig({}, {TROPIPAY_SERVER: 'https://sandbox.tropipay.me/api/v3/'}).serverUrl, 'https://sandbox.tropipay.me');
    assert.equal(resolveConfig({}, {TROPIPAY_ENV: 'production'}).environment, 'production');
    const fromEnv = resolveConfig({}, {TROPIPAY_CLIENT_ID: 'id', TROPIPAY_CLIENT_SECRET: 's', TROPIPAY_SCOPE: 'A B', TROPIPAY_SERVER: 'https://www.tropipay.com'});
    assert.deepEqual([fromEnv.clientId, fromEnv.clientSecret, fromEnv.scopes, fromEnv.environment], ['id', 's', 'A B', 'production']);
    assert.equal(resolveConfig({clientId: 'explicit'}, {TROPIPAY_CLIENT_ID: 'env', TROPIPAY_ENV: 'sandbox'}).clientId, 'explicit');
    assert.throws(() => resolveConfig({environment: 'staging'}, {}), TropipayConfigError);
});

test('config: TropipayConfig instances are accepted', () => {
    const tpp = new Tropipay(new TropipayConfig({clientId: 'a', clientSecret: 'b', environment: 'production', timeout: 5000}));
    assert.equal(tpp.getBaseUrl(), 'https://www.tropipay.com/api/v3');
    assert.equal(tpp.getConfig().timeout, 5000);
});

test('config: falling back to sandbox and legacy heroku server emit warnings', async () => {
    const warnings = [];
    const listener = (warning) => warnings.push(warning.code);
    process.on('warning', listener);
    resolveConfig({}, {});
    resolveConfig({}, {TROPIPAY_SERVER: 'https://tropipay-dev.herokuapp.com'});
    await new Promise((resolve) => setImmediate(resolve));
    process.off('warning', listener);
    assert.ok(warnings.includes('SERTROPIPAY_DEFAULT_SANDBOX'));
    assert.ok(warnings.includes('SERTROPIPAY_LEGACY_SERVER'));
});

const authOptions = {
    clientId: 'cid',
    clientSecret: 'super-secret',
    scopes: 'ALLOW_GET_PROFILE_DATA',
    challengeMethod: 'S256',
    serverUrl: 'https://sandbox.tropipay.me',
    appUrl: 'https://app.test',
};

test('TropipayAuth.Login builds the same url as 1.x', () => {
    const auth = new TropipayAuth(authOptions);
    const {url, code_verifier, state} = auth.Login({next: '/dashboard'});
    const parsed = new URL(url);
    assert.equal(parsed.origin + parsed.pathname, 'https://sandbox.tropipay.me/api/v2/access/authorize');
    assert.equal(parsed.searchParams.get('client_id'), 'cid');
    assert.equal(parsed.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(parsed.searchParams.get('redirect_uri'), 'https://app.test/api/auth/callback?next=%2Fdashboard&');
    assert.equal(parsed.searchParams.get('state'), state);
    const expectedChallenge = auth.base64URLEncode(auth.sha256(code_verifier));
    assert.equal(parsed.searchParams.get('code_challenge'), expectedChallenge);
    assert.equal(new URL(auth.Login().url).searchParams.get('redirect_uri'), 'https://app.test/api/auth/callback');
});

test('TropipayAuth reports missing config without leaking values', () => {
    assert.throws(() => new TropipayAuth({...authOptions, challengeMethod: undefined, serverUrl: undefined, scopes: undefined, clientId: undefined}), (error) => {
        assert.ok(error instanceof TropipayConfigError);
        assert.ok(!error.message.includes('super-secret'));
        return true;
    });
});

test('TropipayAuth token exchange and profile', async () => {
    const adapter = mockAdapter({
        'POST /api/v2/access/token': {data: {access_token: 'user-token', token_type: 'Bearer'}},
        'GET /api/users/profile': {data: {id: 'u'}},
    });
    const auth = new TropipayAuth({...authOptions, httpAdapter: adapter});
    assert.equal(await auth.GetAuthorizationToken(), false);
    assert.deepEqual(await auth.GetAuthorizationToken('code', 'verifier'), {access_token: 'user-token', token_type: 'Bearer'});
    assert.equal(adapter.calls[0].data.redirect_uri, 'https://app.test');
    assert.equal(adapter.calls[0].data.code_verifier, 'verifier');
    assert.deepEqual(await auth.GetProfile('user-token', 'Bearer'), {id: 'u'});
    assert.equal(adapter.calls[1].headers.Authorization, 'Bearer user-token');
});

test('TropipayAuth returns false on API or network errors instead of crashing', async () => {
    const adapter = mockAdapter({
        'POST /api/v2/access/token': () => {
            throw new Error('network down');
        },
        'GET /api/users/profile': {status: 401, data: {}},
    });
    const auth = new TropipayAuth({...authOptions, httpAdapter: adapter});
    const originalError = console.error;
    console.error = () => {};
    try {
        assert.equal(await auth.GetAuthorizationToken('code', 'verifier'), false);
        assert.equal(await auth.GetProfile('token'), false);
    } finally {
        console.error = originalError;
    }
});
