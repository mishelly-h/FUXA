'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const Module = require('module');
const express = require('express');

const pluginsApi = require('../../api/plugins');

function request(app, method, requestPath, body) {
    return new Promise((resolve, reject) => {
        const server = app.listen(0, () => {
            const data = body ? JSON.stringify(body) : '';
            const options = {
                method,
                port: server.address().port,
                path: requestPath,
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

function makeApi(settings, permission = -1) {
    const calls = { add: [], remove: [], errors: [], info: [] };
    const runtime = {
        project: {},
        settings,
        logger: {
            error(message) {
                calls.errors.push(message);
            },
            info(message) {
                calls.info.push(message);
            }
        },
        plugins: {
            addPlugin(plugin) {
                calls.add.push(plugin);
                return Promise.resolve({ name: plugin.name });
            },
            removePlugin(plugin) {
                calls.remove.push(plugin);
                return Promise.resolve();
            }
        },
        devices: {
            update() {}
        }
    };
    const app = express();
    app.use(express.json());
    pluginsApi.init(runtime, (req, res, next) => next(), () => permission);
    app.use(pluginsApi.app());
    return { app, calls };
}

async function getError(promise) {
    try {
        await promise;
    } catch (err) {
        return err;
    }
    throw new Error('Expected operation to reject');
}

describe('Security - plugin install authorization and validation', () => {
    let expect;

    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    it('rejects plugin installation when security is disabled by default', async () => {
        const { app, calls } = makeApi({ secureEnabled: false });
        const res = await request(app, 'POST', '/api/plugins', {
            params: { name: 'evil-pkg' }
        });

        expect(res.statusCode).to.equal(401);
        expect(res.body.error).to.equal('unauthorized_error');
        expect(calls.add).to.have.length(0);
        expect(calls.errors).to.include('api post plugins: Unauthorized (security disabled)');
    });

    it('rejects plugin removal when security is disabled by default', async () => {
        const { app, calls } = makeApi({ secureEnabled: false });
        const res = await request(app, 'DELETE', '/api/plugins?param=node-opcua');

        expect(res.statusCode).to.equal(401);
        expect(res.body.error).to.equal('unauthorized_error');
        expect(calls.remove).to.have.length(0);
        expect(calls.errors).to.include('api delete plugins: Unauthorized (security disabled)');
    });

    it('allows an explicitly enabled unsecured install and audits the operation', async () => {
        const { app, calls } = makeApi({
            secureEnabled: false,
            allowUnsecuredPluginInstall: true
        });
        const res = await request(app, 'POST', '/api/plugins', {
            params: { name: 'node-opcua' }
        });

        expect(res.statusCode).to.equal(200);
        expect(calls.add).to.have.length(1);
        expect(calls.info).to.include('api post plugins: installed node-opcua');
    });

    it('keeps secure-mode administrator checks in place', async () => {
        const guest = makeApi({ secureEnabled: true }, ['guest']);
        const denied = await request(guest.app, 'POST', '/api/plugins', {
            params: { name: 'node-opcua' }
        });
        expect(denied.statusCode).to.equal(401);
        expect(guest.calls.add).to.have.length(0);

        const admin = makeApi({ secureEnabled: true }, -1);
        const allowed = await request(admin.app, 'POST', '/api/plugins', {
            params: { name: 'node-opcua' }
        });
        expect(allowed.statusCode).to.equal(200);
        expect(admin.calls.add).to.have.length(1);
    });

    describe('runtime plugin manager', () => {
        let pluginManager;
        let managerCalls;
        let deviceCalls;
        let originalLoad;
        let managerPath;
        let packageDir;

        beforeEach(async () => {
            managerPath = require.resolve('../../runtime/plugins');
            delete require.cache[managerPath];
            originalLoad = Module._load;
            packageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fuxa-plugin-security-'));
            managerCalls = { install: [], remove: [] };
            deviceCalls = [];

            const fakeDevice = {
                loadPlugin(type, moduleName) {
                    deviceCalls.push([type, moduleName]);
                }
            };
            const fakeManager = {
                installPackage(name, version) {
                    managerCalls.install.push([name, version]);
                    return Promise.resolve(version || 'latest');
                },
                getInstalledPackages() {
                    return {};
                },
                getPaths() {
                    return { runtimeDir: packageDir };
                },
                isRuntimeManaged() {
                    return false;
                },
                uninstallPackage(name) {
                    managerCalls.remove.push(name);
                    return Promise.resolve();
                }
            };

            Module._load = function (request, parent, isMain) {
                if (parent && parent.filename === managerPath) {
                    if (request === '../devices/device') {
                        return fakeDevice;
                    }
                    if (request === './npm-runtime-service') {
                        return {
                            createRuntimeService() {
                                return fakeManager;
                            },
                            listInstalledPackages() {
                                return {};
                            }
                        };
                    }
                }
                return originalLoad.apply(this, arguments);
            };

            pluginManager = require('../../runtime/plugins');
            await pluginManager.init(
                { packageDir },
                { info() {}, error() {} }
            );
        });

        afterEach(() => {
            Module._load = originalLoad;
            delete require.cache[managerPath];
            fs.rmSync(packageDir, { recursive: true, force: true });
        });

        it('does not install a package outside the built-in plugin registry', async () => {
            const err = await getError(pluginManager.addPlugin({ name: 'evil-pkg' }));

            expect(err.code).to.equal('plugin_not_allowed');
            expect(err.message).to.equal("Plugin 'evil-pkg' is not allowed");
            expect(managerCalls.install).to.have.length(0);
        });

        it('rejects prototype property names as plugins', async () => {
            const attempts = [
                pluginManager.addPlugin('constructor'),
                pluginManager.addPlugin({ name: 'toString', version: '1.0.0' }),
                pluginManager.addPlugin({ name: '__proto__', version: '1.0.0' })
            ];
            for (const attempt of attempts) {
                const err = await getError(attempt);
                expect(err.code).to.equal('plugin_not_allowed');
            }

            const removeError = await getError(pluginManager.removePlugin('constructor'));
            expect(removeError.code).to.equal('plugin_not_allowed');
            expect(managerCalls.install).to.have.length(0);
        });

        it('rejects non-semver package specifications without installing', async () => {
            for (const version of [
                'git+https://evil/x.git',
                'npm:evil@1.0.0',
                'file:/tmp/x',
                'https://evil/x.tgz'
            ]) {
                const err = await getError(pluginManager.addPlugin({
                    name: 'node-opcua',
                    version
                }));
                expect(err.code).to.equal('invalid_plugin_version');
            }
            expect(managerCalls.install).to.have.length(0);
        });

        it('uses only registry module and type values and defaults to the registry version', async () => {
            await pluginManager.addPlugin({
                name: 'modbus-serial',
                module: '/tmp/evil.js',
                type: 'Modbus',
                version: '8.0.19'
            });
            await pluginManager.addPlugin({ name: 'modbus-serial' });

            expect(managerCalls.install).to.deep.equal([
                ['modbus-serial', '8.0.19'],
                ['modbus-serial', '8.0.19']
            ]);
            expect(deviceCalls).to.deep.equal([
                ['Modbus', './modbus'],
                ['Modbus', './modbus']
            ]);
        });
    });
});
