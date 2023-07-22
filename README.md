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
<details open>
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
<details open>
  <summary><h2>Module Exports</h2></summary>
<p>
<ul>
  <li>Tropipay</li>
  <li>TropipayConfig</li>
  <li>TropipayRequireAuth</li>
  <li>TropipayModels</li>
</ul>
</p>
</details>

<!-- Integration -->
<details open>
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
<details open>
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
<details open>
  <summary><h2>Start On</h2></summary>
<p>

### To use the library at the start of the app there are several approaches, I will show them to you and you can choose the one that is most useful for you.

> You don't necessarily have to use this approach, you can make one directly in your routes by implementing [use-on-bakend](https://github.com/fiderosado/NodeTropipaySDK/blob/main/README.md#use-on-bakend)

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
<details open>
  <summary><h2>Use on Bakend</h2></summary>
<p>

> In this case we will use an api route which we will use the resource:
> /api/*

```javascript

import { NextResponse } from "next/server";
import { Tropipay } from "sertropipay";

export async function GET() {
  const TropipayInstance = await Tropipay.getInstance().Authorize();

  return NextResponse.json({
    rendered: "ok",
    data: `${JSON.stringify(TropipayInstance.getData())}`,
  });
}

```
</p>
</details>

<!-- uses -->
<details open>
  <summary><h2>Create a FirstPayment Card</h2></summary>
<p>

> In this example, the payment attempt is created statically from a get request to the server, but the correct thing to do is to implement your corresponding business logic.

> In this case we will create a direct payment link between the client and the provider account, it can be personal or company type, which requires two models, the first for the client and the second for the payment card, which includes the Client model, You can access these models implementing TropipayModels in the import, but if you want you can use an object with the required properties in the model, as long as the data model is fulfilled the payment attempt is successful, delivering an object with the necessary data to continue the pay.

### CientModel
```javascript
  {
  name: string – The name of the client.
          lastName: string – The last name of the client.
          address: string – The address of the client.
          phone: string – The phone number of the client.
          email: string – The email of the client.
          termsAndConditions: string – The terms and conditions accepted by the client.
          countryId: number – The ID of the country. (Optional if countryIso has a value)
  countryIso: string – The ISO code of the country. (Optional if countryId has a value)
}
```
### PaymentCardModel
```javascript
  {
  reference: string – The reference for the payment card.
          concept: string – The concept of the payment card.
          description: string – The description of the payment card.
          favorite: boolean – Indicates if the payment card is marked as favorite.
          amount: number – The amount for the payment card.
          currency: string – The currency for the payment card.
          singleUse: boolean – Indicates if the payment card is for single use.
          reasonId: number – The reason ID for the payment card.
          expirationDays: number – The expiration days for the payment card.
          lang: string – The language for the payment card.
          urlSuccess: string – The URL for the successful payment.
          urlFailed: string – The URL for the failed payment.
          urlNotification: string – The URL for the payment notification.
          serviceDate: string – The service date for the payment card.
          directPayment: boolean – Indicates if the payment is a direct payment.
          paymentMethods: Array – The payment methods available for the payment card.
          saveToken: boolean – Indicates if the payment token should be saved.
          cient: CientModel – The client data for the payment card.
}
```
----

```javascript
    import { NextResponse } from "next/server";
import { Tropipay, TropipayModels } from "sertropipay";

export async function GET() {
  const TropipayInstance = await Tropipay.getInstance().Authorize();

  const clientForCart = new TropipayModels.CientPayload(
          "Nombre",
          "Apellidos",
          "Address",
          "+cell",
          "email@gmail.com",
          "1",
          null,
          "true"
  );
  const previusCart = new TropipayModels.PaymentCardPayload(
          "s87e8h213h132d13h13r12h13",
          "Bicycle",
          "Two wheels",
          false,
          3000,
          "EUR",
          true,
          4,
          1,
          "es",
          "https://requestinspector.com/inspect/01h5kkczp74gceza3bp2a9mc54",
          "https://requestinspector.com/inspect/01h5kkczp74gceza3bp2a9mc54",
          "https://requestinspector.com/inspect/01h5kkczp74gceza3bp2a9mc54",
          "2023-07-17",
          true,
          ["EXT", "TPP"],
          false,
          clientForCart.toObject()
  );

  const intentCart = await TropipayInstance.CreatePaymentCard(
          previusCart.toObject()
  );

  return NextResponse.json({
    rendered: "ok",
    data: `${JSON.stringify(intentCart)}`,
  });
}
```

</p>
</details>


<details open>
  <summary><h2>Creating a Mediation Payment Card</h2></summary>
<p>  

> Only for Business accounts, This endpoint allows you to generate an escrow payment link. This allows a payment to be made to persons belonging or not to the TropiPay platform with the particularity that the payment will be held in custody or retained until it is released with the approval of the payer.

> https://tpp.stoplight.io/docs/tropipay-api-doc/12a128ff971e4-creating-a-mediation-payment-card

### Subscribe to events through hook
> You can subscribe to events through hooks, and receive notifications for each action related to mediated paymentcards, there are three events for this:

> https://tpp.stoplight.io/docs/tropipay-api-doc/0b7235bfedb66-subscribe-to-new-event-with-a-hook

* transaction_guarded: triggered when a paymentcard is paid
* transaction_charged: Triggered when a paymentcard is released
* transaction_cancelled: Triggered when a paymentcard is canceled

----
### Mediation Payment Card Payload
```javascript
    {
  "amount": 5000,
          "currency": "EUR",
          "concept": "Celular",
          "description": "Celular nuevo",
          "reference": "458424548",
          "singleUse": false,
          "lang": "es",
          "productUrl": "https://www.google.es",
          "buyer": null,
          "seller": {
    "sellerId": null,
            "type": 1,
            "email": "user@gmail.com"
  },
  "feePercent": 600,
          "feeFixed": 0,
          "sendMail": false
}
```
### Create Mediation Payment Card Implementation
```javascript
    import { NextResponse } from "next/server";
import { Tropipay } from "sertropipay";

export async function GET() {
  const TropipayInstance = await Tropipay.getInstance().Authorize();
  const mediation_card = await TropipayInstance.CreateMediationPaymentCard( Mediation Payment Card Payload );

  return NextResponse.json({
    rendered: "ok",
    data: `${JSON.stringify(mediation_card)}`,
  });
}

/** 200 OK Response **/

