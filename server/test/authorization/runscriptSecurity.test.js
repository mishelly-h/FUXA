'use strict';

const http = require('http');
const express = require('express');

const scriptsApi = require('../../api/scripts');
const MyScriptModule = require('../../runtime/scripts/msm');

function makeLogger() {
    return {
        warn: () => {},
        error: () => {}
    };
}

function request(app, method, path, body) {
    return new Promise((resolve, reject) => {
        const server = app.listen(0, () => {
            const data = body ? JSON.stringify(body) : '';
            const options = {
                method,
                port: server.address().port,
                path,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = http.request(options, (res) => {
                let responseBody = '';
                res.setEncoding('utf8');
                res.on('data', chunk => { responseBody += chunk; });
                res.on('end', () => {
                    server.close(() => resolve({
                        statusCode: res.statusCode,
                        body: responseBody ? JSON.parse(responseBody) : null
                    }));
                });
            });

            req.on('error', (err) => {
                server.close(() => reject(err));
            });

            if (data) {
                req.write(data);
            }
            req.end();
        });
    });
}

describe('Security - runscript authorization target binding', () => {
    let expect;

    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    function makeScriptModule() {
        return MyScriptModule.create(
            { emit: () => {} },
            {
                warn: () => {},
                error: () => {}
            }
        );
    }

    function makeRunScriptApp({ secureEnabled = false, allowUnsecuredScriptTest, authenticated = false, remoteAddress } = {}) {
        const calls = { authorised: 0, run: 0 };
        const errors = [];
        const app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            req.isAuthenticated = authenticated;
            if (remoteAddress) {
                Object.defineProperty(req.socket, 'remoteAddress', {
                    value: remoteAddress,
                    configurable: true
                });
            }
            next();
        });

        scriptsApi.init(
            {
                project: {},
                settings: { secureEnabled, allowUnsecuredScriptTest },
                logger: {
                    ...makeLogger(),
                    error: message => errors.push(message)
                },
                scriptsMgr: {
                    isAuthorised: () => {
                        calls.authorised += 1;
                        return true;
                    },
                    runScript: () => {
                        calls.run += 1;
                        return Promise.resolve('executed');
                    }
                }
            },
            (req, res, next) => next(),
            () => -1
        );

        app.use(scriptsApi.app());
        return { app, calls, errors };
    }

    function testScriptRequest({ test = true, id } = {}) {
        return {
            params: {
                script: {
                    test,
                    id,
                    name: 'test_script',
                    parameters: [],
                    code: 'return true;'
                }
            }
        };
    }

    it('executes the script identified by id even when a different name is supplied', async () => {
        const scriptModule = makeScriptModule();
        scriptModule.init({});
        scriptModule.loadScripts([
            {
                id: 'public-script-id',
                name: 'public_script',
                sync: false,
                parameters: [],
                code: 'return "public";'
            },
            {
                id: 'admin-script-id',
                name: 'admin_script',
                sync: false,
                parameters: [],
                code: 'return "admin";'
            }
        ]);

        const result = await scriptModule.runScript({
            id: 'public-script-id',
            name: 'admin_script',
            parameters: []
        });

        expect(result).to.equal('public');
    });

    it('rejects normal /api/runscript requests without a script id', async () => {
        const calls = { authorised: 0, run: 0 };
        const app = express();
        app.use(express.json());

        scriptsApi.init(
            {
                project: {},
                logger: makeLogger(),
                scriptsMgr: {
                    isAuthorised: () => {
                        calls.authorised += 1;
                        return true;
                    },
                    runScript: () => {
                        calls.run += 1;
                        return Promise.resolve('executed');
                    }
                }
            },
            (req, res, next) => {
                req.isAuthenticated = true;
                next();
            },
            () => -1
        );

        app.use(scriptsApi.app());

        const res = await request(app, 'POST', '/api/runscript', {
            params: {
                script: {
                    name: 'admin_script',
                    parameters: []
                }
            }
        });

        expect(res.statusCode).to.equal(400);
        expect(res.body.error).to.equal('invalid_request');
        expect(calls.authorised).to.equal(0);
        expect(calls.run).to.equal(0);
    });

    it('rejects test scripts from loopback clients when security is disabled', async () => {
        const { app, calls, errors } = makeRunScriptApp();
        const res = await request(app, 'POST', '/api/runscript', testScriptRequest());

        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal({ error: 'unauthorized_error', message: 'Unauthorized!' });
        expect(calls.run).to.equal(0);
        expect(errors).to.include('api post runscript: Unauthorized test mode (security disabled)');
    });

    it('rejects test scripts from non-loopback clients when security is disabled', async () => {
        const { app, calls, errors } = makeRunScriptApp({ remoteAddress: '192.168.1.50' });
        const res = await request(app, 'POST', '/api/runscript', testScriptRequest());

        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal({ error: 'unauthorized_error', message: 'Unauthorized!' });
        expect(calls.run).to.equal(0);
        expect(errors).to.include('api post runscript: Unauthorized test mode (security disabled)');
    });

    it('allows non-loopback test scripts when explicitly opted in', async () => {
        const { app, calls } = makeRunScriptApp({
            allowUnsecuredScriptTest: true,
            remoteAddress: '192.168.1.50'
        });
        const res = await request(app, 'POST', '/api/runscript', testScriptRequest());

        expect(res.statusCode).to.equal(200);
        expect(res.body).to.equal('executed');
        expect(calls.run).to.equal(1);
    });

    it('allows non-test script requests from non-loopback clients when security is disabled', async () => {
        const { app, calls } = makeRunScriptApp({ remoteAddress: '192.168.1.50' });
        const res = await request(app, 'POST', '/api/runscript', testScriptRequest({
            test: false,
            id: 'saved-script-id'
        }));

        expect(res.statusCode).to.equal(200);
        expect(res.body).to.equal('executed');
        expect(calls.run).to.equal(1);
    });

    it('still requires authentication and admin permission for test scripts when security is enabled', async () => {
        const { app, calls } = makeRunScriptApp({ secureEnabled: true });
        const res = await request(app, 'POST', '/api/runscript', testScriptRequest());

        expect(res.statusCode).to.equal(401);
        expect(res.body).to.deep.equal({ error: 'unauthorized_error', message: 'Unauthorized!' });
        expect(calls.run).to.equal(0);
    });
});
