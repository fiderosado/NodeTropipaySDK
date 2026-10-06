// Type definitions for sertropipay 2.x (Tropipay API v3)

export type Environment = 'sandbox' | 'production';
export type Currency = 'USD' | 'EUR' | 'USDC' | (string & {});
export type PaymentMethod = 'EXT' | 'TPP' | 'TPP_GIFTCARD' | 'CRYPTO' | 'APPLE_PAY' | 'GOOGLE_PAY' | (string & {});
export type HookTarget = 'web' | 'email';
export type HookEventName =
    | 'user_signup' | 'user_login' | 'user_kyc' | 'payment_in_state_change' | 'payment_out_state_change'
    | 'beneficiary_added' | 'beneficiary_updated' | 'beneficiary_deleted' | (string & {});
export type MovementState = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Logger {
    debug?(message: string): void;
    info?(message: string): void;
    warn?(message: string): void;
    error?(message: string): void;
}

export interface TropipayOptions {
    /** Defaults to process.env.TROPIPAY_CLIENT_ID */
    clientId?: string;
    /** Defaults to process.env.TROPIPAY_CLIENT_SECRET */
    clientSecret?: string;
    /** Optional scopes sent with the token request. Defaults to process.env.TROPIPAY_SCOPE */
    scopes?: string;
    /** 'sandbox' (default) or 'production'. Defaults to process.env.TROPIPAY_ENV */
    environment?: Environment;
    /** Custom server, e.g. https://sandbox.tropipay.me. Defaults to process.env.TROPIPAY_SERVER */
    serverUrl?: string;
    /** @deprecated alias of serverUrl */
    tppServerUrl?: string;
    deployMode?: string;
    /** Extra default headers */
    headers?: Record<string, string>;
    /** @deprecated alias of headers */
    header?: Record<string, string>;
    /** Pre-obtained access token (used until it expires; renewed with the credentials when present) */
    accessToken?: string;
    expiresIn?: number;
    tokenType?: string;
    /** Default X-Device-Id header */
    deviceId?: string;
    /** Request timeout in ms (30000) */
    timeout?: number;
    /** Retries for 429 responses (2) */
    maxRetries?: number;
    /** Max wait between retries in ms (10000) */
    maxRetryDelay?: number;
    /** Seconds before expiry when the token is renewed (300) */
    tokenRefreshMargin?: number;
    /** Validate payloads before sending them (true) */
    validate?: boolean;
    userAgent?: string;
    logger?: Logger;
    /** Custom axios adapter (tests) */
    httpAdapter?: unknown;
}

export interface RequestOptions {
    /** Bearer token to use instead of the managed one (e.g. a user-level token) */
    token?: string;
    /** Sent as X-Device-Id */
    deviceId?: string;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** Override the instance `validate` option for this call */
    validate?: boolean;
}

export interface RawRequest {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | (string & {});
    path: string;
    query?: Record<string, unknown>;
    body?: unknown;
    headers?: Record<string, string>;
    token?: string;
    deviceId?: string;
    auth?: boolean;
    baseUrl?: string;
    signal?: AbortSignal;
}

export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    [key: string]: unknown;
}

export interface PaginationParams {
    limit?: number;
    offset?: number;
}

export interface IterateParams extends PaginationParams {
    /** Stop after this many items */
    max?: number;
}

/* ----------------------------------------------------------------------------- Users */