{
  "reference": "458424548",
        "concept": "Celular",
        "description": "Celular nuevo",
        "amount": 5000,
        "currency": "EUR",
        "singleUse": false,
        "favorite": false,
        "reasonId": 6,
        "expirationDays": 0,
        "userId": "d48f0800-25a0-11ea-9773-1315b442db0a",
        "lang": "es",
        "state": 1,
        "hasClient": false,
        "credentialId": 129283,
        "urlSuccess": null,
        "urlFailed": null,
        "saveToken": false,
        "paymentcardType": 2,
        "updatedAt": "2023-07-18T06:57:33.887Z",
        "createdAt": "2023-07-18T06:57:33.505Z",
        "qrImage": null,
        "shortUrl": null,
        "urlNotification": null,
        "expirationDate": null,
        "serviceDate": null,
        "paymentUrl": "https://tppay.me/lk7xzsze",
        "reasonDes": null,
        "seller": {
  "paymentcardId": "5eddbb10-2538-11ee-8322-5fbd993ebf9a",
          "sendMail": false,
          "merchantFeePercent": 600,
          "merchantFeeFixed": 0,
          "feeToSeller": false,
          "productUrl": "https://www.google.es",
          "updatedAt": "2023-07-18T06:57:33.528Z",
          "createdAt": "2023-07-18T06:57:33.528Z",
          "sellerId": 59174
},
  "flowId": "5eddbb10-2538-11ee-8322-5fbd993ebf9a"
}
```
</p>
</details>


<details open>
  <summary><h2>Deposit Accounts</h2></summary>
<p>  

> Returns the list of beneficiaries (depositAccounts) of logged user. Beneficiaries can be active (status: 0) or inactive (status: 1)
> https://tpp.stoplight.io/docs/tropipay-api-doc/e232d0427f703-get-deposit-accounts-list

```javascript
  import { NextResponse } from "next/server";
import { Tropipay } from "sertropipay";

