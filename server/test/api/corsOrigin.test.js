'use strict';

const { matchOrigin, applyCorsHeaders } = require('../../api/cors-helper');

let expect;

const defaultOrigins = ['http://localhost', 'http://127.0.0.1', 'http://192.168.*', 'http://10.*', 'http://localhost:4200'];

function makeRes() {
    const headers = {};
    return {
        headers,
        header: (name, value) => { headers[name] = value; },
        vary: () => { headers.Vary = 'Origin'; }
    };
}

describe('Security - CORS origin allowlist', () => {
    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    it('allows exact and private IPv4 origins from the default list', () => {
        ['http://localhost', 'http://127.0.0.1', 'http://localhost:4200', 'http://192.168.1.20',
            'http://192.168.1.20:1881', 'http://10.0.0.5', 'http://10.20.30.40:4200'].forEach(origin => {
            expect(matchOrigin(origin, defaultOrigins), origin).to.equal('listed');
        });
    });

    it('rejects attacker-registrable hostnames matching the IP wildcard prefix', () => {
        ['http://192.168.evil.com', 'http://192.168.1.evil.com', 'http://10.attacker.net', 'http://10.com',
            'http://10.0.0.5.evil.com', 'http://192.168.1.1@evil.com', 'https://10.0.0.5', 'http://192.1680.1.1',
            'http://localhost.evil.com', 'http://evil.com', 'null', ''].forEach(origin => {
            expect(matchOrigin(origin, defaultOrigins), origin).to.equal(null);
        });
    });

    it('limits hostname wildcards to a single label', () => {
        const origins = ['https://*.example.com', 'http://plc.local:*'];
        expect(matchOrigin('https://app.example.com', origins)).to.equal('listed');
        expect(matchOrigin('https://a.b.example.com', origins)).to.equal(null);
        expect(matchOrigin('https://example.com', origins)).to.equal(null);
        expect(matchOrigin('https://app.example.com.evil.com', origins)).to.equal(null);
        expect(matchOrigin('https://evilexample.com', origins)).to.equal(null);
        expect(matchOrigin('http://plc.local:8080', origins)).to.equal('listed');
    });

    it('does not reflect origins or allow credentials for missing settings or global wildcard', () => {
        let res = makeRes();
        applyCorsHeaders({ headers: { origin: 'http://evil.com' } }, res, { enableRefreshCookieAuth: true });
        expect(res.headers).to.not.have.property('Access-Control-Allow-Origin');

        res = makeRes();
        applyCorsHeaders({ headers: { origin: 'http://evil.com' } }, res, { allowedOrigins: ['*'], nodeRedEnabled: true });
        expect(res.headers['Access-Control-Allow-Origin']).to.equal('*');
        expect(res.headers).to.not.have.property('Access-Control-Allow-Credentials');
    });

    it('reflects listed origins with credentials when cookie auth is enabled', () => {
        const res = makeRes();
        applyCorsHeaders({ headers: { origin: 'http://192.168.1.20:1881' } }, res, { allowedOrigins: defaultOrigins, enableRefreshCookieAuth: true });
        expect(res.headers['Access-Control-Allow-Origin']).to.equal('http://192.168.1.20:1881');
        expect(res.headers['Access-Control-Allow-Credentials']).to.equal('true');
        expect(res.headers.Vary).to.equal('Origin');

        const denied = makeRes();
        applyCorsHeaders({ headers: { origin: 'http://192.168.evil.com' } }, denied, { allowedOrigins: defaultOrigins, enableRefreshCookieAuth: true });
        expect(denied.headers).to.not.have.property('Access-Control-Allow-Origin');
        expect(denied.headers).to.not.have.property('Access-Control-Allow-Credentials');
    });
});
