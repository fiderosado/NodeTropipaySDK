// Loads the project .env (sandbox credentials) for the integration tests.
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');

function parseEnv(content) {
    const values = {};
    for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s*(?:export\s+)?([\w.]+)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        let value = match[2];
        if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
        else value = value.replace(/\s+#.*$/, '');
        values[match[1]] = value;
    }
    return values;
}

function loadEnv() {
    if (!fs.existsSync(envPath)) return false;
    const values = parseEnv(fs.readFileSync(envPath, 'utf8'));
    for (const [key, value] of Object.entries(values)) {
        if (process.env[key] === undefined) process.env[key] = value;
    }
    return true;
}

loadEnv();

const env = process.env;

const hasCredentials = Boolean(env.TROPIPAY_CLIENT_ID && env.TROPIPAY_CLIENT_SECRET);
const isSandbox = /sandbox\.tropipay\.me/.test(env.TROPIPAY_SERVER || '') || env.TROPIPAY_ENV === 'sandbox';

/** Reason to skip the suite, or false when it can run. Never runs against production. */
const skipReason = !hasCredentials
    ? 'TROPIPAY_CLIENT_ID / TROPIPAY_CLIENT_SECRET not found in .env'
    : !isSandbox
        ? 'integration tests only run against the sandbox (TROPIPAY_SERVER=https://sandbox.tropipay.me)'
        : false;

module.exports = {env, skipReason, envPath};
