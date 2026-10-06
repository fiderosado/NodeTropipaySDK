// TropipayPayment (legacy 1.x wrapper, exported as TropipaySession)

/**
 * @deprecated use `tropipay.paymentCards`. Kept so 1.x code keeps working.
 */
class TropipayPayment {
    static _instance;
    #_context;

    constructor(context) {
        if (!context) {
            throw new Error('TropipayPayment need the Tropipay context...');
        }
        this.#_context = context;
    }

    static getInstance(context) {
        if (!context) {
            throw new Error('TropipayPayment need the Tropipay context...');
        }
        if (!TropipayPayment._instance || TropipayPayment._instance.#_context !== context) {
            TropipayPayment._instance = new TropipayPayment(context);
        }
        return TropipayPayment._instance;
    }

    async CreatePaymentCard(paymentCardPayload) {
        return this.#_context.CreatePaymentCard(paymentCardPayload);
    }

    async CreateMediationPaymentCard(payload) {
        return this.#_context.CreateMediationPaymentCard(payload);
    }
}

module.exports = TropipayPayment;
