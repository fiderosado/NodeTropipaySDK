# NodeTropipaySDK
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Next JS](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React_Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React_Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=React_Query&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![strapi](https://img.shields.io/badge/strapi-2F2E8B?style=for-the-badge&logo=strapi&logoColor=white)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?style=for-the-badge&logo=Webpack&logoColor=white)
![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white)
![vs](https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)
![vscode](https://img.shields.io/badge/Visual_Studio-5C2D91?style=for-the-badge&logo=visual%20studio&logoColor=white)
![WebStorm](https://img.shields.io/badge/WebStorm-000000?style=for-the-badge&logo=WebStorm&logoColor=white)
![eslint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)
![prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)


Node SDK for the **Tropipay API v3** by SerproTeam.

One authorized instance, created at application startup and shared by the **server side**, gives access to every
resource documented in [doc.tropipay.com](https://doc.tropipay.com): payment cards (paylinks), beneficiaries,
payouts, accounts and balances, movements (REST and GraphQL), refunds, user hooks, scheduled transactions, user
security (2FA, security codes) and webhook signature verification.

- Automatic token management: cached, renewed before it expires, one shared request for concurrent calls and a
  transparent retry after a `401`.
- Retries `429 Too Many Requests` using `Retry-After` / `X-RateLimit-Reset`.
- Payload validation against the documented contract before calling the API.
- Typed errors that never contain your token or client secret.
- CommonJS, ES modules and TypeScript types. Only one dependency (`axios`).
- Backwards compatible with the 1.x API (`Tropipay.getInstance().Authorize()`, `CreatePaymentCard`, …).

# Author
[<img src="https://avatars.githubusercontent.com/u/15683590?v=4?size=115" width=115>
<br>
Fidel Remedios Rosado
<br>
<sub>@fiderosado</sub>](https://github.com/fiderosado)

[![](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://tppay.me/lk1gruhi)

# Repository

https://github.com/fiderosado/NodeTropipaySDK

---

## Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Instance and authorization](#instance-and-authorization)
- [Resources](#resources)
  - [Payment cards](#payment-cards)
  - [Beneficiaries](#beneficiaries)
  - [Transfers (payouts)](#transfers-payouts)
  - [Accounts](#accounts)
  - [Movements and refunds](#movements-and-refunds)
  - [User hooks](#user-hooks)
  - [Users and security](#users-and-security)
  - [Scheduled transactions](#scheduled-transactions)
  - [Any other endpoint](#any-other-endpoint)
- [Verifying notifications and webhooks](#verifying-notifications-and-webhooks)
- [Errors](#errors)
- [Models](#models)
- [Constants](#constants)
- [Login with Tropipay (TropipayAuth)](#login-with-tropipay-tropipayauth)
- [Next.js example](#nextjs-example)
- [Migrating from 1.x](#migrating-from-1x)
- [Sandbox testing](#sandbox-testing)

## Installation

```bash
npm install sertropipay
# or
yarn add sertropipay
```

Requires Node.js 18 or newer. Use it **only on the server**: your credentials must never reach the browser.

## Configuration

Every option can be passed explicitly or read from environment variables:

| Option | Env variable | Default | Description |
|---|---|---|---|
| `clientId` | `TROPIPAY_CLIENT_ID` | — | Credential client id |
| `clientSecret` | `TROPIPAY_CLIENT_SECRET` | — | Credential client secret |
| `environment` | `TROPIPAY_ENV` | `sandbox` | `sandbox` or `production` |
| `serverUrl` | `TROPIPAY_SERVER` | — | Custom server (`https://sandbox.tropipay.me`, `/api/v3` is optional) |
| `scopes` | `TROPIPAY_SCOPE` | — | Optional scopes sent with the token request |
| `timeout` | | `30000` | Request timeout (ms) |
| `maxRetries` | | `2` | Retries for `429` responses |
| `maxRetryDelay` | | `10000` | Max wait between retries (ms) |
| `tokenRefreshMargin` | | `300` | Seconds before expiry when the token is renewed |
| `validate` | | `true` | Validate payloads before sending them |
| `deviceId` | | — | Default `X-Device-Id` header (biometric operations) |
| `headers` | | — | Extra default headers |
| `accessToken` | | — | Use an already obtained token |
| `logger` | | silent | `{ debug, info, warn, error }`, e.g. `console` |

```dotenv
TROPIPAY_ENV=sandbox            # or production
TROPIPAY_CLIENT_ID="your client id"
TROPIPAY_CLIENT_SECRET="your client secret"
```

Environments:

| Environment | API base |
|---|---|
| `sandbox` | `https://sandbox.tropipay.me/api/v3` |
| `production` | `https://www.tropipay.com/api/v3` |

If nothing is configured the SDK uses the sandbox and emits a Node warning. Sandbox credentials don't work in
production and vice versa. See [Setting up credentials](https://doc.tropipay.com/docs/basics/setting-up-credentials).

## Instance and authorization

```js
const {Tropipay} = require('sertropipay');
// or: import {Tropipay} from 'sertropipay';

// Shared instance (reads process.env), authorized once at startup
const tpp = await Tropipay.getInstance().authorize();

// ...anywhere else in the server
const tpp = Tropipay.getInstance();
const card = await tpp.paymentCards.create({...});
```

- `authorize()` is optional: every call obtains or renews the token when needed.
- Concurrent requests share one token request, and the token is renewed `tokenRefreshMargin` seconds before it expires.
- If the API answers `401`, the token is renewed and the request retried once.

Other ways to create instances:

```js
// Explicit configuration for the shared instance
Tropipay.configure({environment: 'production', clientId, clientSecret});

// Independent instances (several Tropipay accounts in the same app)
const shopA = new Tropipay({clientId: A_ID, clientSecret: A_SECRET, environment: 'production'});
const shopB = Tropipay.create({clientId: B_ID, clientSecret: B_SECRET, environment: 'production'});
```

Instance helpers: `isAuthorized()`, `getAccessToken()`, `setAccessToken(token, {expiresIn})`, `getConfig()`
(without the secret), `getBaseUrl()`.

### Per call options

Every resource method accepts a last `options` argument:

```js
await tpp.users.getProfile({
    token: userToken,     // bearer token for this call instead of the managed one (user-level tokens)
    deviceId: 'device-1', // X-Device-Id
    headers: {'X-Custom': '1'},
    signal: abortController.signal,
    validate: false,      // skip the SDK validation for this call
});
```

## Resources

All amounts are **integers in cents** (`1055` = 10.55 EUR).

### Payment cards

[Docs](https://doc.tropipay.com/docs/api-reference/payment-cards)

| Method | Endpoint |
|---|---|
| `paymentCards.create(payload)` | `POST /paymentcards` |
| `paymentCards.list({limit, offset, state})` | `GET /paymentcards` |
| `paymentCards.get(id)` | `GET /paymentcards/{id}` |
| `paymentCards.iterate({limit, state, max})` | every page (async iterator) |
| `paymentCards.createMediation(payload)` | `POST /api/v2/paymentcards/mediation` (legacy, not in v3 docs) |

```js
const card = await tpp.paymentCards.create({
    reference: 'order-1001',
    concept: 'Bicycle',
    description: 'Two wheels',
    amount: 1999,             // 19.99
    currency: 'EUR',          // USD | EUR | USDC
    singleUse: true,
    favorite: false,
    reasonId: 4,
    serviceDate: '2025-08-20',
    lang: 'es',
    urlSuccess: 'https://my-shop.com/payment-ok',
    urlFailed: 'https://my-shop.com/payment-ko',
    urlNotification: 'https://my-shop.com/api/tropipay/notification',
    paymentMethods: ['EXT', 'TPP'],
    client: {
        name: 'John',
        lastName: 'McClane',
        address: 'Ave. Guadí 232, Barcelona',
        phone: '+34645553333',
        email: 'client@email.com',
        countryIso: 'ES',
        termsAndConditions: true,
        city: 'Barcelona',
        postCode: '08001',
    },
});

console.log(card.shortUrl); // https://tppay.me/xxxx
console.log(card.qrImage);  // data:image/png;base64,...
```

Validation follows the docs. The payload needs `concept`, `description`, `amount` (an integer of at least 100),
`currency`, `singleUse` and `favorite`. When `singleUse` is true it also needs `reference` and `serviceDate`.
A `client` object must be complete. Reason `9` needs `reasonDes`.
If you can't provide the client data, send `client: null` and Tropipay will ask the customer.

### Beneficiaries

[Docs](https://doc.tropipay.com/docs/api-reference/beneficiaries) — also available as `tpp.depositAccounts`.

| Method | Endpoint |
|---|---|
| `beneficiaries.create(payload)` | `POST /deposit_accounts/` |
| `beneficiaries.createBank(payload)` | same, with `beneficiaryType: 2`, `paymentType: "2"` |
| `beneficiaries.createCrypto(payload)` | same, with `beneficiaryType: 3`, `paymentType: 100`, `countryDestinationId: 0` |
| `beneficiaries.list({limit, offset, search})` | `GET /deposit_accounts/` → `{count, rows}` |
| `beneficiaries.iterate(params)` | every page |
| `beneficiaries.get(id)` | `GET /deposit_accounts/{id}` |
| `beneficiaries.update(id, {alias, securityCode})` | `PUT /deposit_accounts/` (only the alias; the API requires the 2FA code) |
| `beneficiaries.delete(id, {securityCode})` | `DELETE /deposit_accounts/{id}` |
| `beneficiaries.validateAccountNumber(payload)` | `POST /deposit_accounts/validate_account_number` |

```js
const {USER_RELATION_TYPES, CRYPTO_NETWORKS} = require('sertropipay');

const bank = await tpp.beneficiaries.createBank({
    accountNumber: 'ES9121000418450200051332',
    firstName: 'Jane',
    lastName: 'Doe',
    countryISO: 'ES',
    currency: 'EUR',
    userRelationTypeId: USER_RELATION_TYPES.FRIEND,
    city: 'Madrid',
    province: 'Madrid',
    address: '123 Main St',
    postalCode: '28001',
    swift: 'CAIXESBBXXX', // required outside SEPA
});

const check = await tpp.beneficiaries.validateAccountNumber({
    accountNumber: '0xA1b2C3d4E5f67890aBcDEF1234567890aBCdEf12',
    paymentType: 100,
    currency: 'usdc',
    network: CRYPTO_NETWORKS.ETHEREUM, // required for EVM addresses
    countryDestinationId: 0,
});
if (check.valid) {
    await tpp.beneficiaries.createCrypto({
        accountNumber: '0xA1b2C3d4E5f67890aBcDEF1234567890aBCdEf12',
        firstName: 'Jane',
        lastName: 'Doe',
        currency: 'usdc',
        network: CRYPTO_NETWORKS.ETHEREUM,
    });
}

await tpp.beneficiaries.delete(bank.id, {securityCode: '123456'});
```

### Transfers (payouts)

[Docs](https://doc.tropipay.com/docs/api-reference/transfers)

| Method | Endpoint |
|---|---|
| `transfers.simulate(payload)` | `POST /operations/payout/simulate` |
| `transfers.payout(payload)` | `POST /operations/payout` |

```js
const simulation = await tpp.transfers.simulate({
    depositaccountId: 177309,
    accountId: 58814,
    paymentMethod: 'TPP',
    currencyToPay: 'USD',
    currencyToGet: 'EUR',
    amountToPay: 5000,
});

const transfer = await tpp.transfers.payout({
    depositaccountId: 177309,
    accountId: 45787,
    currency: 'EUR',
    destinationCurrency: 'EUR',
    amount: 5000,
    destinationAmount: 5000,
    conceptTransfer: 'Monthly payment',
    reasonId: 9,
    reasonDes: 'Payment for services',
    paymentMethod: 'TPP',
    securityCode: '123456', // 2FA, required for high amounts
});
```

### Accounts

[Docs](https://doc.tropipay.com/docs/api-reference/accounts)

| Method | Endpoint |
|---|---|
| `accounts.list({type})` | `GET /accounts/` |
| `accounts.getBalance(accountNumber)` | `GET /accounts/balance/{accountNumber}` |
| `accounts.getAllBalances()` | `GET /accounts/allBalance` |
| `accounts.addTropicard({tropicardNumber, pin})` | `POST /accounts/` |
| `accounts.getCryptoDepositAddress(accountId)` | `GET /accounts/{accountId}/selfcharge/crypto` |
| `accounts.listMovements(accountId, params)` | `GET /accounts/{accountId}/movements` |

### Movements and refunds

[Docs](https://doc.tropipay.com/docs/api-reference/movements)

| Method | Endpoint |
|---|---|
| `movements.list({limit, offset, filter})` | `GET /movements/` → `{count, rows}` |
| `movements.listByAccount(accountId, params)` | `GET /accounts/{accountId}/movements` |
| `movements.iterate(params)` | every page (async iterator) |
| `movements.graphql(query, variables)` | `POST /movements/business` |
| `movements.search({filter, pagination, fields})` | GraphQL `movements` query |
| `movements.refund({orderCode, amount, securityCode})` | `POST /movements/in/refund` (2FA + `ALLOW_REFUND`) |

The API expects the filter as a JSON list of conditions (`[{"key":"currency","op":"eq","value":"USD"}]`), not the
object shown in the docs. You can pass that list or an object that the SDK converts:

- a plain value becomes `eq`;
- an array becomes `in`;
- `{gte, lte, …}` becomes one condition per operator;
- `amountGte`, `amountLte`, `createdAtFrom` and `createdAtTo` map to `gte`/`lte`.

Operators: `eq ne in notIn gt gte lt lte like iLike between`.

```js
const {count, rows} = await tpp.movements.list({
    limit: 20,
    filter: {currency: 'EUR', amountGte: 1000, createdAtFrom: '2025-01-01T00:00:00Z'},
});

// same thing with raw conditions
await tpp.movements.list({filter: [{key: 'amount', op: 'between', value: [1000, 50000]}]});

for await (const movement of tpp.movements.iterate({filter: {currency: 'USD'}, max: 500})) {
    console.log(movement.id, movement.amount);
}

// GraphQL (types from the live schema: PaginationInput, amount { value currency })
const result = await tpp.movements.search({
    filter: {state: ['completed'], movementType: ['CHARGE'], amountGte: 100},
    pagination: {limit: 20, offset: 0},
    fields: 'id reference createdAt amount { value currency } sender recipient',
});
```

### User hooks

[Docs](https://doc.tropipay.com/docs/api-reference/webhooks)

| Method | Endpoint |
|---|---|
| `hooks.listEvents()` | `GET /user/hooks/events` |
| `hooks.list()` | `GET /user/hooks` |
| `hooks.subscribe({event, target, value})` | `POST /user/hooks` |
| `hooks.update({event, target, value})` | `PUT /user/hooks` |
| `hooks.listByEvent(event)` | `GET /user/hooks/{event}` |
| `hooks.get(event, target)` | `GET /user/hooks/{event}/{target}` |
| `hooks.unsubscribe(event, target)` | `DELETE /user/hooks/{event}/{target}` |

```js
const {HOOK_EVENTS, HOOK_TARGETS} = require('sertropipay');

await tpp.hooks.subscribe({
    event: HOOK_EVENTS.PAYMENT_IN_STATE_CHANGE,
    target: HOOK_TARGETS.WEB,
    value: 'https://my-shop.com/api/tropipay/hook',
});
```

Events: `user_signup`, `user_login`, `user_kyc`, `payment_in_state_change`, `payment_out_state_change`,
`beneficiary_added`, `beneficiary_updated`, `beneficiary_deleted`.

### Users and security

[Docs](https://doc.tropipay.com/docs/api-reference/users)

| Method | Endpoint |
|---|---|
| `users.getProfile()` | `GET /users/profile` |
| `users.sendSecurityCode({type, phone, callingCode, email})` | `POST /users/sendSecurityCode` |
| `users.validateToken({securityCode, type})` | `POST /users/validateToken` |
| `users.configureTwoFactor({enabled, type, securityCode})` | `POST /users/2fa` |
| `users.getTwoFactorSecret()` | `POST /users/2fa/secret` |
| `users.changePassword({oldPass, newPass})` | `POST /users/pass` |
| `users.disable()` | `POST /users/disable` |

`validateToken` returns a short-lived token for operations that need a recently verified session. Pass it to that
call:

```js
const {token} = await tpp.users.validateToken({securityCode: '123456', type: 'sms'});
await tpp.users.configureTwoFactor({enabled: true, type: 'totp', securityCode: '123456'}, {token});
```

### Scheduled transactions

[Docs](https://doc.tropipay.com/docs/reference/scheduled)

```js
// GET /scheduled_transaction?limit=20&q.currency.in=EUR,USD&q.frecuency=monthly
await tpp.scheduledTransactions.list({
    limit: 20,
    filters: {currency: ['EUR', 'USD'], frecuency: 'monthly'}, // arrays use the `in` operator
});
```

### Any other endpoint

```js
const data = await tpp.request({method: 'GET', path: '/countries', query: {limit: 10}});
```

It uses the same base url, token, retries and errors as the resources.

## Verifying notifications and webhooks

**Payment card `urlNotification`.** Tropipay posts `{ status: "OK" | "KO", data }` and signs it with
`signatureV3 = sha256(bankOrderCode + clientId + sha1(clientSecret) + originalCurrencyAmount)`.

```js
// Next.js route handler: app/api/tropipay/notification/route.js
import {Tropipay, webhooks} from 'sertropipay';

export async function POST(request) {
    const payload = await request.json();
    const tpp = Tropipay.getInstance();

    if (!tpp.verifyPaymentNotification(payload)) {
        return new Response('Invalid signature', {status: 401});
    }
    if (webhooks.isPaymentSuccessful(payload)) {
        // mark payload.data.reference as paid (do the heavy work asynchronously)
    }
    return new Response('OK'); // answer 200 quickly, Tropipay retries otherwise
}
```

**Hooks.** The raw body is signed with HMAC-SHA256 using the webhook secret and sent in the `X-Tropipay-Signature`
header. Always verify the **raw** body, not the re-serialized JSON:

```js
import {webhooks} from 'sertropipay';

export async function POST(request) {
    const rawBody = await request.text();
    const valid = webhooks.verifyHookSignature({
        rawBody,
        signature: request.headers.get('x-tropipay-signature'),
        secret: process.env.TROPIPAY_WEBHOOK_SECRET,
    });
    if (!valid) return new Response('Invalid signature', {status: 401});
    const event = JSON.parse(rawBody);
    // ...
    return new Response('OK');
}
```

With Express use `express.raw({type: 'application/json'})` (or `bodyParser.json({verify})`) to keep the raw body.

## Errors

Every failure is a `TropipayError`. Both error formats in the docs are normalized:

```js
const {TropipayError, TropipayValidationError} = require('sertropipay');

try {
    await tpp.transfers.payout(payload);
} catch (error) {
    if (error instanceof TropipayValidationError) {
        console.log(error.errors);       // ['amount is required', ...] — nothing was sent
    } else if (error instanceof TropipayError) {
        console.log(error.status);       // 400, 401, 403, 404, 422, 429, 500...
        console.log(error.code);         // 'E01001', 'VALIDATION_ERROR', 'account_not_found'...
        console.log(error.message);
        console.log(error.raw);          // original response body
        console.log(error.rateLimit);    // {limit, remaining, reset, retryAfter} when present
    }
}
```

| Class | When |
|---|---|
| `TropipayError` | API error (`status`) or network error (`code`, e.g. `ECONNRESET`) |
| `TropipayValidationError` | The payload doesn't match the documented contract (`errors`) |
| `TropipayConfigError` | Missing configuration (`missing`), e.g. no credentials |

`ERROR_CODES` maps the documented codes (`E00001`…`E02003`) to their names.

## Models

Models are optional helpers. Every resource also accepts plain objects. They take a single object, or the
positional arguments of 1.x:

```js
const {TropipayModels} = require('sertropipay');
const {PaymentCardModel, ClientModel, BeneficiaryModel, CryptoBeneficiaryModel, PayoutModel,
    PayoutSimulationModel, HookModel} = TropipayModels;

const card = new PaymentCardModel({
    concept: 'Bicycle',
    description: 'Two wheels',
    amount: 1000,
    currency: 'EUR',
    singleUse: false,
    favorite: true,
    client: new ClientModel({name: 'John', lastName: 'Doe', /* ... */}),
});
await tpp.paymentCards.create(card);
```

1.x names still work: `CientModel`, `CientPayload`, `ExternalDepositAccountModel`, `InternalDepositAccountModel`.
The legacy `cient` field is sent as `client`.

## Constants

```js
const {
    ENVIRONMENTS, CURRENCIES, PAYMENT_METHODS, PAYMENT_3DS, PAYMENT_CARD_STATES,
    BENEFICIARY_TYPES, BENEFICIARY_PAYMENT_TYPES, USER_RELATION_TYPES, CRYPTO_NETWORKS,
    HOOK_EVENTS, HOOK_TARGETS, MOVEMENT_STATES, SECURITY_CODE_TYPES, TWO_FACTOR_TYPES,
    REASONS, REASON_OTHERS, ERROR_CODES, SANDBOX,
} = require('sertropipay');

REASONS[4];                           // 'Travel fund'
SANDBOX.SECURITY_CODE;                // '123456'
SANDBOX.TEST_CARDS.SET_3_SUCCESS.VISA // '4111111111111111'
```

## Login with Tropipay (TropipayAuth)

`TropipayAuth` lets a user log in with Tropipay using OAuth authorization code + PKCE. This user-level flow is not
documented for API v3 yet, so it uses the legacy endpoints and generates the same urls as 1.x.

```dotenv
APP_URL=https://my-app.com
TROPIPAY_SERVER=https://sandbox.tropipay.me
TROPIPAY_CLIENT_ID="your client id"
TROPIPAY_CLIENT_SECRET="your client secret"
TROPIPAY_SCOPE_FRONT="ALLOW_GET_PROFILE_DATA"
TROPIPAY_CODE_CHALLENGE_METHOD=S256
```

```js
// app/api/auth/login/route.js
import {NextResponse} from 'next/server';
import {TropipayAuth} from 'sertropipay';

export async function GET() {
    const {url, code_verifier, state} = new TropipayAuth().Login({provider: 'tropipay'});
    const response = NextResponse.redirect(url);
    const cookie = {httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600};
    response.cookies.set('code_verifier', code_verifier, cookie);
    response.cookies.set('state', state, cookie);
    return response;
}
```

```js
// app/api/auth/callback/route.js
import {NextResponse} from 'next/server';
import {TropipayAuth} from 'sertropipay';

export async function GET(request) {
    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const codeVerifier = request.cookies.get('code_verifier')?.value;

    if (!code || !state || state !== request.cookies.get('state')?.value) {
        return NextResponse.redirect(`${process.env.APP_URL}/login`);
    }

    const auth = new TropipayAuth();
    const token = await auth.GetAuthorizationToken(code, codeVerifier);
    if (!token) return NextResponse.redirect(`${process.env.APP_URL}/login`);

    const profile = await auth.GetProfile(token.access_token, token.token_type);
    // create your session with `profile`...
    return NextResponse.redirect(process.env.APP_URL);
}
```

The constructor accepts the same values as options (`clientId`, `clientSecret`, `scopes`, `challengeMethod`,
`serverUrl`, `appUrl`, `callbackPath`). `GetAuthorizationToken(code, verifier, redirectUri?)` and `GetProfile` return
`false` on failure.

## Next.js example

```js
// lib/tropipay.js — one instance for the whole server
import {Tropipay} from 'sertropipay';

export const tpp = Tropipay.getInstance({
    environment: process.env.TROPIPAY_ENV,  // 'sandbox' | 'production'
    logger: process.env.NODE_ENV === 'development' ? console : undefined,
});
```

```js
// app/api/checkout/route.js
import {tpp} from '@/lib/tropipay';
import {TropipayError} from 'sertropipay';

export async function POST(request) {
    const order = await request.json();
    try {
        const card = await tpp.paymentCards.create({
            reference: order.id,
            concept: `Order ${order.id}`,
            description: order.description,
            amount: order.totalInCents,
            currency: 'EUR',
            singleUse: true,
            favorite: false,
            serviceDate: new Date().toISOString().slice(0, 10),
            urlSuccess: `${process.env.APP_URL}/checkout/ok`,
            urlFailed: `${process.env.APP_URL}/checkout/ko`,
            urlNotification: `${process.env.APP_URL}/api/tropipay/notification`,
            client: null, // Tropipay asks the customer for their data
        });
        return Response.json({paymentUrl: card.shortUrl});
    } catch (error) {
        const status = error instanceof TropipayError && error.status ? error.status : 500;
        return Response.json({error: error.message}, {status});
    }
}
```

## Migrating from 1.x

2.0 targets API v3. The 1.x API keeps working, but the requests now go to v3:

| 1.x | 2.x |
|---|---|
| `TROPIPAY_SERVER=https://tropipay-dev.herokuapp.com` | `TROPIPAY_ENV=sandbox` (or `TROPIPAY_SERVER=https://sandbox.tropipay.me`) |
| `Tropipay.getInstance().Authorize()` | same, or `authorize()` |
| `CreatePaymentCard(payload)` | `paymentCards.create(payload)` (returns the card or throws) |
| `CreateMediationPaymentCard(payload)` | `paymentCards.createMediation(payload)` |
| `GetDepositAccountsList()` | `beneficiaries.list()` |
| `CreateNewDepositAccount(payload)` | `beneficiaries.create(payload)` / `createBank` / `createCrypto` |
| `GetEventsAllowSubscriptionList()` | `hooks.listEvents()` |
| `GetEventsSubscribedHooksList()` | `hooks.list()` |
| `SubscribeNewEventHook(payload)` | `hooks.subscribe(payload)` |
| `CientModel` / `cient` | `ClientModel` / `client` |
| `ExternalDepositAccountModel` | `BeneficiaryModel` (v3 fields: `countryISO`, `currency`, …) |

The 1.x methods keep their old return values (`{success: {data}}`, the data, `false` or `{error}`). The new methods
return the data and throw `TropipayError`. See [CHANGELOG.md](CHANGELOG.md) for every change.

## Sandbox testing

- Sandbox web: `https://sandbox.tropipay.me`. Business test account: `testdevbusiness@mailinator.com` / `4321REWq`.
- SMS and 2FA codes are always `123456` (`SANDBOX.SECURITY_CODE`).
- Test cards are in `SANDBOX.TEST_CARDS` (see [Testing Card Payments](https://doc.tropipay.com/docs/api-reference/testing-card-payments)).
- Limit: 60 payment card creations per minute.

### Tests

```bash
npm test                  # unit tests, offline (mocked HTTP)
npm run test:integration  # real calls to the sandbox using the credentials in .env
```

The integration suite reads `.env`, which needs at least `TROPIPAY_SERVER=https://sandbox.tropipay.me`,
`TROPIPAY_CLIENT_ID` and `TROPIPAY_CLIENT_SECRET`. `TROPIPAY_WEBHOOK_SERVER` (e.g. a webhook.site url) is used as
the notification url.

- **Safety:**
  - It skips itself without credentials and refuses to run against production.
  - It only reads data or runs reversible cycles (payment card, test beneficiary, hook subscription).
  - It never moves money, never touches existing hooks and never changes the password or 2FA.
- **Test beneficiary:** it is reused between runs, because some credentials can't delete beneficiaries (the
  `delete` test is then skipped).

## Documentation vs. real API

These are the differences found by running the suite against the sandbox. The SDK follows the real behaviour.

| Topic | Docs | Real API |
|---|---|---|
| List responses (movements, beneficiaries, scheduled) | `{items, hasMore}` | `{count, rows, limit, offset}` (`iterate()` handles both) |
| Movements `query` filter | JSON object | JSON list of `{key, op, value}` conditions |
| GraphQL pagination type | `Pagination` | `PaginationInput`, and `amount` is `{value currency}` |
| Token `expires_in` | seconds | an epoch timestamp (both are supported) |
| `PUT /deposit_accounts/` | `{id, alias}` | also requires `securityCode` |
| `GET /deposit_accounts/?search=` | filters | ignored by the sandbox |
| `GET /scheduled_transaction?q.*` | filters | ignored by the sandbox |
| `POST /movements/business` | movements | the sandbox answers `Failed to fetch movements` (introspection works) |
| `GET /accounts/balance/{accountNumber}` | any account | only active accounts (inactive ones: "The account was not found") |