export async function GET() {
  const TropipayInstance = await Tropipay.getInstance().Authorize();

  const listadeposit = await TropipayInstance.GetDepositAccountsList();
  return NextResponse.json({
    rendered: "ok",
    data: `${JSON.stringify(listadeposit)}`,
  });
}
```
</p>
</details>

<!-- hooks -->
<details open>
  <summary><h2>Hooks</h2></summary>
<p>  

----
### Subscribe to new event with a hook
> Endpoint allows a merchant to subscribe to an event, specifying the options to receive information at the time it is trigger.
> https://tpp.stoplight.io/docs/tropipay-api-doc/0b7235bfedb66-subscribe-to-new-event-with-a-hook

> POST: https://tropipay-dev.herokuapp.com/api/v2/hooks , Authorization required Bearer {token}

> Event : Events are made up of an object with three fundamental properties (event, target, value)

* event: String that represents the name of the event, you must select from the list of available events, otherwise it will not produce an error but it will not be executed. For get full list of available events see endpoint GET /api/v2/hook/events.

* target: String representing the type of event supported. It is currently available: 'web' (allows to receive information in a url), 'email' (allows to receive information in an email address).

* value: String that represents the value depending on the type of selected event determined by the 'target' property, for example if the selected 'target' is email the value would be an email address, likewise if the selected 'target' is 'web' the expected value corresponds to a url that receives information through the HTTP POST method.

### Use SubscribeNewEventHook
```javascript

import { NextResponse } from "next/server";
import { Tropipay } from "sertropipay";

export async function GET() {
  const TropipayInstance = await Tropipay.getInstance().Authorize();

  const NewEvent = {
    "event": "user_signup",
    "target": "web",
    "value": "https://www.merchant_domain.com/api/user/signup/listen"
  }
  /** OR **/
  const NewEvent = {
    "event": "user_signup",
    "target": "email",
    "value": "user@mail.com"
  }

  const hook_response = await TropipayInstance.SubscribeNewEventHook(NewEvent);

  return NextResponse.json({
    rendered: "ok",
    data: `${JSON.stringify(hook_response)}`,
  });
}
/** Response Example **/
{
    "action": "update",
    "status": "success",
    "details": "user_signup"
}

{
    "action": "subscribe",
    "status": "success",
    "details": "transaction_guarded"
}

```
----
### Get a list of all events subscribed with Hooks
> Endpoint for getting event hooks list by merchant.

> GET: https://tropipay-dev.herokuapp.com/api/v2/hooks , Authorization required Bearer {token}

> Event : Events are made up of an object with three fundamental properties (event, target, value)

* event: String that represents the name of the event, you must select from the list of available events, otherwise it will not produce an error but it will not be executed. For get full list of available events see endpoint GET /api/v2/hook/events.

* target: String representing the type of event supported. It is currently available: 'web' (allows to receive information in a url), 'email' (allows to receive information in an email address).

* value: String that represents the value depending on the type of selected event determined by the 'target' property, for example if the selected 'target' is email the value would be an email address, likewise if the selected 'target' is 'web' the expected value corresponds to a url that receives information through the HTTP POST method.

### Use GetEventsSubscribedHooksList
```javascript
  import { NextResponse } from "next/server";
import { Tropipay } from "sertropipay";

export async function GET() {
  const TropipayInstance = await Tropipay.getInstance().Authorize();

  const hooks_list = await TropipayInstance.GetEventsSubscribedHooksList();
  return NextResponse.json({
    rendered: "ok",
    data: `${JSON.stringify(hooks_list)}`,
  });
}

/** 200 OK Response */
[
    {
        "event": "transaction_guarded",
        "target": "web",
        "value": "https://site.onrender.com/api/hooks/payment",
        "createdAt": "2023-07-20T05:32:25.946Z",
        "updatedAt": "2023-07-20T05:32:25.946Z"
    },
    {
        "event": "transaction_charged",
        "target": "web",
        "value": "https://site.onrender.com/api/hooks/payment",
        "createdAt": "2023-07-20T05:34:22.728Z",
        "updatedAt": "2023-07-20T05:34:22.728Z"
    },
    {
        "event": "transaction_cancelled",
        "target": "web",
        "value": "https://site.onrender.com/api/hooks/payment",
        "createdAt": "2023-07-20T05:34:35.528Z",
        "updatedAt": "2023-07-20T05:34:35.528Z"
    }
]
```

----
### Get a list with all events that allow a subscription
> Endpoint for get full list of available events. Events are made up of an object with two fundamental properties (name, description)

> GET: https://tropipay-dev.herokuapp.com/api/v2/hooks/events

* user_signup: Event launched once an user complete registration on the TropiPay platform.
* user_login: Event launched once an user complete login on the TropiPay platform.
* user_kyc: Event launched once an user complete KYC process, indicated in each case the process status. Payload of response:
* payment_in_state_change: The event is fired once a user changes their status payment in entry method.
* payment_out_state_change: The event is fired once a user changes their status payment out entry method.

### Use GetEventsAllowSubscriptionList
```javascript
  import { NextResponse } from "next/server";
