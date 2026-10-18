Server settings are located in 'server\\_appdata\settings.js' file. You have to restart the server after your change.

### Authentication
To enable and config the authentication:

```
secureEnabled: true,            // enable or diasable
allowUnsecuredScriptTest: false, // when security is disabled, script test mode is localhost-only; true allows remote clients (unsafe)
secureOnlyEditor: false,        // if true, sign-in is required only for the Editor and admin pages, values can be changed by anyone
secretCode: '<strong-random-secret>', // secret code to encode the token
tokenExpiresIn: '1h'            // token expiration delay '1h'=1hour, 60=60seconds, '1d'=1day
```

When security is disabled, testing scripts from remote clients is blocked by default. Set `allowUnsecuredScriptTest: true` to allow it (unsafe; enabling `secureEnabled` is preferred).

The default user ‘admin’ have the ‘123456’ as password, of course you can change it.
