//TropipayDepositAccount (legacy 1.x wrapper)

/**
 * @deprecated use `tropipay.beneficiaries`. Kept so 1.x code keeps working.
 */
class TropipayDepositAccount {
    static _instance;
    #_context;

    constructor(context) {
        if (!context) {
            throw new Error('TropipayDepositAccount need the Tropipay context...');
        }
        this.#_context = context;
    }

    static getInstance(context) {
        if (!context) {
            throw new Error('TropipayDepositAccount need the Tropipay context...');
        }
        if (!TropipayDepositAccount._instance || TropipayDepositAccount._instance.#_context !== context) {
            TropipayDepositAccount._instance = new TropipayDepositAccount(context);
        }
        return TropipayDepositAccount._instance;
    }

    async CreateNewDepositAccount(payload) {
        return this.#_context.CreateNewDepositAccount(payload);
    }

    async GetDepositAccountsList() {
        return this.#_context.GetDepositAccountsList();
    }
}

module.exports = TropipayDepositAccount;
