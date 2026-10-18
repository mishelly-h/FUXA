Server settings are located in 'server\\_appdata\settings.js' file. You have to restart the server after your change.

### Authentication
To enable and config the authentication:

```
secureEnabled: true,            // enable or diasable
allowUnsecuredScriptTest: false, // unsafe opt-in for script test mode when security is disabled
secureOnlyEditor: false,        // if true, sign-in is required only for the Editor and admin pages, values can be changed by anyone
secretCode: '<strong-random-secret>', // secret code to encode the token
tokenExpiresIn: '1h'            // token expiration delay '1h'=1hour, 60=60seconds, '1d'=1day
```

With security disabled, script test mode (which runs arbitrary code on the server) is disabled by default. Enable `secureEnabled` and sign in as an admin (recommended), or set `allowUnsecuredScriptTest: true` to allow any client that can reach FUXA, including through a reverse proxy, to run code (unsafe).

The default user ‘admin’ have the ‘123456’ as password, of course you can change it.
