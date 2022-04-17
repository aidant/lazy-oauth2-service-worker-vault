# Lazy OAuth 2.0 Token Vault

<p align='center'>
  Keep your OAuth 2.0 tokens secure and up-to-date.
  <br>
  <a href='https://www.npmjs.com/package/@lazy/oauth2-token-vault'>
    <img src="https://img.shields.io/npm/v/@lazy/oauth2-token-vault?style=flat-square">
  </a>
  <a href='https://bundlephobia.com/package/@lazy/oauth2-token-vault'>
    <img src="https://img.shields.io/bundlephobia/minzip/@lazy/oauth2-token-vault?label=minified%20%26%20gzipped&style=flat-square">
  </a>
  <a href='https://github.com/aidant/lazy-oauth2-token-vault/actions/workflows/publish.yml'>
    <img src="https://img.shields.io/github/workflow/status/aidant/lazy-oauth2-token-vault/Publish?style=flat-square">
  </a>
</p>

---

## Table of Contents

- [Example](#example)
- [API](#api)
  - [`modifyRequest`]
  - [`modifyResponse`]
  - [`fetchWithCredentials`]
  - [`getAccessToken`]
  - [`useRefreshToken`]
  - [`fetchWithCredentialRefresh`]
  - [`registerOauth2TokenInterceptor`]

## Example

###### `application.ts`

```ts
navigator.serviceWorker.register(
  './service-worker.js?' +
    new URLSearchParams({
      oauth2_client_id: 'example-client-id',
      oauth2_url_token: 'https://api.example.com/token',
      oauth2_url_protected_resource_hostname: 'api.example.com',
      oauth2_url_protected_resource_pathname: '/v1/*',
    }),
  { type: 'module' }
)
```

###### `./service-worker.ts`

```ts
import { registerOauth2TokenInterceptor } from '@lazy/oauth2-token-vault'

registerOauth2TokenInterceptor()
```

## API

[`modifyrequest`]: #modifyrequest
[`modifyresponse`]: #modifyresponse
[`fetchwithcredentials`]: #fetchwithcredentials
[`getaccesstoken`]: #getaccesstoken
[`userefreshtoken`]: #userefreshtoken
[`fetchwithcredentialrefresh`]: #fetchwithcredentialrefresh
[`registeroauth2tokeninterceptor`]: #registeroauth2tokeninterceptor
