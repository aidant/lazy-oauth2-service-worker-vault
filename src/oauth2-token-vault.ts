const oauth2 = {
  access_token: '',
  token_type: '',
  expires_in: 0,
  refresh_token: '',
}

const URL_OAUTH2_TOKEN = new URLSearchParams(location.search).get('url_oauth2_token')
const URL_PROTECTED_RESOURCE = URLPattwen(
  new URLSearchParams(location.search).get('url_protected_resource')
)

const isURLOauth2Token = (url: string): boolean => URL_OAUTH2_TOKEN === url
const isURLProtectedResource = (url: string): boolean => URL_PROTECTED_RESOURCE.test(url)

export const useAccessToken = async (response: Response): Promise<Response> => {
  if (isURLOauth2Token(response.url) && response.status === 200) {
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

export const getAccessToken = async (): Promise<Response> => {
  const response = await fetch(URL_OAUTH2_TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: oauth2.refresh_token,
    }),
  })

  return useAccessToken(response)
}

export const setAccessToken = (request: Request): void => {
  if (isURLProtectedResource(request.url) && oauth2.token_type && oauth2.access_token) {
    request.headers.set('Authorization', `${oauth2.token_type} ${oauth2.access_token}`)
  }
}

export const useRefreshToken = async (request: Request, response: Response): Promise<Response> => {
  if (isURLProtectedResource(response.url) && response.status === 401 && oauth2.refresh_token) {
    await getAccessToken()
    setAccessToken(request)
    return fetch(request).then(useAccessToken)
  }

  return response
}

export const registerOauth2TokenInterceptor = (): (() => void) => {
  const listener = (event: FetchEvent) => {
    setAccessToken(event.request)
    event.respondWith(fetch(event.request).then(useAccessToken))
  }

  addEventListener('fetch', listener)
  return () => removeEventListener('fetch', listener)
}
