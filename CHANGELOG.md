# Changelog

## 2.0.0

The SDK now targets the **Tropipay API v3** ([doc.tropipay.com](https://doc.tropipay.com)). The 1.x API keeps
working on top of it.

### Added

- Resources covering every endpoint in the v3 docs:
  - `users`: profile, security codes, token validation, 2FA, password, disable.
  - `accounts`: list, balance, all balances, Tropicard, crypto self charge, movements.
  - `movements`: list with filters, by account, GraphQL (`graphql`, `search`), refunds, async `iterate`.
  - `transfers`: `payout`, `simulate`.
  - `paymentCards`: `create`, `list`, `get`, `iterate`, plus `createMediation` on the legacy v2 endpoint.
  - `beneficiaries` (alias `depositAccounts`): `create`, `createBank`, `createCrypto`, `list`, `iterate`, `get`,
    `update`, `delete`, `validateAccountNumber`.
  - `hooks`: `listEvents`, `list`, `subscribe`, `update`, `listByEvent`, `get`, `unsubscribe`.
  - `scheduledTransactions.list` with `q.` filters.
  - `tpp.request()` for any other endpoint.
- Token management:
  - The token is cached and renewed before it expires.
  - Concurrent calls share a single token request.
  - After a `401` the token is renewed and the request retried once.
  - `expires_in` is understood as seconds, as an epoch, or from the JWT `exp`.
- Retries for `429` responses using `Retry-After` / `X-RateLimit-Reset`.
- Per call options: `token` (user-level tokens), `deviceId` (`X-Device-Id`), `headers`, `signal`, `validate`.
- Payload validation based on the docs (`TropipayValidationError`). No request is sent when the payload is invalid.
- Typed errors (`TropipayError`, `TropipayValidationError`, `TropipayConfigError`) that normalize both API error
  formats and never include the token or the client secret.
- Webhook helpers:
  - `verifyHookSignature` checks the HMAC-SHA256 in `X-Tropipay-Signature`.
  - `verifyPaymentNotification` checks the `signatureV3` of a `urlNotification` payload.
  - `isPaymentSuccessful` tells whether a notification reports a paid order.
- Constants: reasons, error codes, hook events, crypto networks, sandbox test cards, etc.
- v3 models: `ClientModel`, `BeneficiaryModel`, `CryptoBeneficiaryModel`, `PayoutModel`, `PayoutSimulationModel`,
  `HookModel`. All models accept a single object.
- Configuration:
  - Explicit options or `TropipayConfig`, with `TROPIPAY_ENV` (`sandbox` / `production`) as a new env variable.
  - `Tropipay.configure()` and `Tropipay.create()` for multi-account setups.
  - Optional `logger`.
- ES module entry point (`import {Tropipay} from 'sertropipay'`) and TypeScript types.
- Test suite (`npm test`, built-in `node:test`).
- Sandbox integration suite (`npm run test:integration`) that reads the credentials from `.env`.

### Verified against the sandbox

The integration suite showed where the docs and the API differ, and the SDK follows the API:

- List endpoints return `{count, rows}`; `iterate()` paginates with `count`.
- Movement filters are sent as `[{key, op, value}]`, built from an object or passed as is.
- The GraphQL search uses `PaginationInput` and the real `Movement` fields.
- `beneficiaries.update` requires `securityCode`.
- `expires_in` comes as an epoch timestamp.

### Changed

- Requests go to `<server>/api/v3`.
  - `sandbox` is `https://sandbox.tropipay.me`.
  - `production` is `https://www.tropipay.com`.
  - `TROPIPAY_SERVER` still works and may include `/api/v3`.
  - Without configuration the SDK uses the sandbox and emits a Node warning. It also warns when the legacy
    `tropipay-dev.herokuapp.com` server is configured.
- The legacy `cient` field (and `CientModel`) is sent as `client`, the field the API expects.
- `"true"`/`"false"` strings in payment card booleans are converted to booleans.
- Bank beneficiaries send `paymentType` as a string (`"2"`) and crypto ones as a number (`100`), as documented.
- `ExternalDepositAccountModel` now applies its defaults (`beneficiaryType: 2`, `searchBy: 1`,
  `userRelationTypeId: 3`) only to missing values. Before, they were always overwritten with `undefined`.
- `TropipayAuth`:
  - It reports only the names of missing settings. 1.x printed the whole config, including the client secret.
  - It accepts options in the constructor.
  - `GetAuthorizationToken` accepts an optional `redirectUri`.
  - `GetProfile` returns `false` on errors instead of throwing.
  - It keeps generating the same urls as 1.x.
- Legacy wrapper classes (`TropipaySession`, `TropipayDepositAccount`, `TropipayHooks`) delegate to the instance.
  The circular `require` and the stale headers that caused 401s after the token was renewed are gone.
- Dependencies: only `axios` (`^1.20.0`). Removed `jsonwebtoken`, `crypto-js` and `cookies-next`, which also
  removes Next.js from the dependency tree.
- Requires Node.js 18 or newer.
- `package.json` declares `exports`. Deep imports must include the extension
  (`require('sertropipay/src/classes/Tropipay.js')`).

### Removed

- No more noisy logs (`- Error: ... Instance not exist, creating...`), and errors are no longer dumped to the console.
- The 1.x README documented a `TropipayRequireAuth` export that was never published. It is no longer mentioned.

## 1.4.9

Last release targeting the Tropipay API v2.
