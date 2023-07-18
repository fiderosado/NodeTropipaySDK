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
    }
}
module.exports = TropipayEndpoints;