export interface User {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    state: number;
    kycLevel: number;
    balance: number;
    pendingIn: number;
    pendingOut: number;
    twoFaMode: number;
    logo?: string;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

export interface SendSecurityCodePayload {
    type: 'sms' | 'email';
    phone?: string;
    callingCode?: string;
    email?: string;
}

export interface ValidateTokenPayload {
    securityCode: string;
    type: 'sms' | 'email' | 'totp';
}

export interface ValidateTokenResponse {
    isValid: boolean;
    user: User;
    token: string;
}

export interface TwoFactorPayload {
    enabled: boolean;
    type: 'totp' | 'sms';
    securityCode: string;
}

export declare class Users {
    getProfile(options?: RequestOptions): Promise<User>;
    sendSecurityCode(payload: SendSecurityCodePayload, options?: RequestOptions): Promise<any>;
    validateToken(payload: ValidateTokenPayload, options?: RequestOptions): Promise<ValidateTokenResponse>;
    configureTwoFactor(payload: TwoFactorPayload, options?: RequestOptions): Promise<any>;
    getTwoFactorSecret(options?: RequestOptions): Promise<{ secret: string; qrCodeUrl: string }>;
    changePassword(payload: { oldPass: string; newPass: string }, options?: RequestOptions): Promise<any>;
    disable(options?: RequestOptions): Promise<{ success: boolean; message: string }>;
}

/* -------------------------------------------------------------------------- Accounts */

export interface Account {
    id: number;
    accountNumber: string;
    userId: string;
    alias: string;
    balance: number;
    pendingIn: number;
    pendingOut: number;
    state: number;
    currency: string;
    type: number;
    isDefault: boolean;
    services: { slug: string; enabled: boolean }[];
    paymentMethods: { slug: string; name: string; enabled: boolean }[];
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

export interface AccountBalance {
    accountNumber?: string;
    balance: number;
    pendingIn?: number;
    pendingOut?: number;
    currency: string;
}

export interface CryptoDepositInfo {
    feePercent: number;
    feeFixed: number;
    accounts: { address: string; network: string; currency: string }[];
}

export declare class Accounts {
    list(params?: { type?: string | number }, options?: RequestOptions): Promise<Account[]>;
    getBalance(accountNumber: string, options?: RequestOptions): Promise<AccountBalance>;
    getAllBalances(options?: RequestOptions): Promise<AccountBalance[]>;
    addTropicard(payload: { tropicardNumber: string; pin: string }, options?: RequestOptions): Promise<any>;
    getCryptoDepositAddress(accountId: number | string, options?: RequestOptions): Promise<CryptoDepositInfo>;
    listMovements(accountId: number | string, params?: MovementListParams, options?: RequestOptions): Promise<MovementList>;
}

/* ------------------------------------------------------------------------- Movements */

export interface Movement {
    id: number;
    amount: number;
    currency: string;
    /** Numeric booking state in the REST API (e.g. 5 = completed) */
    state: number | MovementState;
    accountId?: number;
    reference?: string;
    bankOrderCode?: string;
    bookingDate?: string;
    createdAt: string;
    completedAt?: string;
    balanceBefore: number | null;
    balanceAfter: number | null;
    [key: string]: unknown;
}

/** Operators accepted by GET /movements/ (checked against the API) */
export type FilterOperator = 'eq' | 'ne' | 'in' | 'notIn' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'iLike' | 'between';

/** Raw condition, as the API expects it: {"key":"currency","op":"eq","value":"USD"} */
export interface FilterCondition {
    key: string;
    op: FilterOperator;
    value: unknown;
}

/**
 * Object form, converted to conditions: scalars -> eq, arrays -> in, {gte: 1, lte: 2} -> one condition per operator,
 * amountGte/amountLte/createdAtFrom/createdAtTo/completedAtFrom/completedAtTo -> gte/lte on amount/createdAt/completedAt.
 */
export interface MovementFilter {
    currency?: string;
    state?: number | number[];
    amountGte?: number;
    amountLte?: number;
    createdAtFrom?: string;
    createdAtTo?: string;
    completedAtFrom?: string;
    completedAtTo?: string;
    reference?: string | Partial<Record<FilterOperator, unknown>>;
    [key: string]: unknown;
}

export interface MovementListParams extends PaginationParams {
    /** Encoded as the JSON `query` param */
    filter?: MovementFilter | FilterCondition[];
    /** @deprecated use filter */
    query?: MovementFilter | FilterCondition[] | string;
}

/** Shape returned by the API list endpoints */
export interface ListPage<T> {
    count: number;
    rows: T[];
    limit?: number;
    offset?: number;
}

export type MovementList = ListPage<Movement>;

/** Filter of the GraphQL `movements` query (MovementFilter input in the live schema) */
export interface GraphqlMovementFilter {
    id?: number;
    amountGte?: number;
    amountLte?: number;
    amountChargedGte?: number;
    amountChargedLte?: number;
    destinationCurrency?: string;
    state?: ('completed' | 'pending' | 'cancelled')[];
    createdAtFrom?: string;
    createdAtTo?: string;
    completedAtFrom?: string;
    completedAtTo?: string;
    movementType?: ('ADD' | 'OTA' | 'PHONERECHARGE' | 'GIFTCARD' | 'REMITTANCE' | 'REFUND' | 'TRANSFER' | 'CHARGE' | 'PAYMENT')[];
    paymentMethod?: ('CARD' | 'TROPICARD' | 'GIFTCARD' | 'INTERNAL' | 'CRYPTO' | 'WIRE')[];
    email?: string;
    concept?: string;
    sender?: string;
    recipient?: string;
    reference?: string;
    bankOrderCode?: string;
    accountId?: number;
    search?: string;
    [key: string]: unknown;
}

export interface RefundPayload {
    orderCode: string;
    amount: number;
    securityCode: string;
}

export declare class Movements {
    list(params?: MovementListParams, options?: RequestOptions): Promise<MovementList>;
    listByAccount(accountId: number | string, params?: MovementListParams, options?: RequestOptions): Promise<MovementList>;
    iterate(params?: MovementListParams & IterateParams & { accountId?: number | string }, options?: RequestOptions): AsyncGenerator<Movement>;
    graphql<T = any>(query: string, variables?: Record<string, unknown>, options?: RequestOptions): Promise<T>;
    search<T = any>(params?: { filter?: GraphqlMovementFilter; pagination?: PaginationParams; fields?: string }, options?: RequestOptions): Promise<T>;
    refund(payload: RefundPayload, options?: RequestOptions): Promise<any>;
}

/* ------------------------------------------------------------------------- Transfers */

export interface PayoutPayload {
    depositaccountId: number;
    accountId: number;
    currency: string;
    destinationCurrency: string;
    amount: number;
    destinationAmount: number;
    conceptTransfer: string;
    reasonDes: string;
    reasonId: number;
    paymentMethod: PaymentMethod;
    securityCode?: string;
}

export interface Transfer {
    id: number;
    reference: string;
    bankOrderCode?: string;
    state: string;
    amount: number;
    currency: string;
    destinationAmount: number;
    destinationCurrency: string;
    conversionRate?: number;
    bookingDate: string;
    isInternal: boolean;
    depositaccountId: number;
    [key: string]: unknown;
}

export interface PayoutSimulationPayload {
    depositaccountId: number;
    paymentMethod: PaymentMethod;
    accountId: number;
    currencyToPay: string;
    currencyToGet: string;
    amountToPay: number;
}

export declare class Transfers {
    payout(payload: PayoutPayload | PayoutModel, options?: RequestOptions): Promise<Transfer>;
    simulate(payload: PayoutSimulationPayload | PayoutSimulationModel, options?: RequestOptions): Promise<any>;
}

/* --------------------------------------------------------------------- Payment cards */

export interface PaymentCardClient {
    name: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    countryId?: number;
    countryIso?: string;
    termsAndConditions: boolean | 'true' | 'false';
    city?: string;
    postCode?: string;
    state?: string;
    dateOfBirth?: string;
}

export interface PaymentCardPayload {
    concept: string;
    description: string;
    /** Integer in cents, >= 100 */
    amount: number;
    currency: Currency;
    singleUse: boolean;
    favorite: boolean;
    reasonId?: number;
    reasonDes?: string;
    accountId?: number;
    reference?: string;
    serviceDate?: string;
    expirationDate?: string;
    expirationDays?: number;
    lang?: string;
    saveToken?: boolean;
    directPayment?: boolean;
    urlSuccess?: string;
    urlFailed?: string;
    urlNotification?: string;
    paymentMethods?: PaymentMethod[];
    strictPostalCodeCheck?: boolean;
    strictAddressCheck?: boolean;
    paymentcardType?: number;
    payment3DS?: 'default' | 'force' | 'bypass';
    imageBase?: string;
    client?: PaymentCardClient | ClientModel | null;
}

export interface PaymentCard extends Omit<PaymentCardPayload, 'client'> {
    id: string;
    state: number;
    shortUrl: string;
    qrImage?: string;
    client?: PaymentCardClient;
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

export declare class PaymentCards {
    create(payload: PaymentCardPayload | PaymentCardModel, options?: RequestOptions): Promise<PaymentCard>;
    list(params?: PaginationParams & { state?: 0 | 1 }, options?: RequestOptions): Promise<PaymentCard[]>;
    get(id: string, options?: RequestOptions): Promise<PaymentCard>;
    iterate(params?: IterateParams & { state?: 0 | 1 }, options?: RequestOptions): AsyncGenerator<PaymentCard>;
    /** Legacy v2 endpoint (not documented for v3) */
    createMediation(payload: Record<string, unknown>, options?: RequestOptions): Promise<any>;
}

/* --------------------------------------------------------------------- Beneficiaries */

export interface BankBeneficiaryPayload {
    accountNumber: string;
    firstName: string;
    lastName: string;
    countryISO: string;
    beneficiaryType?: 2;
    userRelationTypeId: 0 | 1 | 2 | 3 | 4;
    paymentType?: '2';
    currency: string;
    city: string;
    province: string;
    address: string;
    postalCode: string;
    alias?: string;
    email?: string;
    phone?: string;
    swift?: string;
}

export interface CryptoBeneficiaryPayload {
    accountNumber: string;
    firstName: string;
    lastName: string;
    paymentType?: 100;
    beneficiaryType?: 3;
    currency?: string;
    network?: string;
    countryDestinationId?: number;
    alias?: string;
}

export interface Beneficiary {
    id: number;
    accountNumber: string;
    firstName: string;
    lastName: string;
    alias?: string;
    state: number | string;
    countryDestination?: { id: number; name: string; sepaZone: boolean; slug: string; callingCode: number };
    createdAt: string;
    [key: string]: unknown;
}

export interface AccountNumberValidation {
    accountNumber: string;
    paymentType: number;
    currency?: string;
    network?: string;
    countryDestinationId?: number;
}

export declare class Beneficiaries {
    create(payload: BankBeneficiaryPayload | CryptoBeneficiaryPayload | BeneficiaryModel | CryptoBeneficiaryModel | Record<string, unknown>, options?: RequestOptions): Promise<Beneficiary>;
    createBank(payload: Omit<BankBeneficiaryPayload, 'beneficiaryType' | 'paymentType'>, options?: RequestOptions): Promise<Beneficiary>;
    createCrypto(payload: Omit<CryptoBeneficiaryPayload, 'beneficiaryType' | 'paymentType'>, options?: RequestOptions): Promise<Beneficiary>;
    list(params?: PaginationParams & { search?: string }, options?: RequestOptions): Promise<ListPage<Beneficiary>>;
    iterate(params?: IterateParams & { search?: string }, options?: RequestOptions): AsyncGenerator<Beneficiary>;
    get(beneficiaryId: number | string, options?: RequestOptions): Promise<Beneficiary>;
    /** The API requires the 2FA securityCode ("123456" in sandbox) */
    update(id: number, changes: { alias?: string; securityCode: string }, options?: RequestOptions): Promise<Beneficiary>;
    delete(beneficiaryId: number | string, payload: { securityCode: string }, options?: RequestOptions): Promise<any>;
    validateAccountNumber(payload: AccountNumberValidation, options?: RequestOptions): Promise<{ valid: boolean; type: unknown; errorCode: string | null }>;
}

/* ----------------------------------------------------------------------------- Hooks */

export interface HookPayload {
    event: HookEventName;
    target: HookTarget;
    value: string;
}

export interface Hook extends HookPayload {
    createdAt: string;
    updatedAt: string;
}

export interface HookActionResponse {
    action: string;
    status: string;
    details: string;
}

export declare class Hooks {
    listEvents(options?: RequestOptions): Promise<{ name: string; description: string }[]>;
    list(options?: RequestOptions): Promise<Hook[]>;
    subscribe(payload: HookPayload | HookModel, options?: RequestOptions): Promise<HookActionResponse>;
    update(payload: HookPayload | HookModel, options?: RequestOptions): Promise<HookActionResponse>;
    listByEvent(eventName: HookEventName, options?: RequestOptions): Promise<Hook[]>;
    get(eventName: HookEventName, targetName: HookTarget, options?: RequestOptions): Promise<Hook[]>;
    unsubscribe(eventName: HookEventName, targetName: HookTarget, options?: RequestOptions): Promise<HookActionResponse>;
}

/* ------------------------------------------------------------- Scheduled transactions */

export declare class ScheduledTransactions {
    /** filters: {currency: 'EUR'} -> q.currency=EUR; {currency: ['EUR','USD']} -> q.currency.in=EUR,USD */
    list(params?: { limit?: number; filters?: Record<string, string | number | (string | number)[]> }, options?: RequestOptions): Promise<ListPage<Record<string, unknown>>>;
}

/* -------------------------------------------------------------------------- Tropipay */

export declare class Tropipay {
    static _instance?: Tropipay;
    static getInstance(options?: TropipayOptions | TropipayConfig): Tropipay;
    static configure(options?: TropipayOptions | TropipayConfig): Tropipay;
    static create(options?: TropipayOptions | TropipayConfig): Tropipay;

