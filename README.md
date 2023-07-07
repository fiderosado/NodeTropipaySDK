# NodeTropipaySDK
Node Library SDK for Tropipay Integration by SerproTeam
https://github.com/fiderosado/NodeTropipaySDK

# Author
Fidel Remedios Rosado
https://github.com/fiderosado

# Repository
https://github.com/fiderosado/NodeTropipaySDK.git

# Dependencies
- axios

# Module Exports
- Tropipay
- ClientCredentials
  
# Integration NPM Package
https://www.npmjs.com/package/sertropipay

- First You can use npm or yarn to install this package:

```npm install sertropipay``` 
```npm i sertropipay```
or
```yarn add sertropipay```

- You need to configure the enviroment keys:
```javascript
  NODE_ENV=development or production
  TROPIPAY_SERVER=https://tropipay-dev.herokuapp.com
  TROPIPAY_CLIENT_ID="you client id"
  TROPIPAY_CLIENT_SECRET="you client secret key"
  TROPIPAY_SCOPE="ALLOW_GET_PROFILE_DATA ALLOW_GET_BALANCE ALLOW_GET_MOVEMENT_LIST ALLOW_PAYMENT_IN ALLOW_EXTERNAL_CHARGE KYC3_FULL_ALLOW ALLOW_PAYMENT_OUT ALLOW_MARKET_PURCHASES ALLOW_GET_CREDENTIAL"
```
If you dont have the scope params follow this link:
https://tpp.stoplight.io/docs/tropipay-api-doc/ZG9jOjI3NDE0MjMw-integration-with-client-credentials

- Start on Begin :
  When the Project start the module need to be authorized on Tropipay.
  Add this code to next.config.js File
```javascript
  const Tropipay = require("sertropipay").Tropipay;
  const TropipayConfig = require("sertropipay").TropipayConfig;

  const tppConfig = new TropipayConfig(
    process.env.TROPIPAY_CLIENT_ID,
    process.env.TROPIPAY_CLIENT_SECRET,
    process.env.TROPIPAY_SCOPE,
    process.env.NODE_ENV
  );

  const nextConfig = {
    // use the serverRuntimeConfig function to start the process on bakend
    serverRuntimeConfig: {
      getTropipayInstance: Tropipay.setConfig(tppConfig).Authorize(),
    },
    /****/
  }
```
# When Start

When the project start you can see an recive messages on bakend logs like this:
```javascript
- ready started server on 0.0.0.0:6006, url: http://localhost:6006 (on my case)
- info Loaded env from ***\.env
- wait compiling...
- Tropipay Instance Created...
- event compiled client and server successfully in 1021 ms (306 modules)
- Tropipay Autorization Successful...
{
  access_token: 'eyJhbGciOiJIUzI*****',
  refresh_token: 'MTY4ODY1OTE******',
  token_type: 'Bearer',
  expires_in: 1688666372,
  scope: 'ALLOW_EXTERNAL_CHARGE ALLOW_CREATE_BENEFICIARY *******'
}

```
# When Recive Error
When the vars is nor real or accepted tropipay send an error line this:

```javascript
  - ready started server on 0.0.0.0:6006, url: http://localhost:6006 (on my case)
  - info Loaded env from *****\.env
  - Tropipay Instance Created...
  - event compiled client and server successfully
  - wait compiling...
  - Tropipay Instance Created...
  - event compiled client and server successfully
  - Error: Tropipay SDK has an error:  AxiosError: Request failed with status code 503
  - Error: Could not obtain the access token from credentials  AxiosError: Request failed with status code 503
    at Tropipay.getAuthorization function

{
  statusCode: 503,
  statusMessage: 'Service Unavailable',
  data: ''
}
```
