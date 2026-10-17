'use strict';

const net = require('net');

const DEFAULT_PORTS = { 'http:': '80', 'https:': '443' };
const PATTERN_REGEX = /^([a-z][a-z0-9+.-]*):\/\/([^/:?#@]+)(?::(\d+|\*))?\/?$/i;
const DNS_LABEL_REGEX = /^[a-z0-9-]+$/;
const IPV4_LABEL_REGEX = /^(\d{1,3}|\*)$/;

function parseOrigin(origin) {
    if (typeof origin !== 'string' || !origin) {
        return null;
    }
    let url;
    try {
        url = new URL(origin);
    } catch (err) {
        return null;
    }
    if (!DEFAULT_PORTS[url.protocol] || url.origin === 'null' || url.origin !== origin.toLowerCase().replace(/\/$/, '')) {
        return null;
    }
    return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || DEFAULT_PORTS[url.protocol]
    };
}

/**
 * Compile an allowedOrigins entry that contains '*'.
 * '*' is only accepted as a whole host label (or as the port):
 * - IPv4 patterns (numeric labels, e.g. 'http://192.168.*') only match IPv4 hosts,
 *   a trailing '*' covers the remaining octets.
 * - Hostname patterns (e.g. 'https://*.example.com') match exactly one DNS label per '*'.
 * Without an explicit port any port is accepted, ':*' is the same.
 */
function compileWildcardPattern(pattern) {
    const match = PATTERN_REGEX.exec(pattern.trim());
    if (!match) {
        return null;
    }
    const protocol = match[1].toLowerCase() + ':';
    const host = match[2].toLowerCase();
    const port = match[3] && match[3] !== '*' ? match[3] : null;
    const labels = host.split('.');
    if (!DEFAULT_PORTS[protocol] || labels.some(label => !label)) {
        return null;
    }
    const isIPv4Pattern = labels.every(label => IPV4_LABEL_REGEX.test(label)) && labels.length <= 4;
    if (isIPv4Pattern) {
        const parts = labels.map((label, index) => {
            if (label !== '*') {
                return String(Number(label));
            }
            return (index === labels.length - 1) ? '\\d{1,3}(?:\\.\\d{1,3}){0,' + (4 - labels.length) + '}' : '\\d{1,3}';
        });
        const hostRegex = new RegExp('^' + parts.join('\\.') + '$');
        return { protocol, port, matchHost: (hostname) => net.isIPv4(hostname) && hostRegex.test(hostname) };
    }
    if (labels.some(label => label !== '*' && !DNS_LABEL_REGEX.test(label)) || labels.every(label => label === '*')) {
        return null;
    }
    const hostRegex = new RegExp('^' + labels.map(label => label === '*' ? '[a-z0-9-]+' : label).join('\\.') + '$');
    return { protocol, port, matchHost: (hostname) => !net.isIP(hostname) && hostRegex.test(hostname) };
}

/**
 * Return how the origin is allowed: 'any' (global '*'), 'listed' (exact or bounded wildcard entry) or null.
 */
function matchOrigin(origin, allowedOrigins) {
    if (!origin || !Array.isArray(allowedOrigins)) {
        return null;
    }
    if (allowedOrigins.includes(origin)) {
        return 'listed';
    }
    const parsed = parseOrigin(origin);
    if (parsed) {
        const listed = allowedOrigins.some(pattern => {
            if (typeof pattern !== 'string' || pattern === '*' || !pattern.includes('*')) {
                return false;
            }
            const compiled = compileWildcardPattern(pattern);
            return !!compiled
                && compiled.protocol === parsed.protocol
                && (!compiled.port || compiled.port === parsed.port)
                && compiled.matchHost(parsed.hostname);
        });
        if (listed) {
            return 'listed';
        }
    }
    return allowedOrigins.includes('*') ? 'any' : null;
}

/**
 * Set the CORS headers for the request origin. Credentials are only allowed for listed origins,
 * never for a global '*' match.
 */
function applyCorsHeaders(req, res, settings) {
    const origin = req.headers.origin;
    const allowedOrigins = Array.isArray(settings.allowedOrigins) ? settings.allowedOrigins : [];
    const result = matchOrigin(origin, allowedOrigins);
    if (typeof res.vary === 'function') {
        res.vary('Origin');
    }
    if (result === 'listed') {
        res.header('Access-Control-Allow-Origin', origin);
        if (settings.enableRefreshCookieAuth || settings.nodeRedEnabled) {
            res.header('Access-Control-Allow-Credentials', 'true');
        }
    } else if (result === 'any') {
        res.header('Access-Control-Allow-Origin', '*');
    }
}

module.exports = {
    matchOrigin,
    applyCorsHeaders
};
