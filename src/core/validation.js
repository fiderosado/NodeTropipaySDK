//TropipayValidation — rules taken from the API v3 documentation
const {TropipayValidationError} = require('./errors');
const {toBoolean, isPlainObject} = require('./utils');
const {
    CURRENCIES,
    PAYMENT_3DS,
    HOOK_TARGETS,
    SECURITY_CODE_TYPES,
    TWO_FACTOR_TYPES,
    REASON_OTHERS,
    BENEFICIARY_TYPES,
} = require('../constants');

const isEmpty = (value) => value === undefined || value === null || value === '';

function requireFields(payload, fields, errors, prefix = '') {
    for (const field of fields) {
        if (isEmpty(payload[field])) errors.push(`${prefix}${field} is required`);
    }
}

function requireOneOf(value, allowed, name, errors) {
    if (!isEmpty(value) && !allowed.includes(value)) {
        errors.push(`${name} must be one of: ${allowed.join(', ')}`);
    }
}

function requireInteger(value, name, errors, min) {
    if (isEmpty(value)) return;
    if (!Number.isInteger(value)) {
        errors.push(`${name} must be an integer amount in cents`);
    } else if (min !== undefined && value < min) {
        errors.push(`${name} must be at least ${min}`);
    }
}

function assertValid(operation, errors) {
    if (errors.length) {
        throw new TropipayValidationError(`Invalid ${operation} payload: ${errors.join('; ')}`, errors);
    }
}

function requirePayload(payload, operation) {
    if (!isPlainObject(payload)) {
        throw new TropipayValidationError(`${operation} needs a payload object`, ['payload is required']);
    }
}

const PAYMENT_CARD_BOOLEANS = ['singleUse', 'favorite', 'directPayment', 'saveToken', 'strictPostalCodeCheck', 'strictAddressCheck'];

/**
 * Applies the safe transformations every payment card payload needs (also in non-validating mode):
 * `cient` -> `client` (legacy typo) and "true"/"false" strings -> booleans.
 */
function normalizePaymentCard(payload) {
    const output = {...payload};
    if (output.client === undefined && output.cient !== undefined) output.client = output.cient;
    delete output.cient;
    for (const key of PAYMENT_CARD_BOOLEANS) {
        if (key in output) output[key] = toBoolean(output[key]);
    }
    if (isPlainObject(output.client)) {
        output.client = {...output.client};
        if ('termsAndConditions' in output.client) {
            output.client.termsAndConditions = toBoolean(output.client.termsAndConditions);
        }
    }
    return output;
}

function validatePaymentCard(payload) {
    const errors = [];
    requireFields(payload, ['concept', 'description', 'amount', 'currency', 'singleUse', 'favorite'], errors);
    if (typeof payload.concept === 'string' && payload.concept.length > 254) {
        errors.push('concept must be at most 254 characters');
    }
    requireInteger(payload.amount, 'amount', errors, 100);
    requireOneOf(payload.currency, Object.values(CURRENCIES), 'currency', errors);
    for (const key of ['singleUse', 'favorite']) {
        if (!isEmpty(payload[key]) && typeof payload[key] !== 'boolean') errors.push(`${key} must be a boolean`);
    }
    if (payload.singleUse === true) {
        requireFields(payload, ['reference', 'serviceDate'], errors);
    }
    if (Number(payload.reasonId) === REASON_OTHERS) requireFields(payload, ['reasonDes'], errors);
    requireOneOf(payload.payment3DS, Object.values(PAYMENT_3DS), 'payment3DS', errors);
    if (!isEmpty(payload.paymentMethods) && !Array.isArray(payload.paymentMethods)) {
        errors.push('paymentMethods must be an array');
    }
    if (isPlainObject(payload.client)) {
        requireFields(payload.client, ['name', 'lastName', 'email', 'phone', 'address'], errors, 'client.');
        if (isEmpty(payload.client.countryId) && isEmpty(payload.client.countryIso)) {
            errors.push('client.countryId or client.countryIso is required');
        }
        if (payload.client.termsAndConditions !== true) errors.push('client.termsAndConditions must be true');
    }
    assertValid('payment card', errors);
}

function isCryptoBeneficiary(payload) {
    return Number(payload.paymentType) === 100 || Number(payload.beneficiaryType) === BENEFICIARY_TYPES.CRYPTO;
}

/**
 * Bank beneficiaries need `paymentType` as a string ("2"); crypto ones as a number (100).
 */
function normalizeBeneficiary(payload) {
    const output = {...payload};
    if (!isEmpty(output.paymentType)) {
        output.paymentType = isCryptoBeneficiary(output) ? Number(output.paymentType) : String(output.paymentType);
    }
    return output;
}

