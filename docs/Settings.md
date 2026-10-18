Server settings are located in 'server\\_appdata\settings.js' file. You have to restart the server after your change.

### Authentication
To enable and config the authentication:

```
secureEnabled: true,            // enable or diasable
allowUnsecuredPluginInstall: false, // unsafe opt-in for plugin install/remove when security is disabled
secureOnlyEditor: false,        // if true, sign-in is required only for the Editor and admin pages, values can be changed by anyone
secretCode: '<strong-random-secret>', // secret code to encode the token
tokenExpiresIn: '1h'            // token expiration delay '1h'=1hour, 60=60seconds, '1d'=1day
```

Plugin installation and removal are disabled when security is off. Enable `secureEnabled` and sign in as an administrator (recommended), or set `allowUnsecuredPluginInstall: true` (unsafe; any client reaching FUXA, including via a reverse proxy, can install or remove plugins). Only built-in plugins can be installed, with an exact semver version.

The default user ‘admin’ have the ‘123456’ as password, of course you can change it.
