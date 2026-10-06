//TropipayConstants — values documented in https://doc.tropipay.com (API v3)
const {ENVIRONMENTS} = require('./core/config');

const CURRENCIES = Object.freeze({USD: 'USD', EUR: 'EUR', USDC: 'USDC'});

const PAYMENT_METHODS = Object.freeze({
    EXTERNAL_CARD: 'EXT',
    TROPIPAY: 'TPP',
    TROPIPAY_GIFTCARD: 'TPP_GIFTCARD',
    CRYPTO: 'CRYPTO',
    APPLE_PAY: 'APPLE_PAY',
    GOOGLE_PAY: 'GOOGLE_PAY',
});

const PAYMENT_3DS = Object.freeze({DEFAULT: 'default', FORCE: 'force', BYPASS: 'bypass'});

const PAYMENT_CARD_STATES = Object.freeze({ACTIVE: 1, USED_OR_EXPIRED: 0});

const BENEFICIARY_TYPES = Object.freeze({EXTERNAL: 2, CRYPTO: 3});

const BENEFICIARY_PAYMENT_TYPES = Object.freeze({BANK_DEPOSIT: '2', CRYPTO: '100'});

const USER_RELATION_TYPES = Object.freeze({
    MYSELF: 0,
    SPOUSE: 1,
    FAMILY: 2,
    FRIEND: 3,
    BUSINESS_PARTNER: 4,
});

const CRYPTO_NETWORKS = Object.freeze({
    SOLANA: 'SOLANA',
    ETHEREUM: 'ETHEREUM',
    POLYGON: 'POLYGON',
    BSC: 'BSC',
    BINANCE_SMART_CHAIN: 'BINANCE_SMART_CHAIN',
    BEP20: 'BEP20',
    ARBITRUM: 'ARBITRUM',
    OPTIMISM: 'OPTIMISM',
    AVALANCHE: 'AVALANCHE',
    BASE: 'BASE',
    TRON: 'TRON',
    BINANCE_CHAIN: 'BINANCE_CHAIN',
    BEP2: 'BEP2',
    BITCOIN: 'BITCOIN',
    BTC: 'BTC',
});

const HOOK_EVENTS = Object.freeze({
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login',
    USER_KYC: 'user_kyc',
    PAYMENT_IN_STATE_CHANGE: 'payment_in_state_change',
    PAYMENT_OUT_STATE_CHANGE: 'payment_out_state_change',
    BENEFICIARY_ADDED: 'beneficiary_added',
    BENEFICIARY_UPDATED: 'beneficiary_updated',
    BENEFICIARY_DELETED: 'beneficiary_deleted',
});

const HOOK_TARGETS = Object.freeze({WEB: 'web', EMAIL: 'email'});

const MOVEMENT_STATES = Object.freeze({
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
});

const SECURITY_CODE_TYPES = Object.freeze({SMS: 'sms', EMAIL: 'email', TOTP: 'totp'});

const TWO_FACTOR_TYPES = Object.freeze({TOTP: 'totp', SMS: 'sms'});

/** Reason ids for payment cards and payouts. Reason 9 ("Others") requires `reasonDes`. */
const REASONS = Object.freeze({
    1: 'Home repair',
    3: 'Family support',
    4: 'Travel fund',
    5: 'Purchase of real estate',
    6: 'Purchase of movable property',
    7: 'Studies',
    8: 'Medical expenses',
    9: 'Others',
    10: 'Debt payment',
    11: 'Tourism',
    12: 'Auto shipment',
    13: 'Account activation',
    14: 'Sports activities',
    15: 'Donation',
    16: 'Affiliate commission',
    17: 'Salary',
    18: 'Savings',
    19: 'Rent and lease',
    20: 'Shared expenses',
    21: 'Utility payment',
    22: 'Gift',
    23: 'Purchase of cryptocurrency',
    24: 'Operating expenses',
    25: 'Currency exchange',
    26: 'Accommodation',
    27: 'Equipment purchase',
    28: 'Consultancy',
    29: 'Software development',
    30: 'Refund',
    31: 'Shipping',
    32: 'Personal expenses',
    33: 'Investment',
    34: 'Bill payment',
    35: 'Payment to hosts',
    36: 'Transportation',
    37: 'Loan',
    38: 'Bonus',
    39: 'Halloween Remittance',
    41: 'Plink Remittance',
    78: 'R1-2023',
    79: 'HAPPYWEEK',
    80: '#AhiTeMandoUnBeso',
});

const REASON_OTHERS = 9;

const ERROR_CODES = Object.freeze({
    E00001: 'invalid_credentials',
    E00002: 'token_expired',
    E00003: 'permission_denied',
    E00004: 'resource_not_found',
    E00005: 'invalid_parameter',
    E01001: 'insufficient_funds',
    E01002: 'beneficiary_not_found',
    E01003: 'invalid_amount',
    E01004: '2fa_required',
    E01005: 'invalid_security_code',
    E01006: 'transfer_limit_exceeded',
    E02001: 'invalid_account_number',
    E02002: 'invalid_swift_code',
    E02003: 'beneficiary_already_exists',
});

/** Sandbox helpers: SMS/2FA codes are always 123456 and these cards simulate each scenario. */
const SANDBOX = Object.freeze({
    SECURITY_CODE: '123456',
    TEST_CARDS: Object.freeze({
        SET_1_SUCCESS: Object.freeze({
            AMEX: '340000000004001',
            DISCOVER: '6573700000000009',
            MASTERCARD: '5591390000000504',
            VISA: '4900490000000501',
        }),
        SET_1_AUTH_FAILED: Object.freeze({
            AMEX: '340000000004019',
            DISCOVER: '6599999900000313',
            MASTERCARD: '5591390000000520',
            VISA: '4900490000000519',
        }),
        SET_2_SUCCESS: Object.freeze({VISA: '4000000000002503', MASTERCARD: '5200000000002151'}),
        SET_2_FAILED: Object.freeze({VISA: '4000000000002420', MASTERCARD: '5200000000002664'}),
        SET_3_SUCCESS: Object.freeze({
            VISA: '4111111111111111',
            MASTERCARD: '5555555555555555',
            MAESTRO: '6771290000000001',
        }),
        SET_3_DECLINED: '4000000000000002',
        SET_3_INSUFFICIENT_FUNDS: '4111111111111002',
    }),
});

module.exports = {
    ENVIRONMENTS,
    CURRENCIES,
    PAYMENT_METHODS,
    PAYMENT_3DS,
    PAYMENT_CARD_STATES,
    BENEFICIARY_TYPES,
    BENEFICIARY_PAYMENT_TYPES,
    USER_RELATION_TYPES,
    CRYPTO_NETWORKS,
    HOOK_EVENTS,
    HOOK_TARGETS,
    MOVEMENT_STATES,
    SECURITY_CODE_TYPES,
    TWO_FACTOR_TYPES,
    REASONS,
    REASON_OTHERS,
    ERROR_CODES,
    SANDBOX,
};
