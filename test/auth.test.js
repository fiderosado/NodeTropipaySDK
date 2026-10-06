const test = require('node:test');
const assert = require('node:assert/strict');
const {Tropipay, TropipayConfigError} = require('../src');
const {computeExpiresAt} = require('../src/core/TokenManager');
const {createClient, tokenResponse, TOKEN_ROUTE, mockAdapter} = require('./helpers');

test('authorize() requests a client_credentials token against the v3 sandbox', async () => {
    const {tpp, calls} = createClient();
    const result = await tpp.authorize();
    assert.equal(result, tpp);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://sandbox.tropipay.me/api/v3/access/token');
    assert.deepEqual(calls[0].data, {grant_type: 'client_credentials', client_id: 'client-id', client_secret: 'client-secret'});
    assert.equal(tpp.getAccessToken(), 'token-1');
    assert.equal(tpp.getHeader().Authorization, 'Bearer token-1');
    assert.equal(tpp.isAuthorized(), true);
});

test('Authorize() (1.x name) keeps working and reuses the cached token', async () => {
    const {tpp, calls} = createClient();
    await tpp.Authorize();
    await tpp.Authorize();
    await tpp.users.getProfile();
    assert.equal(calls.filter((c) => c.path === '/api/v3/access/token').length, 1);
    assert.equal(calls[1].headers.Authorization, 'Bearer token-1');
});

test('scope is only sent when configured', async () => {
    const {tpp, calls} = createClient({}, {scopes: 'ALLOW_PAYMENT_IN'});
    await tpp.authorize();
    assert.equal(calls[0].data.scope, 'ALLOW_PAYMENT_IN');
});

test('concurrent requests share a single token request', async () => {
    const {tpp, calls} = createClient();
    await Promise.all([tpp.users.getProfile(), tpp.accounts.list(), tpp.hooks.list()]);
    assert.equal(calls.filter((c) => c.path === '/api/v3/access/token').length, 1);
    assert.equal(calls.length, 4);
});

test('the token is renewed before it expires', async () => {
    let issued = 0;
    const {tpp, calls} = createClient({
        [TOKEN_ROUTE]: () => tokenResponse(`token-${++issued}`, 1),
    }, {tokenRefreshMargin: 0});
    await tpp.users.getProfile();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await tpp.users.getProfile();
    const apiCalls = calls.filter((c) => c.path === '/api/v3/users/profile');
    assert.equal(apiCalls[0].headers.Authorization, 'Bearer token-1');
    assert.equal(apiCalls[1].headers.Authorization, 'Bearer token-2');
});

test('a 401 renews the token once and retries the request', async () => {
    let issued = 0;
    let profileCalls = 0;
    const {tpp, calls} = createClient({
        [TOKEN_ROUTE]: () => tokenResponse(`token-${++issued}`),
        'GET /api/v3/users/profile': () => (++profileCalls === 1
            ? {status: 401, data: {error: {type: 'authentication_error', code: 'invalid_credentials', message: 'expired'}}}
            : {status: 200, data: {id: 'u1'}}),
    });
    const profile = await tpp.users.getProfile();
    assert.deepEqual(profile, {id: 'u1'});
    const profileRequests = calls.filter((c) => c.path === '/api/v3/users/profile');
    assert.equal(profileRequests[1].headers.Authorization, 'Bearer token-2');
});

test('a second 401 is thrown instead of looping', async () => {
    const {tpp} = createClient({'GET /api/v3/users/profile': {status: 401, data: {error: 'unauthorized', message: 'nope', code: 'E00001'}}});
    await assert.rejects(tpp.users.getProfile(), (error) => error.status === 401 && error.code === 'E00001');
});

function withoutCredentialsEnv(fn) {
    const saved = {id: process.env.TROPIPAY_CLIENT_ID, secret: process.env.TROPIPAY_CLIENT_SECRET};
    delete process.env.TROPIPAY_CLIENT_ID;
    delete process.env.TROPIPAY_CLIENT_SECRET;
    try {
        return fn();
    } finally {
        if (saved.id !== undefined) process.env.TROPIPAY_CLIENT_ID = saved.id;
        if (saved.secret !== undefined) process.env.TROPIPAY_CLIENT_SECRET = saved.secret;
    }
}

test('authorize() without credentials throws a config error', async () => {
    const tpp = withoutCredentialsEnv(() => new Tropipay({environment: 'sandbox', httpAdapter: mockAdapter()}));
    await assert.rejects(tpp.authorize(), (error) => error instanceof TropipayConfigError
        && error.missing.includes('clientId') && error.missing.includes('clientSecret'));
});

test('a static access token works without credentials', async () => {
    const adapter = mockAdapter();
    const tpp = withoutCredentialsEnv(() => new Tropipay({environment: 'sandbox', accessToken: 'static', httpAdapter: adapter}));
    await tpp.users.getProfile();
    assert.equal(adapter.calls.length, 1);
    assert.equal(adapter.calls[0].headers.Authorization, 'Bearer static');
});

test('per request token overrides the managed one (user-level tokens)', async () => {
    const {tpp, calls} = createClient();
    await tpp.users.configureTwoFactor({enabled: true, type: 'totp', securityCode: '123456'}, {token: 'user-jwt', deviceId: 'dev-1'});
    assert.equal(calls.length, 1, 'no client_credentials token needed');
    assert.equal(calls[0].headers.Authorization, 'Bearer user-jwt');
    assert.equal(calls[0].headers['X-Device-Id'], 'dev-1');
});

test('expires_in is understood as seconds, epoch seconds or JWT exp', () => {
    const now = 1_700_000_000_000;
    assert.equal(computeExpiresAt(86400, null, now), now + 86400 * 1000);
    assert.equal(computeExpiresAt(1741987517, null, now), 1741987517 * 1000);
    const payload = Buffer.from(JSON.stringify({exp: 1800000000})).toString('base64url');
    assert.equal(computeExpiresAt(undefined, `h.${payload}.s`, now), 1800000000 * 1000);
    assert.equal(computeExpiresAt(undefined, 'opaque', now), null);
});

test('getInstance() returns the shared instance and configure() replaces it', () => {
    Tropipay._instance = undefined;
    const a = Tropipay.getInstance({environment: 'sandbox', clientId: 'x', clientSecret: 'y'});
    const b = Tropipay.getInstance();
    assert.equal(a, b);
    const c = Tropipay.configure({environment: 'production', clientId: 'x', clientSecret: 'y'});
    assert.notEqual(a, c);
    assert.equal(Tropipay.getInstance(), c);
    assert.equal(c.getTppServerUrl(), 'https://www.tropipay.com');
    Tropipay._instance = undefined;
});

test('getConfig() never exposes the client secret', () => {
    const {tpp} = createClient();
    const config = tpp.getConfig();
    assert.equal(config.clientSecret, undefined);
    assert.equal(config.hasClientSecret, true);
    assert.ok(!JSON.stringify(config).includes('client-secret'));
});