    constructor(options?: TropipayOptions | TropipayConfig);

    readonly users: Users;
    readonly accounts: Accounts;
    readonly movements: Movements;
    readonly transfers: Transfers;
    readonly paymentCards: PaymentCards;
    readonly beneficiaries: Beneficiaries;
    /** Alias of beneficiaries */
    readonly depositAccounts: Beneficiaries;
    readonly hooks: Hooks;
    readonly scheduledTransactions: ScheduledTransactions;

    authorize(params?: { force?: boolean }): Promise<this>;
    /** 1.x name of authorize() */
    Authorize(): Promise<this>;
    request<T = any>(request: RawRequest): Promise<T>;
    isAuthorized(): boolean;
    getAccessToken(): string | null;
    setAccessToken(accessToken: string, options?: { expiresIn?: number; tokenType?: string }): this;
    getConfig(): Omit<TropipayOptions, 'clientSecret' | 'httpAdapter' | 'logger' | 'accessToken'> & { serverUrl: string; environment: string; hasClientSecret: boolean };
    getBaseUrl(): string;
    getData(): Partial<TokenResponse>;
    getHeader(): Record<string, string>;
    getTppServerUrl(): string;
    verifyPaymentNotification(payload: unknown): boolean;
    verifyHookSignature(rawBody: string | Uint8Array, signature: string, secret: string): boolean;

