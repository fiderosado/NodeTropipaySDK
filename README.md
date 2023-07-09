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
- TropipayConfig
- TropipayRequireAuth
  
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

  const { Tropipay, TropipayConfig } = require("sertropipay");
  
  const tppConfig = new TropipayConfig({
    clientId: process.env.TROPIPAY_CLIENT_ID,
    clientSecret: process.env.TROPIPAY_CLIENT_SECRET,
    scopes: process.env.TROPIPAY_SCOPE,
    deployMode: process.env.NODE_ENV,
    tppServerUrl: process.env.TROPIPAY_SERVER,
  });

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
    at Tropipay.Authorize function

{
  statusCode: 503,
  statusMessage: 'Service Unavailable',
  data: ''
}
```
# Use on Pages
When use the package you recive this Promise whith the class inside this is the correct result, is not like this you recive a undefined result
TropipayInstance-->  Tropipay { rendered: 1 }

On Page of the next project add this code and use the public Methods:
```javascript
  /* On next 13 the config load on Bakend first when use getConfig and serverRuntimeConfig function */
  "use client";
  import getConfig from "next/config";
  const { serverRuntimeConfig } = getConfig() || {};
  const TropipayInstance = serverRuntimeConfig?.getTropipayInstance;
  const IndexPage = () => {
    console.log("TropipayInstance-->Instance Initial", TropipayInstance);
    console.log(
            "TropipayInstance-->getInstance actual",
            TropipayInstance?.getInstance()
    );
    console.log(
            "TropipayInstance-->getRendered time: ",
            TropipayInstance?.getRendered()
    );
    return (
        <>
          {/*your html code*/}
        </>
    );
  };
  /*
  Log:
  TropipayInstance-->Instance Initial Tropipay { rendered: 1 }
  TropipayInstance-->getInstance actual Tropipay { rendered: 1 } (the same instance)
  TropipayInstance-->getRendered time:  1 (only Rendered one time)
  * */
```
# Tropipay Require Auth

The `TropipayRequireAuth` hook is a utility that wraps components on a page 
to control access for authenticated users. 
It is used to manage access to a particular resource or feature.

```javascript
  "use client";
  import { TropipayRequireAuth } from "sertropipay";

  const IndexPage = (props) => {
    return (
        <>
          {/*<html code here />*/}
        </>
    );
  };

  export default TropipayRequireAuth({
    redirectTo: "/login",
    redirectIfNotAuthenticated: true,
    session: {
      id: "as23132as1d21321as2d1",
    }
  })(IndexPage);
  
```