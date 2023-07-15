# NodeTropipaySDK
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Next JS](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Heroku](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![React_Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React_Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=React_Query&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![strapi](https://img.shields.io/badge/strapi-2F2E8B?style=for-the-badge&logo=strapi&logoColor=white)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?style=for-the-badge&logo=Webpack&logoColor=white)
![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white)
![vs](https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)
![vscode](https://img.shields.io/badge/Visual_Studio-5C2D91?style=for-the-badge&logo=visual%20studio&logoColor=white)
![WebStorm](https://img.shields.io/badge/WebStorm-000000?style=for-the-badge&logo=WebStorm&logoColor=white)
![eslint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)
![prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

Node Library SDK for Tropipay Integration by SerproTeam

It is a library for an advanced integration of the tropipay API
**It provides initial authorization** of the module **at application startup**
which **creates an instance** to be used exclusively in the **Server Side**

It also adds creation of payment links, mediated payments, registration of events on the Hook

# Author
[<img src="https://avatars.githubusercontent.com/u/15683590?v=4?size=115" width=115>
<br>
Fidel Remedios Rosado
<br>
<sub>@fiderosado</sub>](https://github.com/fiderosado) 

[![](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://tppay.me/lk1gruhi)

# Repository

https://github.com/fiderosado/NodeTropipaySDK

https://github.com/fiderosado/NodeTropipaySDK.git

<!-- Dependencies -->
<details>
  <summary><h2>Dependencies</h2></summary>
<p>
<ul>
  <li>Axios</li>
  <li>Json Web Token</li>
  <li>CryptoJS</li>
</ul>
</p>
</details>

<!-- Exports -->
<details>
  <summary><h2>Module Exports</h2></summary>
<p>
<ul>
  <li>Tropipay</li>
  <li>TropipayConfig</li>
  <li>TropipayRequireAuth</li>
</ul>
</p>
</details>

<!-- Integration -->
<details>
<summary><h2>Integration NPM Package</h2></summary>
<p>
https://www.npmjs.com/package/sertropipay

---
> First you have to install the library using the various standards to import the dependency and export the functionalities for example:

### NPM
```
  npm install sertropipay
  npm i sertropipay
```
### YARN
```
  yarn add sertropipay
```
### UPGRADE
```
  yarn upgrade sertropipay
```
</p>
</details>

<!-- enviroment -->
<details>
  <summary><h2>Enviroment keys</h2></summary>
<p>

---
> You need to configure this keys

```javascript
  NODE_ENV=development or production
  TROPIPAY_SERVER=https://tropipay-dev.herokuapp.com
  TROPIPAY_CLIENT_ID="you client id"
  TROPIPAY_CLIENT_SECRET="you client secret key"
  TROPIPAY_SCOPE="ALLOW_GET_PROFILE_DATA ALLOW_GET_BALANCE ALLOW_GET_MOVEMENT_LIST ALLOW_PAYMENT_IN ALLOW_EXTERNAL_CHARGE KYC3_FULL_ALLOW ALLOW_PAYMENT_OUT ALLOW_MARKET_PURCHASES ALLOW_GET_CREDENTIAL"
```
---
> If you dont have the scope params follow this link:
https://tpp.stoplight.io/docs/tropipay-api-doc/ZG9jOjI3NDE0MjMw-integration-with-client-credentials

</p>
</details>

<!-- Start -->
<details>
  <summary><h2>Start On</h2></summary>
<p>

### To use the library at the start of the app there are several approaches, I will show them to you and you can choose the one that is most useful for you.

## next.config.js

> In this case we will use the start focused on file next.config.js which allows us to create an instance to be authorized on Tropipay of and propagate it in the project, Add this code to next.config.js File.
  
```javascript
  const Tropipay = require("sertropipay").Tropipay.getInstance();

  const nextConfig = {
    /* use the serverRuntimeConfig function to start the process on bakend */
    serverRuntimeConfig: {
      initializeTpp: Tropipay.Authorize(),
    },
    /* */
  }
```

## tropipayInstance.js

> In this case we will use the start focused file in the root directory called tropipayInstance.js which will have a global variable with the existing instance

```javascript
  import { Tropipay } from "sertropipay";
  let tropipayInstance;
  export async function getTropipayInstance() {
    if (!tropipayInstance) {
      tropipayInstance = await Tropipay.getInstance().Authorize();
    }
    return tropipayInstance;
  }
```

---
> When the project start you can see an recive messages on bakend logs like this:

```javascript
- ready started server on 0.0.0.0:6006, url: http://localhost:6006 (on my case)
- info Loaded env from ***\.env
- wait compiling...
$ next build
- info Loaded env from *\.env
- Tropipay: starting...
- Error: Tropipay: Authorize: Validating token error, autorizing...
- Error: Tropipay: Axios: Instance not exist, creating...
- Success: Tropipay: Axios: Instance is ready...
- Success: Tropipay: Authorize is ready...
```
---
> This is the response of the first call to the tropipay api requesting authorization.

```javascript
{
  access_token: 'eyJhbGciOiJIUzI*****',
  refresh_token: 'MTY4ODY1OTE******',
  token_type: 'Bearer',
  expires_in: 1688666372,
  scope: 'ALLOW_EXTERNAL_CHARGE ALLOW_CREATE_BENEFICIARY *******'
}
```
</p>
</details>

<!-- uses -->
<details>
  <summary><h2>Use on Bakend</h2></summary>
<p>

---
> In this case we will use an api route which we will use the resource:
> /api/*

```javascript

  import { NextResponse } from "next/server";
  import { Tropipay } from "sertropipay";

  export async function GET() {
    const getTropipayInstance = Tropipay.getInstance();
    const TropipayInstance = await getTropipayInstance.Authorize();
  
    return NextResponse.json({
      rendered: "ok",
      data: `${JSON.stringify(TropipayInstance.getData())}`,
    });
  }

```
</p>
</details>

<!-- error -->
<details>
  <summary><h2>When Recive Error</h2></summary>
<p>  

---
> 503 - When the vars is nor real or accepted tropipay send an error line this:

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
</p>
</details>

<!-- 
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
    forceRedirect: true,
    session: {
      id: "as23132as1d21321as2d1",
    }
  })(IndexPage);
  
  redirectTo : the route to redirect when the user is not logued. the default value is "/login"
  redirectIfNotAuthenticated: default value must be true
  forceRedirect: default value must be true
  session / id: the pachage is a manager session for tpp on the site, if not have a asession valid is redirect to redirectTo param 
  
```
-->