import { Tropipay } from "sertropipay";

export async function GET() {
  const TropipayInstance = await Tropipay.getInstance().Authorize();

  const hooks_list = await TropipayInstance.GetEventsAllowSubscriptionList();
  return NextResponse.json({
    rendered: "ok",
    data: `${JSON.stringify(hooks_list)}`,
  });
}

/** 200 OK Response */

[
  {
    "name": "user_signup",
    "description": "Event launched once an user completes registration on the TropiPay platform."
  },
  {
    "name": "user_login",
    "description": "Event launched once an user completes login on the TropiPay platform."
  },
  {
    "name": "user_kyc",
    "description": "Event launched once an user completes kyc process."
  },
  {
    "name": "payment_in_state_change",
    "description": "The event is fired once a user changes their status payment in entry method."
  },
  {
    "name": "payment_out_state_change",
    "description": "The event is fired once a user changes their status payment out entry method."
  },
  {
    "name": "beneficiary_added",
    "description": "Launched after new beneficiary is created."
  },
  {
    "name": "beneficiary_updated",
    "description": "Launched after a beneficiary is modified."
  },
  {
    "name": "beneficiary_deleted",
    "description": "Launched after a beneficiary is deleted."
  },
  {
    "name": "transaction_new",
    "description": "Create a new transaction"
  },
  {
    "name": "transaction_preauthorized",
    "description": "Pre-authorized and blocked transaction awaiting review"
  },
  {
    "name": "transaction_pendingin",
    "description": "Pending transaction to settle in the payment entity"
  },
  {
    "name": "transaction_processing",
    "description": "Transaction in process"
  },
  {
    "name": "transaction_error",
    "description": "Transaction in error"
  },
  {
    "name": "transaction_bloqued",
    "description": "Transaction bloqued"
  },
  {
    "name": "transaction_charged",
    "description": "Transaction waiting to be sent"
  },
  {
    "name": "transaction_paid",
    "description": "Transaction sent"
  },
  {
    "name": "transaction_cancelled",
    "description": "Transaction cancelled"
  },
  {
    "name": "transaction_guarded",
    "description": "Transaction guarded"
  },
  {
    "name": "transaction_guarded_send",
    "description": "Transaction guarded and send"
  },
  {
    "name": "transaction_guarded_mediation",
    "description": "Transaction guarded with mediation"
  },
  {
    "name": "user_after_update",
    "description": "Event launched after a user is updated."
  },
  {
    "name": "user_after_create",
    "description": "Event launched after a user is created."
  },
  {
    "name": "userDetail_after_create",
    "description": "Event launched after a userDetails is created."
  },
  {
    "name": "userDetail_after_update",
    "description": "Event launched after a userDetails is updated."
  },
  {
    "name": "transaction_completed",
    "description": "Event launched after transaction is completed."
  },
  {
    "name": "tpv_callback_ok",
    "description": "Event launched after tpv callback ok."
  }
]
```
</p>
</details>

<!-- error -->
<details open>
  <summary><h2>When Recive Error</h2></summary>
<p>  

---

> Create a new Deposit Account
https://tpp.stoplight.io/docs/tropipay-api-doc/6bc05a0be7e81-create-a-new-deposit-account
> 400 - THE SAME BENEFICIARY CANNOT BE THE MEDIATOR

```javascript
    POST: https://tropipay-dev.herokuapp.com/api/v2/deposit_accounts
{
  "error": {
  "type": "VALIDATION_ERROR",
          "code": "VALIDATION_ERROR",
          "message": "The source and destination accounts cannot be the same",
          "details": [],
          "i18n": "Parámetros inválidos"
}
}
```
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
