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
- [Configuration](#configuration)
- [API](#api)
  - [`addOauth2Vault`]
  - [`fetchWithCredentials`]
  - [`fetchWithCredentialRefresh`]

## Example

###### `application.ts`

```ts
navigator.serviceWorker.register(
  './service-worker.js?' +
    new URLSearchParams({
      lazy_oauth2_client_id: 'example-client-id',
      lazy_oauth2_token_url: 'https://api.example.com/token',
      lazy_oauth2_protected_hostname: 'api.example.com',
      lazy_oauth2_protected_pathname: '/v1/*',
    }),
  { type: 'module' }
)
```

###### `./service-worker.ts`

```ts
import { addOauth2Vault } from '@lazy/oauth2-token-vault'

addEventListener('install', (event) => {
  skipWaiting()
})

addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

addOauth2Vault()
```

## Configuration

The configuration options are appended as query string parameters to the service
worker registration. You can see [the example above](#applicationts) for a implementation guide.

The `lazy_oauth2_protected_*` options allow you to limit which requests the
credentials are added to. By default if you don't specify anything then all
requests have credentials.

| Option                           | Description                                             | Required |
| -------------------------------- | ------------------------------------------------------- | -------- |
| `lazy_oauth2_client_id`          | The OAuth 2.0 Client ID                                 | Yes      |
| `lazy_oauth2_token_url`          | The OAuth 2.0 Token URL                                 | Yes      |
| `lazy_oauth2_protected_protocol` | The [URLPattern] `protocol` for the protected resource. |          |
| `lazy_oauth2_protected_username` | The [URLPattern] `username` for the protected resource. |          |
| `lazy_oauth2_protected_password` | The [URLPattern] `password` for the protected resource. |          |
| `lazy_oauth2_protected_hostname` | The [URLPattern] `hostname` for the protected resource. |          |
| `lazy_oauth2_protected_port`     | The [URLPattern] `port` for the protected resource.     |          |
| `lazy_oauth2_protected_pathname` | The [URLPattern] `pathname` for the protected resource. |          |
| `lazy_oauth2_protected_search`   | The [URLPattern] `search` for the protected resource.   |          |
| `lazy_oauth2_protected_hash`     | The [URLPattern] `hash` for the protected resource.     |          |

## API

### `addOauth2Vault`

Add the Oauth2 Vault in the Service Worker.

#### Example

```ts
import { addOauth2Vault } from '@lazy/oauth2-token-vault'

addOauth2Vault()
```

Returns `() => void`

### `fetchWithCredentials`

Exactly like the fetch API, except it will add and remove credentials as
specified in the query string parameters of the Service Worker.

#### Parameters

- `resource` - **string | Request** - The resource that you wish to fetch.
- `init` - _object_ - An object containing any custom settings that you want to apply to the request.

#### Example

```ts
import { fetchWithCredentials } from '@lazy/oauth2-token-vault'

addEventListener('fetch', (event) => {
  event.respondWith(fetchWithCredentials(event.request))
})
```

Returns `Promise<Response>`

### `fetchWithCredentialRefresh`

Exactly like the fetch API, except it will add and remove credentials as
specified in the query string parameters of the Service Worker. If the network
request fails with a 401 Unauthorized, it will attempt to re try the request
once after exchanging the refresh token for a new access token.

#### Parameters

- `resource` - **string | Request** - The resource that you wish to fetch.
- `init` - _object_ - An object containing any custom settings that you want to apply to the request.

#### Example

```ts
import { fetchWithCredentialRefresh } from '@lazy/oauth2-token-vault'

addEventListener('fetch', (event) => {
  event.respondWith(fetchWithCredentialRefresh(event.request))
})
```

Returns `Promise<Response>`

[`modifyrequest`]: #modifyrequest
[`modifyresponse`]: #modifyresponse
[`fetchwithcredentials`]: #fetchwithcredentials
[`getaccesstoken`]: #getaccesstoken
[`userefreshtoken`]: #userefreshtoken
[`fetchwithcredentialrefresh`]: #fetchwithcredentialrefresh
[`addoauth2vault`]: #addoauth2vault
[urlpattern]: https://developer.mozilla.org/en-US/docs/Web/API/URLPattern
