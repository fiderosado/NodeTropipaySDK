// Integration tests against the real Tropipay sandbox, using the credentials in .env.
//   npm run test:integration
//
// Safety rules:
//  - Only runs when TROPIPAY_SERVER points to the sandbox (never production).
//  - Read-only calls, plus reversible cycles that clean up exactly what they create
//    (payment card, beneficiary, hook). Existing data is never modified or deleted.
//  - No payouts, refunds, password/2FA changes or account disabling.
const {describe, test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const {env, skipReason} = require('./env');
const {Tropipay, TropipayError, TropipayModels, HOOK_EVENTS, HOOK_TARGETS, SANDBOX} = require('../src');

const TIMEOUT = 60000;
const RUN_ID = `sdk-it-${Date.now()}`;
const WEBHOOK_URL = env.TROPIPAY_WEBHOOK_SERVER || 'https://webhook.site/sertropipay-integration';

describe('Tropipay sandbox (API v3)', {skip: skipReason, timeout: 10 * TIMEOUT}, () => {
    let tpp;
    let tokenRequests = 0;
    let accounts = [];
    let mainAccount;
    const cleanup = [];

    before(async () => {
        tpp = new Tropipay({
            timeout: Number(env.TROPIPAY_TIMEOUT_MS) || 30000,
            logger: {
                debug(message) {
                    if (message.includes('requesting access token')) tokenRequests += 1;
                },
            },
        });
        await tpp.authorize();
    });

    after(async () => {
        // Undo, in reverse order, only what these tests created.
        for (const undo of cleanup.reverse()) {
            try {
                await undo();
            } catch (error) {
                console.error(`cleanup failed: ${error.message}`);
            }
        }
    });

    describe('authorization', () => {
        test('obtains a client_credentials token', () => {
            assert.equal(tpp.isAuthorized(), true);
            assert.equal(typeof tpp.getAccessToken(), 'string');
            assert.ok(tpp.getAccessToken().length > 20);
            assert.equal(tpp.getData().token_type, 'Bearer');
            assert.ok(tpp.getBaseUrl().startsWith('https://sandbox.tropipay.me/api/v3'));
        });

        test('reuses the token across calls', async () => {
            const before = tokenRequests;
            await Promise.all([tpp.users.getProfile(), tpp.accounts.getAllBalances(), tpp.hooks.listEvents()]);
            assert.equal(tokenRequests, before);
        });

        test('wrong credentials fail with a TropipayError', async () => {
            const wrong = new Tropipay({serverUrl: env.TROPIPAY_SERVER, clientId: 'sdk-wrong-id', clientSecret: 'sdk-wrong-secret'});
            await assert.rejects(wrong.authorize(), (error) => {
                assert.ok(error instanceof TropipayError);
                assert.equal(error.status, 400);
                assert.equal(error.message, 'Credential not found');
                assert.ok(!JSON.stringify(error).includes(env.TROPIPAY_CLIENT_SECRET));
                return true;
            });
        });

        test('the 1.x Authorize() flow still works', async () => {
            Tropipay._instance = undefined;
            try {
                const legacy = await Tropipay.getInstance().Authorize();
                assert.equal(legacy.isAuthorized(), true);
                const hooks = await legacy.GetEventsAllowSubscriptionList();
                assert.ok(Array.isArray(hooks));
            } finally {
                Tropipay._instance = undefined;
            }
        });
    });

    describe('users', () => {
        test('getProfile returns the authenticated user', async () => {
            const profile = await tpp.users.getProfile();
            assert.equal(typeof profile.id, 'string');
            assert.equal(typeof profile.email, 'string');
            assert.equal(typeof profile.balance, 'number');
        });
    });

    describe('accounts', () => {
        test('list returns the user accounts', async () => {
            accounts = await tpp.accounts.list();
            assert.ok(Array.isArray(accounts) && accounts.length > 0);
            mainAccount = accounts.find((a) => a.isDefault && a.state === 1) || accounts.find((a) => a.state === 1);
            assert.ok(mainAccount, 'an active account is needed');
            assert.equal(typeof mainAccount.accountNumber, 'string');
        });

        test('getAllBalances returns balances per currency', async () => {
            const balances = await tpp.accounts.getAllBalances();
            assert.ok(Array.isArray(balances) && balances.length > 0);
            for (const balance of balances) {
                assert.equal(typeof balance.balance, 'number');
                assert.equal(typeof balance.currency, 'string');
            }
        });

        test('getBalance returns the balance of an account', async () => {
            const balance = await tpp.accounts.getBalance(mainAccount.accountNumber);
            assert.equal(balance.accountNumber, mainAccount.accountNumber);
            assert.equal(balance.currency, mainAccount.currency);
            assert.equal(typeof balance.balance, 'number');
        });

        test('getCryptoDepositAddress returns addresses for a crypto account', async (t) => {
            const crypto = accounts.find((a) => ['USDT', 'USDC'].includes(a.currency) && a.state === 1);
            if (!crypto) return t.skip('no active crypto account');
            const info = await tpp.accounts.getCryptoDepositAddress(crypto.id);
            assert.ok(Array.isArray(info.accounts) && info.accounts.length > 0);
            assert.equal(typeof info.accounts[0].address, 'string');
            assert.equal(typeof info.accounts[0].network, 'string');
        });

        test('listMovements returns the movements of an account', async () => {
            const page = await tpp.accounts.listMovements(mainAccount.id, {limit: 2});
            assert.equal(typeof page.count, 'number');
            assert.ok(Array.isArray(page.rows));
            for (const movement of page.rows) assert.equal(movement.accountId, mainAccount.id);
        });
    });

    describe('movements', () => {
        test('list paginates with limit and offset', async () => {
            const first = await tpp.movements.list({limit: 2, offset: 0});
            const second = await tpp.movements.list({limit: 2, offset: 2});
            assert.ok(first.count >= first.rows.length);
            assert.ok(first.rows.length <= 2);
            if (first.count > 2) assert.notEqual(first.rows[0].id, second.rows[0].id);
        });

        test('filters are applied by the API', async () => {
            const all = await tpp.movements.list({limit: 1});
            const filtered = await tpp.movements.list({limit: 5, filter: {currency: mainAccount.currency}});
            assert.ok(filtered.count <= all.count);
            for (const movement of filtered.rows) assert.equal(movement.currency, mainAccount.currency);

            const ranged = await tpp.movements.list({limit: 5, filter: {amount: {gte: 1000, lte: 100000}}});
            for (const movement of ranged.rows) assert.ok(movement.amount >= 1000 && movement.amount <= 100000);

            const raw = await tpp.movements.list({limit: 1, filter: [{key: 'currency', op: 'eq', value: mainAccount.currency}]});
            assert.equal(raw.count, filtered.count);
        });

        test('iterate walks several pages', async () => {
            const ids = [];
            for await (const movement of tpp.movements.iterate({limit: 2, max: 5})) ids.push(movement.id);
            assert.ok(ids.length > 0 && ids.length <= 5);
            assert.equal(new Set(ids).size, ids.length, 'no duplicated movements between pages');
        });

        test('the GraphQL endpoint answers (schema introspection)', async () => {
            const result = await tpp.movements.graphql('{ __type(name: "MovementFilter") { name inputFields { name } } }');
            assert.equal(result.data.__type.name, 'MovementFilter');
            assert.ok(result.data.__type.inputFields.some((field) => field.name === 'createdAtFrom'));
        });
    });

    describe('payment cards', () => {
        let card;

        test('create returns a paylink', async () => {
            card = await tpp.paymentCards.create({
                reference: RUN_ID,
                concept: 'sertropipay integration test',
                description: 'Created by the SDK test suite',
                amount: 1000,
                currency: 'EUR',
                singleUse: true,
                favorite: false,
                reasonId: 4,
                serviceDate: new Date().toISOString().slice(0, 10),
                lang: 'es',
                urlSuccess: 'https://example.com/ok',
                urlFailed: 'https://example.com/ko',
                urlNotification: WEBHOOK_URL,
                paymentMethods: ['EXT', 'TPP'],
                client: null,
            });
            assert.equal(typeof card.id, 'string');
            assert.match(card.shortUrl, /^https:\/\//);
            assert.equal(card.reference, RUN_ID);
            assert.equal(card.amount, 1000);
        });

        test('create accepts models with a client', async () => {
            const model = new TropipayModels.PaymentCardModel({
                reference: `${RUN_ID}-model`,
                concept: 'sertropipay model test',
                description: 'Created by the SDK test suite',
                amount: 1500,
                currency: 'EUR',
                singleUse: true,
                favorite: false,
                reasonId: 4,
                serviceDate: new Date().toISOString().slice(0, 10),
                urlNotification: WEBHOOK_URL,
                client: new TropipayModels.ClientModel({
                    name: 'John',
                    lastName: 'Tester',
                    address: 'Calle Falsa 123',
                    phone: '+34600000000',
                    email: 'john.tester@mailinator.com',
                    countryIso: 'ES',
                    termsAndConditions: true,
                    city: 'Madrid',
                    postCode: '28001',
                }),
            });
            const created = await tpp.paymentCards.create(model);
            assert.equal(created.reference, `${RUN_ID}-model`);
            assert.equal(created.hasClient, true);
        });

        test('get returns the created card', async () => {
            const fetched = await tpp.paymentCards.get(card.id);
            assert.equal(fetched.id, card.id);
            assert.equal(fetched.reference, RUN_ID);
        });

        test('list includes recent cards', async () => {
            const cards = await tpp.paymentCards.list({limit: 10, offset: 0});
            assert.ok(Array.isArray(cards));
            assert.ok(cards.some((item) => item.id === card.id), 'the new card is in the first page');
        });

        test('an unknown card is a 404 TropipayError', async () => {
            await assert.rejects(tpp.paymentCards.get('00000000-0000-0000-0000-000000000000'), (error) => {
                assert.ok(error instanceof TropipayError);
                assert.equal(error.status, 404);
                return true;
            });
        });

        test('invalid payloads are rejected locally', async () => {
            await assert.rejects(tpp.paymentCards.create({concept: 'x', amount: 50}), /amount must be at least 100/);
        });
    });

    describe('beneficiaries', () => {
        let beneficiary;

        test('list returns { count, rows }', async () => {
            const page = await tpp.beneficiaries.list({limit: 2});
            assert.equal(typeof page.count, 'number');
            assert.ok(Array.isArray(page.rows));
        });

        test('iterate walks every beneficiary', async () => {
            const page = await tpp.beneficiaries.list({limit: 1});
            let total = 0;
            for await (const item of tpp.beneficiaries.iterate({limit: 10, max: 30})) {
                assert.equal(typeof item.id, 'number');
                total += 1;
            }
            assert.equal(total, Math.min(page.count, 30));
        });

        test('validateAccountNumber checks crypto wallets', async () => {
            const valid = await tpp.beneficiaries.validateAccountNumber({
                accountNumber: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                paymentType: 100,
                currency: 'usdc',
                countryDestinationId: 0,
            });
            assert.equal(valid.valid, true);
            const invalid = await tpp.beneficiaries.validateAccountNumber({
                accountNumber: 'not-a-wallet',
                paymentType: 100,
                currency: 'usdc',
                countryDestinationId: 0,
            });
            assert.equal(invalid.valid, false);
            assert.equal(invalid.errorCode, 'INVALID_CRYPTO_ACOUNT');
        });

        // The test beneficiary is reused between runs: some credentials can create but not delete beneficiaries.
        const TEST_IBAN = 'DE89370400440532013000';
        const isTestBeneficiary = (item) => String(item.accountNumber).replace(/\s/g, '') === TEST_IBAN
            && item.firstName === 'Sdk' && item.lastName === 'Integration';

        test('createBank creates the test beneficiary (or reuses it)', async () => {
            for await (const item of tpp.beneficiaries.iterate({limit: 50})) {
                if (isTestBeneficiary(item)) {
                    beneficiary = item;
                    break;
                }
            }
            if (!beneficiary) {
                beneficiary = await tpp.beneficiaries.createBank({
                    accountNumber: TEST_IBAN,
                    firstName: 'Sdk',
                    lastName: 'Integration',
                    alias: RUN_ID,
                    countryISO: 'DE',
                    currency: 'EUR',
                    userRelationTypeId: 3,
                    city: 'Berlin',
                    province: 'Berlin',
                    address: 'Teststrasse 1',
                    postalCode: '10115',
                    swift: 'COBADEFFXXX',
                });
            }
            assert.equal(typeof beneficiary.id, 'number');
        });

        test('get returns the test beneficiary', async () => {
            const fetched = await tpp.beneficiaries.get(beneficiary.id);
            assert.equal(fetched.id, beneficiary.id);
            assert.ok(isTestBeneficiary(fetched));
        });

        test('update changes the alias (requires securityCode)', async () => {
            const updated = await tpp.beneficiaries.update(beneficiary.id, {alias: RUN_ID, securityCode: SANDBOX.SECURITY_CODE});
            assert.equal(updated.alias, RUN_ID);
            const fetched = await tpp.beneficiaries.get(beneficiary.id);
            assert.equal(fetched.alias, RUN_ID);
        });

        test('transfers.simulate quotes a payout to the beneficiary (no money is moved)', async () => {
            const eurAccount = accounts.find((a) => a.currency === 'EUR' && a.state === 1) || mainAccount;
            const simulation = await tpp.transfers.simulate({
                depositaccountId: beneficiary.id,
                accountId: eurAccount.id,
                paymentMethod: 'TPP',
                currencyToPay: eurAccount.currency,
                currencyToGet: 'EUR',
                amountToPay: 1000,
            });
            assert.ok(simulation && typeof simulation === 'object');
        });

        test('delete removes the test beneficiary', async (t) => {
            try {
                await tpp.beneficiaries.delete(beneficiary.id, {securityCode: SANDBOX.SECURITY_CODE});
            } catch (error) {
                if (error instanceof TropipayError && error.status === 403) {
                    // The request is right; this credential is not allowed to delete beneficiaries.
                    return t.skip(`credential without permission to delete beneficiaries (${error.code}); it will be reused`);
                }
                throw error;
            }
            await assert.rejects(tpp.beneficiaries.get(beneficiary.id), TropipayError);
        });
    });

    describe('hooks', () => {
        const event = HOOK_EVENTS.BENEFICIARY_DELETED;
        const target = HOOK_TARGETS.WEB;
        let alreadySubscribed = false;

        test('listEvents returns the available events', async () => {
            const events = await tpp.hooks.listEvents();
            const names = events.map((e) => e.name);
            for (const name of Object.values(HOOK_EVENTS)) assert.ok(names.includes(name), `${name} is available`);
        });

        test('list returns the current subscriptions', async () => {
            const hooks = await tpp.hooks.list();
            assert.ok(Array.isArray(hooks));
            alreadySubscribed = hooks.some((hook) => hook.event === event && hook.target === target);
        });

        test('subscribe → get → update → unsubscribe', async (t) => {
            if (alreadySubscribed) return t.skip(`${event}/${target} already has a subscription, it is not touched`);

            const subscribed = await tpp.hooks.subscribe({event, target, value: WEBHOOK_URL});
            assert.equal(subscribed.status, 'success');
            cleanup.push(() => tpp.hooks.unsubscribe(event, target));

            const [hook] = await tpp.hooks.get(event, target);
            assert.equal(hook.value, WEBHOOK_URL);

            const byEvent = await tpp.hooks.listByEvent(event);
            assert.ok(byEvent.some((item) => item.target === target));

            const updatedUrl = `${WEBHOOK_URL}?updated=${RUN_ID}`;
            const updated = await tpp.hooks.update({event, target, value: updatedUrl});
            assert.equal(updated.status, 'success');
            const [afterUpdate] = await tpp.hooks.get(event, target);
            assert.equal(afterUpdate.value, updatedUrl);

            const removed = await tpp.hooks.unsubscribe(event, target);
            assert.equal(removed.status, 'success');
            cleanup.pop();
            const remaining = await tpp.hooks.list();
            assert.ok(!remaining.some((item) => item.event === event && item.target === target));
        });
    });

    describe('scheduled transactions', () => {
        test('list returns { count, rows }', async () => {
            const page = await tpp.scheduledTransactions.list({limit: 5});
            assert.equal(typeof page.count, 'number');
            assert.ok(Array.isArray(page.rows));
        });
    });

    describe('generic request', () => {
        test('tpp.request reaches endpoints not wrapped by a resource', async () => {
            const profile = await tpp.request({method: 'GET', path: '/users/profile'});
            assert.equal(typeof profile.id, 'string');
        });
    });
});
