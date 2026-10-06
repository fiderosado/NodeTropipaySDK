const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const {webhooks} = require('../src');
const {createClient} = require('./helpers');

const secret = 'whsec_test';
const rawBody = JSON.stringify({event: 'payment.completed', data: {id: 'pay_1'}});
const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

test('verifyHookSignature accepts the X-Tropipay-Signature HMAC', () => {
    assert.equal(webhooks.computeHookSignature(rawBody, secret), signature);
    assert.equal(webhooks.verifyHookSignature({rawBody, signature, secret}), true);
    assert.equal(webhooks.verifyHookSignature({rawBody: Buffer.from(rawBody), signature: signature.toUpperCase(), secret}), true);
});

test('verifyHookSignature rejects tampered bodies, wrong lengths and missing signatures', () => {
    assert.equal(webhooks.verifyHookSignature({rawBody: rawBody + ' ', signature, secret}), false);
    assert.equal(webhooks.verifyHookSignature({rawBody, signature: 'abc', secret}), false);
    assert.equal(webhooks.verifyHookSignature({rawBody, signature: undefined, secret}), false);
    assert.throws(() => webhooks.verifyHookSignature({rawBody: {parsed: true}, signature, secret}), /raw request body/);
});

const credentials = {clientId: 'client-id', clientSecret: 'client-secret'};
const sha1 = crypto.createHash('sha1').update(credentials.clientSecret).digest('hex');
const signatureV3 = crypto.createHash('sha256').update(`690259220262client-id${sha1}200`).digest('hex');
const notification = {
    status: 'OK',
    data: {bankOrderCode: '690259220262', originalCurrencyAmount: '200', reference: 'ref', signaturev3: signatureV3},
};

test('verifyPaymentNotification checks signatureV3 of urlNotification payloads', () => {
    assert.equal(webhooks.computePaymentSignatureV3(notification.data, credentials), signatureV3);
    assert.equal(webhooks.verifyPaymentNotification(notification, credentials), true);
    assert.equal(webhooks.verifyPaymentNotification(notification.data, credentials), true);
    assert.equal(webhooks.verifyPaymentNotification({data: {...notification.data, signatureV3: signatureV3, signaturev3: undefined}}, credentials), true);
    assert.equal(webhooks.verifyPaymentNotification({data: {...notification.data, originalCurrencyAmount: '20000'}}, credentials), false);
    assert.equal(webhooks.verifyPaymentNotification({data: {bankOrderCode: '1'}}, credentials), false);
    assert.equal(webhooks.verifyPaymentNotification(null, credentials), false);
    assert.equal(webhooks.isPaymentSuccessful(notification), true);
    assert.equal(webhooks.isPaymentSuccessful({status: 'KO'}), false);
});

test('instance helpers use the instance credentials', () => {
    const {tpp} = createClient();
    assert.equal(tpp.verifyPaymentNotification(notification), true);
    assert.equal(tpp.verifyHookSignature(rawBody, signature, secret), true);
});
