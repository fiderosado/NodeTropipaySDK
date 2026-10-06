// TropipayEndpoints
// API v3 paths (relative to <server>/api/v3) as documented in https://doc.tropipay.com
// Path params are written as :name.
const TropipayEndpoints = {
    tppServerUrl: process.env.TROPIPAY_SERVER,
    access: {
        token: '/access/token',
    },
    users: {
        profile: '/users/profile',
        sendSecurityCode: '/users/sendSecurityCode',
        validateToken: '/users/validateToken',
        twoFactor: '/users/2fa',
        twoFactorSecret: '/users/2fa/secret',
        password: '/users/pass',
        disable: '/users/disable',
    },
    accounts: {
        list: '/accounts/',
        addTropicard: '/accounts/',
        balance: '/accounts/balance/:accountNumber',
        allBalance: '/accounts/allBalance',
        cryptoSelfCharge: '/accounts/:accountId/selfcharge/crypto',
        movements: '/accounts/:accountId/movements',
    },
    movements: {
        list: '/movements/',
        business: '/movements/business',
        refund: '/movements/in/refund',
    },
    transfers: {
        payout: '/operations/payout',
        simulate: '/operations/payout/simulate',
    },
    paymentCards: {
        list: '/paymentcards',
        create: '/paymentcards',
        get: '/paymentcards/:id',
    },
    beneficiaries: {
        create: '/deposit_accounts/',
        list: '/deposit_accounts/',
        update: '/deposit_accounts/',
        get: '/deposit_accounts/:beneficiaryId',
        delete: '/deposit_accounts/:beneficiaryId',
        validateAccountNumber: '/deposit_accounts/validate_account_number',
    },
    hooks: {
        list: '/user/hooks',
        create: '/user/hooks',
        update: '/user/hooks',
        events: '/user/hooks/events',
        byEvent: '/user/hooks/:eventName',
        byEventAndTarget: '/user/hooks/:eventName/:targetName',
    },
    scheduledTransactions: {
        list: '/scheduled_transaction',
    },
    // Endpoints that only exist in the legacy API (not documented for v3). Relative to <server>.
    legacy: {
        mediation: '/api/v2/paymentcards/mediation',
        authorize: '/api/v2/access/authorize',
        token: '/api/v2/access/token',
        profile: '/api/users/profile',
    },
};

module.exports = TropipayEndpoints;
