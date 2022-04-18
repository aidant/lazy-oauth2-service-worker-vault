declare var addEventListener: ServiceWorkerGlobalScope['addEventListener']
declare var removeEventListener: ServiceWorkerGlobalScope['removeEventListener']

const OAUTH2_CLIENT_ID = new URLSearchParams(location.search).get('lazy_oauth2_client_id') || ''
const OAUTH2_TOKEN_URL = new URLSearchParams(location.search).get('lazy_oauth2_token_url') || ''
// @ts-expect-error URLPattern does not yet have types.
const OAUTH2_PROTECTED_RESOURCE_URL = new URLPattern(
  Object.fromEntries(
    [...new URLSearchParams(location.search).entries()]
      .filter(([key]) => key.startsWith('lazy_oauth2_protected_'))
      .map(([key, value]) => [key.replace('lazy_oauth2_protected_', ''), value])
  )
)

const oauth2 = {
  access_token: '',
  token_type: '',
  expires_in: 0,
  refresh_token: '',
}

const isOauth2TokenURL = (url: string): boolean => OAUTH2_TOKEN_URL === url
const isOauth2ProtectedResourceURL = (url: string): boolean =>
  OAUTH2_PROTECTED_RESOURCE_URL.test(url)

const modifyRequest = (request: Request): Request => {
  if (isOauth2ProtectedResourceURL(request.url) && oauth2.token_type && oauth2.access_token) {
    const headers = new Headers(request.headers)
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `${oauth2.token_type} ${oauth2.access_token}`)
    }
    return new Request(request, { headers })
  }

  return request
}

const modifyResponse = async (response: Response): Promise<Response> => {
  if (isOauth2TokenURL(response.url) && response.status === 200) {
    const { access_token, token_type, expires_in, refresh_token, ...payload } =
      await response.json()

    oauth2.access_token = access_token
    oauth2.token_type = token_type
    oauth2.expires_in = expires_in
    oauth2.refresh_token = refresh_token

    return new Response(JSON.stringify(payload, null, 2), {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    })
  }

  return response
}

export const fetchWithCredentials = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const request = input instanceof Request ? input : new Request(input, init)
  return fetch(modifyRequest(request)).then(modifyResponse)
}

const getAccessToken = async (): Promise<Response> =>
  fetchWithCredentials(
    new Request(OAUTH2_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: OAUTH2_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: oauth2.refresh_token,
      }),
    })
  )

const useRefreshToken = async (request: Request, response: Response): Promise<Response> => {
  if (
    isOauth2ProtectedResourceURL(response.url) &&
    response.status === 401 &&
    oauth2.refresh_token
  ) {
    await getAccessToken()
    return fetchWithCredentials(request)
  }

  return response
}

export const fetchWithCredentialRefresh = (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  const request = input instanceof Request ? input : new Request(input, init)
  return fetchWithCredentials(request).then((response) => useRefreshToken(request, response))
}

export const addOauth2Vault = (): (() => void) => {
  const listener = (event: FetchEvent) => {
    event.respondWith(fetchWithCredentialRefresh(event.request))
  }

  addEventListener('fetch', listener)
  return () => removeEventListener('fetch', listener)
}