    /** @deprecated use paymentCards.create() */
    CreatePaymentCard(payload: PaymentCardPayload | PaymentCardModel | Record<string, unknown>): Promise<{ success: { data: PaymentCard } } | { error: unknown }>;
    /** @deprecated use paymentCards.createMediation() */
    CreateMediationPaymentCard(payload: Record<string, unknown>): Promise<any | false | { error: string }>;
    /** @deprecated use beneficiaries.list() */
    GetDepositAccountsList(): Promise<ListPage<Beneficiary> | false>;
    /** @deprecated use beneficiaries.create() */
    CreateNewDepositAccount(payload: Record<string, unknown>): Promise<Beneficiary | false | { error: string }>;
    /** @deprecated use hooks.listEvents() */
    GetEventsAllowSubscriptionList(): Promise<{ name: string; description: string }[] | false>;
    /** @deprecated use hooks.list() */
    GetEventsSubscribedHooksList(): Promise<Hook[] | false>;
    /** @deprecated use hooks.subscribe() */
    SubscribeNewEventHook(payload: HookPayload | Record<string, unknown>): Promise<HookActionResponse | false | { error: string }>;
}

export declare class TropipayConfig {
    constructor(options?: TropipayOptions & { refreshToken?: string; token_type?: string; expires_in?: number });
    toObject(): TropipayOptions;
}

/* --------------------------------------------------------------------- TropipayAuth */

export interface TropipayAuthOptions {
    clientId?: string;
    clientSecret?: string;
    scopes?: string;
    challengeMethod?: string;
    serverUrl?: string;
    appUrl?: string;
    callbackPath?: string;
    httpAdapter?: unknown;
}

/** "Login with Tropipay" (OAuth authorization code + PKCE, legacy endpoints). */
export declare class TropipayAuth {
    constructor(options?: TropipayAuthOptions);
    base64URLEncode(value: Uint8Array | string): string;
    sha256(value: Uint8Array | string): Uint8Array;
    Login(params?: Record<string, string>): { url: string; code_verifier: string; state: string };
    GetAuthorizationToken(authorizationCode: string, codeVerifier: string, redirectUri?: string): Promise<TokenResponse | false>;
    GetProfile(accessToken: string, tokenType?: string): Promise<User | false>;
}

/* --------------------------------------------------------------------------- Errors */

export interface RateLimitInfo {
    limit?: number;
    remaining?: number;
    reset?: number;
    retryAfter?: number;
}

export declare class TropipayError extends Error {
    status?: number;
    code?: string;
    type?: string;
    details?: unknown;
    param?: string;
    i18n?: string;
    raw?: unknown;
    rateLimit?: RateLimitInfo;
    method?: string;
    path?: string;
}

export declare class TropipayValidationError extends TropipayError {
    errors: string[];
}

export declare class TropipayConfigError extends TropipayError {
    missing: string[];
}

/* --------------------------------------------------------------------------- Models */

declare class BaseModel {
    toObject(): Record<string, unknown>;
    toJSON(): Record<string, unknown>;
    getDefinedValues(obj: Record<string, unknown>): Record<string, unknown>;
}

export declare class ClientModel extends BaseModel {
    constructor(data: Partial<PaymentCardClient>);
    constructor(name?: string, lastName?: string, address?: string, phone?: string, email?: string, termsAndConditions?: boolean | string, countryId?: number, countryIso?: string);
}

export declare class PaymentCardModel extends BaseModel {
    constructor(data: Partial<PaymentCardPayload>);
    constructor(reference?: string, concept?: string, description?: string, favorite?: boolean | string, amount?: number, currency?: string,
                singleUse?: boolean | string, reasonId?: number, expirationDays?: number, lang?: string, urlSuccess?: string, urlFailed?: string,
                urlNotification?: string, serviceDate?: string, directPayment?: boolean | string, paymentMethods?: PaymentMethod[],
                saveToken?: boolean, client?: ClientModel | PaymentCardClient);
    /** @deprecated 1.x typo of client */
    cient?: ClientModel | PaymentCardClient;
}

export declare class BeneficiaryModel extends BaseModel {
    constructor(data: Partial<BankBeneficiaryPayload>);
}

export declare class CryptoBeneficiaryModel extends BaseModel {
    constructor(data: Partial<CryptoBeneficiaryPayload>);
}

export declare class PayoutModel extends BaseModel {
    constructor(data: Partial<PayoutPayload>);
}

export declare class PayoutSimulationModel extends BaseModel {
    constructor(data: Partial<PayoutSimulationPayload>);
}

export declare class HookModel extends BaseModel {
    constructor(data: Partial<HookPayload>);
    constructor(event?: HookEventName, target?: HookTarget, value?: string);
}

export declare class ExternalDepositAccountModel extends BaseModel {
    constructor(data: Record<string, unknown>);
    constructor(...args: unknown[]);
}

export declare class InternalDepositAccountModel extends BaseModel {
    constructor(data: Record<string, unknown>);
    constructor(beneficiaryType?: number, searchBy?: number, searchValue?: string, alias?: string, userRelationTypeId?: number);
}

export declare const TropipayModels: {
    ClientModel: typeof ClientModel;
    PaymentCardModel: typeof PaymentCardModel;
    BeneficiaryModel: typeof BeneficiaryModel;
    CryptoBeneficiaryModel: typeof CryptoBeneficiaryModel;
    PayoutModel: typeof PayoutModel;
    PayoutSimulationModel: typeof PayoutSimulationModel;
    HookModel: typeof HookModel;
    ExternalDepositAccountModel: typeof ExternalDepositAccountModel;
    InternalDepositAccountModel: typeof InternalDepositAccountModel;
    /** @deprecated 1.x name */
    CientModel: typeof ClientModel;
    /** @deprecated 1.x name */
    CientPayload: typeof ClientModel;
};

/* ------------------------------------------------------------------------- Webhooks */

export declare const webhooks: {
    computeHookSignature(rawBody: string | Uint8Array, secret: string): string;
    verifyHookSignature(params: { rawBody: string | Uint8Array; signature: string | undefined | null; secret: string }): boolean;
    computePaymentSignatureV3(data: { bankOrderCode: string; originalCurrencyAmount: string | number }, credentials: { clientId: string; clientSecret: string }): string;
    verifyPaymentNotification(payload: unknown, credentials: { clientId?: string; clientSecret?: string }): boolean;
    isPaymentSuccessful(payload: unknown): boolean;
};

/* ------------------------------------------------------------------------ Constants */

export declare const ENVIRONMENTS: { sandbox: string; production: string };
export declare const CURRENCIES: { USD: 'USD'; EUR: 'EUR'; USDC: 'USDC' };
export declare const PAYMENT_METHODS: {
    EXTERNAL_CARD: 'EXT'; TROPIPAY: 'TPP'; TROPIPAY_GIFTCARD: 'TPP_GIFTCARD'; CRYPTO: 'CRYPTO'; APPLE_PAY: 'APPLE_PAY'; GOOGLE_PAY: 'GOOGLE_PAY';
};
export declare const PAYMENT_3DS: { DEFAULT: 'default'; FORCE: 'force'; BYPASS: 'bypass' };
export declare const PAYMENT_CARD_STATES: { ACTIVE: 1; USED_OR_EXPIRED: 0 };
export declare const BENEFICIARY_TYPES: { EXTERNAL: 2; CRYPTO: 3 };
export declare const BENEFICIARY_PAYMENT_TYPES: { BANK_DEPOSIT: '2'; CRYPTO: '100' };
export declare const USER_RELATION_TYPES: { MYSELF: 0; SPOUSE: 1; FAMILY: 2; FRIEND: 3; BUSINESS_PARTNER: 4 };
export declare const CRYPTO_NETWORKS: Record<string, string>;
export declare const HOOK_EVENTS: {
    USER_SIGNUP: 'user_signup'; USER_LOGIN: 'user_login'; USER_KYC: 'user_kyc';
    PAYMENT_IN_STATE_CHANGE: 'payment_in_state_change'; PAYMENT_OUT_STATE_CHANGE: 'payment_out_state_change';
    BENEFICIARY_ADDED: 'beneficiary_added'; BENEFICIARY_UPDATED: 'beneficiary_updated'; BENEFICIARY_DELETED: 'beneficiary_deleted';
};
export declare const HOOK_TARGETS: { WEB: 'web'; EMAIL: 'email' };
export declare const MOVEMENT_STATES: { PENDING: 'pending'; COMPLETED: 'completed'; FAILED: 'failed'; CANCELLED: 'cancelled' };
export declare const SECURITY_CODE_TYPES: { SMS: 'sms'; EMAIL: 'email'; TOTP: 'totp' };
export declare const TWO_FACTOR_TYPES: { TOTP: 'totp'; SMS: 'sms' };
export declare const REASONS: Readonly<Record<number, string>>;
export declare const REASON_OTHERS: 9;
export declare const ERROR_CODES: Readonly<Record<string, string>>;
export declare const SANDBOX: {
    SECURITY_CODE: '123456';
    TEST_CARDS: Record<string, string | Record<string, string>>;
};
export declare const constants: {
    ENVIRONMENTS: typeof ENVIRONMENTS;
    CURRENCIES: typeof CURRENCIES;
    PAYMENT_METHODS: typeof PAYMENT_METHODS;
    PAYMENT_3DS: typeof PAYMENT_3DS;
    PAYMENT_CARD_STATES: typeof PAYMENT_CARD_STATES;
    BENEFICIARY_TYPES: typeof BENEFICIARY_TYPES;
    BENEFICIARY_PAYMENT_TYPES: typeof BENEFICIARY_PAYMENT_TYPES;
    USER_RELATION_TYPES: typeof USER_RELATION_TYPES;
    CRYPTO_NETWORKS: typeof CRYPTO_NETWORKS;
    HOOK_EVENTS: typeof HOOK_EVENTS;
    HOOK_TARGETS: typeof HOOK_TARGETS;
    MOVEMENT_STATES: typeof MOVEMENT_STATES;
    SECURITY_CODE_TYPES: typeof SECURITY_CODE_TYPES;
    TWO_FACTOR_TYPES: typeof TWO_FACTOR_TYPES;
    REASONS: typeof REASONS;
    REASON_OTHERS: typeof REASON_OTHERS;
    ERROR_CODES: typeof ERROR_CODES;
    SANDBOX: typeof SANDBOX;
};

export declare const TropipayEndpoints: Record<string, any>;

/** @deprecated 1.x payment wrapper */
export declare class TropipaySession {
    static getInstance(context: Tropipay): TropipaySession;
    constructor(context: Tropipay);
    CreatePaymentCard(payload: unknown): ReturnType<Tropipay['CreatePaymentCard']>;
    CreateMediationPaymentCard(payload: unknown): ReturnType<Tropipay['CreateMediationPaymentCard']>;
}

declare const sdk: {
    Tropipay: typeof Tropipay;
    TropipayConfig: typeof TropipayConfig;
    TropipayAuth: typeof TropipayAuth;
    TropipayModels: typeof TropipayModels;
    TropipayEndpoints: typeof TropipayEndpoints;
    TropipayError: typeof TropipayError;
    TropipayValidationError: typeof TropipayValidationError;
    TropipayConfigError: typeof TropipayConfigError;
    TropipaySession: typeof TropipaySession;
    webhooks: typeof webhooks;
    constants: typeof constants;
} & typeof constants;

export default sdk;
