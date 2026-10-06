//TropipayWebhooks — signature helpers for hooks and payment card notifications
const crypto = require('crypto');

function safeEqual(expected, received) {
    if (typeof expected !== 'string' || typeof received !== 'string') return false;
    const a = Buffer.from(expected.trim().toLowerCase(), 'utf8');
    const b = Buffer.from(received.trim().toLowerCase(), 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

function toRawBody(rawBody) {
    if (Buffer.isBuffer(rawBody) || typeof rawBody === 'string') return rawBody;
    if (rawBody instanceof Uint8Array) return Buffer.from(rawBody);
    throw new TypeError(
        'Tropipay webhooks: rawBody must be the raw request body (string or Buffer), not the parsed JSON object',
    );
}

/**
 * HMAC-SHA256 (hex) of the raw body with the webhook secret, as sent in the X-Tropipay-Signature header.
 */
function computeHookSignature(rawBody, secret) {
    if (!secret) throw new TypeError('Tropipay webhooks: secret is required');
    return crypto.createHmac('sha256', secret).update(toRawBody(rawBody)).digest('hex');
}

/**
 * Verifies the X-Tropipay-Signature header of a webhook request.
 * @param {{rawBody: string|Buffer, signature: string, secret: string}} params
 * @returns {boolean}
 */
function verifyHookSignature({rawBody, signature, secret}) {
    if (!signature) return false;
    return safeEqual(computeHookSignature(rawBody, secret), String(signature));
}

/**
 * signatureV3 = sha256( bankOrderCode + clientId + sha1(clientSecret) + originalCurrencyAmount )
 */
function computePaymentSignatureV3({bankOrderCode, originalCurrencyAmount}, {clientId, clientSecret}) {
    if (!clientId || !clientSecret) {
        throw new TypeError('Tropipay webhooks: clientId and clientSecret are required to compute signatureV3');
    }
    const secretHash = crypto.createHash('sha1').update(String(clientSecret)).digest('hex');
    return crypto
        .createHash('sha256')
        .update(`${bankOrderCode}${clientId}${secretHash}${originalCurrencyAmount}`)
        .digest('hex');
}

/**
 * Verifies the payload Tropipay posts to a payment card `urlNotification`.
 * Accepts the whole body ({ status, data }) or just `data`.
 * @returns {boolean}
 */
function verifyPaymentNotification(payload, credentials) {
    if (!payload || typeof payload !== 'object') return false;
    const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
    const received = data.signaturev3 || data.signatureV3;
    if (!received || data.bankOrderCode === undefined || data.originalCurrencyAmount === undefined) return false;
    return safeEqual(computePaymentSignatureV3(data, credentials), String(received));
}

/**
 * true when a urlNotification payload reports a paid order ("status": "OK").
 */
function isPaymentSuccessful(payload) {
    return Boolean(payload && payload.status === 'OK');
}

module.exports = {
    computeHookSignature,
    verifyHookSignature,
    computePaymentSignatureV3,
    verifyPaymentNotification,
    isPaymentSuccessful,
};
