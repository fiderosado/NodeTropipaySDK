//TropipayUtils
const {TropipayValidationError} = require('./errors');

const isPlainObject = (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
};

/**
 * Turns models (anything with toObject) into plain objects and drops undefined values recursively.
 */
function serialize(value) {
    if (value === undefined || value === null) return value;
    if (typeof value.toObject === 'function') return serialize(value.toObject());
    if (Array.isArray(value)) return value.map(serialize);
    if (isPlainObject(value)) {
        const output = {};
        for (const [key, item] of Object.entries(value)) {
            if (item !== undefined) output[key] = serialize(item);
        }
        return output;
    }
    return value;
}

/**
 * Encodes a required path segment (ids, event names...).
 */
function pathSegment(value, name) {
    if (value === undefined || value === null || value === '') {
        throw new TropipayValidationError(`${name} is required`, [`${name} is required`]);
    }
    return encodeURIComponent(String(value));
}

/**
 * Removes undefined/null entries so they are not sent as query params.
 */
function cleanQuery(query) {
    if (!query) return undefined;
    const output = {};
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') output[key] = value;
    }
    return Object.keys(output).length ? output : undefined;
}

/**
 * Coerces "true"/"false" strings (the docs show both) into real booleans.
 */
function toBoolean(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Decodes the payload of a JWT without verifying it (used only to read `exp`).
 */
function decodeJwtPayload(token) {
    if (typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
        const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        const payload = JSON.parse(json);
        return payload && typeof payload === 'object' ? payload : null;
    } catch (error) {
        return null;
    }
}

module.exports = {
    isPlainObject,
    serialize,
    pathSegment,
    cleanQuery,
    toBoolean,
    sleep,
    decodeJwtPayload,
};
