'use strict';

const Module = require('module');

describe('Security - ODBC getTables stored credentials', () => {
    let expect;
    let odbcClient;
    let connectionStrings;
    let originalLoad;

    const storedSecurity = async () => ({ value: JSON.stringify({ uid: 'stored-user', pwd: 'stored-pwd' }) });
    const storedDevices = () => ({ dev1: { id: 'dev1', property: { address: 'Driver=X;Server=configured' } } });

    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
        originalLoad = Module._load;
        Module._load = function (request, ...args) {
            if (request === 'odbc') {
                return {
                    connect: async (config) => {
                        connectionStrings.push(config.connectionString);
                        return { tables: async () => [{ TABLE_NAME: 't1' }], close() { } };
                    }
                };
            }
            return originalLoad.call(this, request, ...args);
        };
        delete require.cache[require.resolve('../../runtime/devices/odbc')];
        odbcClient = require('../../runtime/devices/odbc');
    });

    after(() => {
        Module._load = originalLoad;
        delete require.cache[require.resolve('../../runtime/devices/odbc')];
    });

    beforeEach(() => {
        connectionStrings = [];
    });

    it('does not append stored credentials to a different connection string', async () => {
        await odbcClient.getTables({ id: 'dev1', address: 'Driver=X;Server=attacker' }, storedSecurity, null, storedDevices);
        expect(connectionStrings).to.deep.equal(['Driver=X;Server=attacker']);
    });

    it('does not append stored credentials for an unknown device id', async () => {
        await odbcClient.getTables({ id: 'unknown', address: 'Driver=X;Server=configured' }, storedSecurity, null, storedDevices);
        expect(connectionStrings).to.deep.equal(['Driver=X;Server=configured']);
    });

    it('appends stored credentials to the configured connection string of the same device', async () => {
        await odbcClient.getTables({ id: 'dev1', address: 'Driver=X;Server=configured' }, storedSecurity, null, storedDevices);
        expect(connectionStrings).to.deep.equal(['Driver=X;Server=configured;UID=stored-user;PWD=stored-pwd']);
    });

    it('uses credentials supplied in the request', async () => {
        await odbcClient.getTables({ id: 'dev1', address: 'Driver=X;Server=other', uid: 'u', pwd: 'p' }, storedSecurity, null, storedDevices);
        expect(connectionStrings).to.deep.equal(['Driver=X;Server=other;UID=u;PWD=p']);
    });
});