function validateBeneficiary(payload) {
    const errors = [];
    if (isCryptoBeneficiary(payload)) {
        requireFields(payload, ['accountNumber', 'firstName', 'lastName', 'paymentType'], errors);
    } else {
        requireFields(payload, [
            'accountNumber', 'firstName', 'lastName', 'beneficiaryType', 'userRelationTypeId',
            'paymentType', 'currency', 'city', 'province', 'address', 'postalCode',
        ], errors);
        if (isEmpty(payload.countryISO) && isEmpty(payload.countryDestinationId)) {
            errors.push('countryISO is required');
        }
    }
    assertValid('beneficiary', errors);
}

function validateAccountNumberCheck(payload) {
    const errors = [];
    requireFields(payload, ['accountNumber', 'paymentType'], errors);
    assertValid('account number validation', errors);
}

function validatePayout(payload) {
    const errors = [];
    requireFields(payload, [
        'depositaccountId', 'accountId', 'currency', 'destinationCurrency', 'amount', 'destinationAmount',
        'conceptTransfer', 'reasonDes', 'reasonId', 'paymentMethod',
    ], errors);
    requireInteger(payload.amount, 'amount', errors, 1);
    requireInteger(payload.destinationAmount, 'destinationAmount', errors, 1);
    assertValid('payout', errors);
}

function validatePayoutSimulation(payload) {
    const errors = [];
    requireFields(payload, ['depositaccountId', 'paymentMethod', 'accountId', 'currencyToPay', 'currencyToGet', 'amountToPay'], errors);
    requireInteger(payload.amountToPay, 'amountToPay', errors, 1);
    assertValid('payout simulation', errors);
}

function validateHook(payload) {
    const errors = [];
    requireFields(payload, ['event', 'target', 'value'], errors);
    requireOneOf(payload.target, Object.values(HOOK_TARGETS), 'target', errors);
    assertValid('hook', errors);
}

function validateRefund(payload) {
    const errors = [];
    requireFields(payload, ['orderCode', 'amount', 'securityCode'], errors);
    requireInteger(payload.amount, 'amount', errors, 1);
    assertValid('refund', errors);
}

function validateSecurityCode(payload, operation) {
    const errors = [];
    requireFields(payload, ['securityCode'], errors);
    assertValid(operation, errors);
}

function validateSendSecurityCode(payload) {
    const errors = [];
    requireFields(payload, ['type'], errors);
    requireOneOf(payload.type, [SECURITY_CODE_TYPES.SMS, SECURITY_CODE_TYPES.EMAIL], 'type', errors);
    if (payload.type === SECURITY_CODE_TYPES.SMS) requireFields(payload, ['phone', 'callingCode'], errors);
    if (payload.type === SECURITY_CODE_TYPES.EMAIL) requireFields(payload, ['email'], errors);
    assertValid('send security code', errors);
}

function validateSecurityToken(payload) {
    const errors = [];
    requireFields(payload, ['securityCode', 'type'], errors);
    requireOneOf(payload.type, Object.values(SECURITY_CODE_TYPES), 'type', errors);
    assertValid('validate token', errors);
}

function validateTwoFactor(payload) {
    const errors = [];
    requireFields(payload, ['enabled', 'type', 'securityCode'], errors);
    if (!isEmpty(payload.enabled) && typeof payload.enabled !== 'boolean') errors.push('enabled must be a boolean');
    requireOneOf(payload.type, Object.values(TWO_FACTOR_TYPES), 'type', errors);
    assertValid('two factor configuration', errors);
}

function validatePasswordChange(payload) {
    const errors = [];
    requireFields(payload, ['oldPass', 'newPass'], errors);
    assertValid('password change', errors);
}

function validateTropicard(payload) {
    const errors = [];
    requireFields(payload, ['tropicardNumber', 'pin'], errors);
    if (!isEmpty(payload.tropicardNumber) && !/^\d{16}$/.test(String(payload.tropicardNumber))) {
        errors.push('tropicardNumber must have 16 digits');
    }
    if (!isEmpty(payload.pin) && !/^\d{4}$/.test(String(payload.pin))) errors.push('pin must have 4 digits');
    assertValid('tropicard', errors);
}

module.exports = {
    requirePayload,
    normalizePaymentCard,
    validatePaymentCard,
    normalizeBeneficiary,
    validateBeneficiary,
    validateAccountNumberCheck,
    validatePayout,
    validatePayoutSimulation,
    validateHook,
    validateRefund,
    validateSecurityCode,
    validateSendSecurityCode,
    validateSecurityToken,
    validateTwoFactor,
    validatePasswordChange,
    validateTropicard,
};
