const TropipayEndpoints = {
    tppServerUrl: process.env.TROPIPAY_SERVER,
    mediation: {
        create: "/api/v2/paymentcards/mediation"
    },
    beneficiary: {
        create: "/api/v2/deposit_accounts",
        getAll: "/api/v2/deposit_accounts",
    }
}
module.exports = TropipayEndpoints;