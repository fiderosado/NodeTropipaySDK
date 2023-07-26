const TropipayEndpoints = {
    tppServerUrl: process.env.TROPIPAY_SERVER,
    beneficiary: {
        create: "/api/v2/deposit_accounts",
        getAll: "/api/v2/deposit_accounts",
    },
    payment: {
        create: "/api/v2/paymentcards",
        mediation: {
            create: "/api/v2/paymentcards/mediation"
        },
    },
    movements: {
        list: "/api/v2/movements",
        get_rate: "/api/v2/movements/get_rate"
    },
    countries: {
        list: "/api/v2/countries",
        destinations: "/api/v2/countries/destinations"
    },
    users: {
        profile: "/api/users/profile",
    },
    hooks: {
        add: "/api/v2/hooks",
        list: "/api/v2/hooks",
        allow: {
            list: "/api/v2/hooks/events"
        }
    },
    access: {
        authorize: "/api/v2/access/authorize",
        token: "/api/v2/access/token"
    }
}
module.exports = TropipayEndpoints;