//TropipayModels
//
// Every model accepts either a single object (recommended):
//     new PaymentCardModel({ concept: 'Bicycle', amount: 1000, ... })
// or the positional arguments of 1.x (kept for backwards compatibility):
//     new PaymentCardModel(reference, concept, description, ...)
//
// toObject() returns a plain object without undefined values, ready for the API.
const {isPlainObject, serialize, toBoolean} = require('../core/utils');
const {BENEFICIARY_TYPES, BENEFICIARY_PAYMENT_TYPES} = require('../constants');

class BaseModel {
    /**
     * @param {string[]} positional - field order of the legacy positional constructor
     * @param {IArguments|Array} args
     * @param {object} [defaults] - applied only to fields left undefined
     */
    _assign(positional, args, defaults = {}) {
        const values = args.length === 1 && isPlainObject(args[0])
            ? args[0]
            : Object.fromEntries(positional.map((field, index) => [field, args[index]]));
        for (const [key, value] of Object.entries({...defaults, ...values})) {
            if (value !== undefined) this[key] = value;
            else if (defaults[key] !== undefined) this[key] = defaults[key];
        }
    }

    /**
     * Gets an object with defined values from the current instance.
     * @param obj - The object to extract defined values from.
     * @returns An object with only the defined values from the input object.
     */
    getDefinedValues(obj) {
        const definedValues = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
                definedValues[key] = obj[key];
            }
        }
        return definedValues;
    }

    toObject() {
        const output = {};
        for (const [key, value] of Object.entries(this)) {
            if (value !== undefined) output[key] = serialize(value);
        }
        return output;
    }

    toJSON() {
        return this.toObject();
    }
}

/**
 * End client of a payment card (`client` object).
 * Positional order (1.x): name, lastName, address, phone, email, termsAndConditions, countryId, countryIso.
 * Object only: city, postCode, state, dateOfBirth (yyyy-MM-dd).
 */
class ClientModel extends BaseModel {
    constructor(...args) {
        super();
        this._assign(['name', 'lastName', 'address', 'phone', 'email', 'termsAndConditions', 'countryId', 'countryIso'], args);
    }

    toObject() {
        const output = super.toObject();
        if ('termsAndConditions' in output) output.termsAndConditions = toBoolean(output.termsAndConditions);
        return output;
    }
}

/**
 * Payment card (paylink). Amounts are integers in cents.
 * Positional order (1.x): reference, concept, description, favorite, amount, currency, singleUse, reasonId,
 * expirationDays, lang, urlSuccess, urlFailed, urlNotification, serviceDate, directPayment, paymentMethods,
 * saveToken, client.
 * Object only: accountId, reasonDes, expirationDate, strictPostalCodeCheck, strictAddressCheck,
 * paymentcardType, payment3DS, imageBase.
 */
class PaymentCardModel extends BaseModel {
    constructor(...args) {
        super();
        this._assign([
            'reference', 'concept', 'description', 'favorite', 'amount', 'currency', 'singleUse', 'reasonId',
            'expirationDays', 'lang', 'urlSuccess', 'urlFailed', 'urlNotification', 'serviceDate', 'directPayment',
            'paymentMethods', 'saveToken', 'client',
        ], args);
    }

    /** @deprecated 1.x typo, use `client` */
    get cient() {
        return this.client;
    }

    set cient(value) {
        this.client = value;
    }
}

/**
 * Bank beneficiary (API v3). Defaults: beneficiaryType 2, paymentType "2".
 * Fields: accountNumber, firstName, lastName, countryISO, userRelationTypeId, currency, city, province, address,
 * postalCode, alias, email, phone, swift.
 */
class BeneficiaryModel extends BaseModel {
    constructor(data = {}) {
        super();
        this._assign([], [data], {
            beneficiaryType: BENEFICIARY_TYPES.EXTERNAL,
            paymentType: BENEFICIARY_PAYMENT_TYPES.BANK_DEPOSIT,
        });
    }
}

/**
 * Crypto wallet beneficiary (API v3). Defaults: beneficiaryType 3, paymentType 100, countryDestinationId 0.
 * Fields: accountNumber (wallet), firstName, lastName, currency, network, alias.
 */
class CryptoBeneficiaryModel extends BaseModel {
    constructor(data = {}) {
        super();
        this._assign([], [data], {
            beneficiaryType: BENEFICIARY_TYPES.CRYPTO,
            paymentType: Number(BENEFICIARY_PAYMENT_TYPES.CRYPTO),
            countryDestinationId: 0,
        });
    }
}

/**
 * External deposit account (1.x). Prefer BeneficiaryModel with API v3.
 * Defaults applied when a value is not provided: beneficiaryType 2, searchBy 1, userRelationTypeId 3.
 */
class ExternalDepositAccountModel extends BaseModel {
    constructor(...args) {
        super();
        this._assign([
            'beneficiaryType', 'searchBy', 'searchValue', 'accountNumber', 'alias', 'userRelationTypeId', 'swift',
            'type', 'firstName', 'lastName', 'secondLastName', 'countryDestinationId', 'paymentType', 'province',
            'city', 'address', 'documentNumber', 'phone', 'documentExpirationDate', 'postalCode', 'documentTypeId',
        ], args, {beneficiaryType: 2, searchBy: 1, userRelationTypeId: 3});
    }
}

/**
 * Internal deposit account (another Tropipay user, 1.x). Not documented for API v3.
 */
class InternalDepositAccountModel extends BaseModel {
    constructor(...args) {
        super();
        this._assign(['beneficiaryType', 'searchBy', 'searchValue', 'alias', 'userRelationTypeId'], args);
    }
}

/**
 * Payout (transfers.payout). Fields: depositaccountId, accountId, currency, destinationCurrency, amount,
 * destinationAmount, conceptTransfer, reasonDes, reasonId, paymentMethod, securityCode.
 */
class PayoutModel extends BaseModel {
    constructor(data = {}) {
        super();
        this._assign([], [data]);
    }
}

/**
 * Payout simulation (transfers.simulate). Fields: depositaccountId, paymentMethod, accountId, currencyToPay,
 * currencyToGet, amountToPay.
 */
class PayoutSimulationModel extends BaseModel {
    constructor(data = {}) {
        super();
        this._assign([], [data]);
    }
}

/**
 * Hook subscription. Positional order: event, target ('web' | 'email'), value (url or email).
 */
class HookModel extends BaseModel {
    constructor(...args) {
        super();
        this._assign(['event', 'target', 'value'], args);
    }
}

module.exports = {
    ClientModel,
    PaymentCardModel,
    BeneficiaryModel,
    CryptoBeneficiaryModel,
    PayoutModel,
    PayoutSimulationModel,
    HookModel,
    ExternalDepositAccountModel,
    InternalDepositAccountModel,
    // 1.x names
    CientModel: ClientModel,
    CientPayload: ClientModel,
};
