# Server-Side Authentication

tlv2-ui supports two authentication modes, selected per consuming application via the `serverAuth` module option. Only one mode is active at a time.

## Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['tlv2-ui'],
  tlv2: {
    serverAuth: true,               // Enable server-side auth (false = client-side SPA SDK)
    serverAuthRoutes: ['/admin/**'], // Optional: only protect matching routes (default: all routes)
    auth0Domain: 'example.auth0.com',
    auth0ClientId: 'your-client-id',
    auth0RedirectUri: 'https://your-app.com',
    auth0LogoutUri: 'https://your-app.com',
    auth0Audience: 'https://your-api/',
    auth0Scope: 'openid profile email',
  }
})
```

If `auth0PublicKey` is not set, JWT verification uses JWKS (fetched once from Auth0's `/.well-known/jwks.json` endpoint and cached).

## Auth Modes

### Server Auth (`serverAuth: true`)

JWT is stored in an HttpOnly secure cookie. The Auth0 SPA SDK is not loaded. All auth operations happen server-side.

### Client Auth (`serverAuth: false`, default)

JWT is managed by the Auth0 SPA SDK in the browser (localStorage). This is the existing behavior.

## Server Auth Flow

### 1. Initial Page Load (unauthenticated)

```
Browser                    Nuxt Server                Auth0
  |                            |                        |
  |-- GET /admin ------------>|                        |
  |                            |-- middleware: no token  |
  |                            |   route matches         |
  |                            |   serverAuthRoutes      |
  |                            |                        |
  |                            |-- generate PKCE pair    |
  |                            |-- encode state (target  |
  |                            |   URL + code verifier)  |
  |                            |-- set state cookie      |
  |                            |   (HttpOnly, 5min TTL)  |
  |                            |                        |
  |<-- 302 Redirect ----------|                        |
  |    to Auth0 /authorize                              |
  |    (with code_challenge,                            |
  |     state, client_id)                               |
  |                                                     |
  |-- GET /authorize --------------------------------->|
  |                                                     |
  |                          (user logs in at Auth0)    |
  |                                                     |
  |<-- 302 Redirect -----------------------------------|
  |    to /api/auth/callback                            |
  |    (with code, state)                               |
```

### 2. Callback (code exchange)

```
Browser                    Nuxt Server                Auth0
  |                            |                        |
  |-- GET /api/auth/callback ->|                        |
  |   (code, state params)     |                        |
  |                            |-- verify state cookie   |
  |                            |   matches state param   |
  |                            |   (CSRF protection)     |
  |                            |                        |
  |                            |-- parse state:          |
  |                            |   extract targetUrl     |
  |                            |   extract codeVerifier  |
  |                            |                        |
  |                            |-- POST /oauth/token --->|
  |                            |   (code, client_secret, |
  |                            |    code_verifier)       |
  |                            |                        |
  |                            |<-- access_token --------|
  |                            |                        |
  |                            |-- verify JWT            |
  |                            |   (jose: JWKS or PEM)   |
  |                            |                        |
  |                            |-- set auth cookie       |
  |                            |   (HttpOnly, Secure,    |
  |                            |    SameSite=Lax,        |
  |                            |    maxAge=expires_in)   |
  |                            |                        |
  |<-- 302 Redirect to -------|                        |
  |    original targetUrl      |                        |
```

### 3. Authenticated Page Load

```
Browser                    Nuxt Server                Upstream API
  |                            |                        |
  |-- GET /admin ------------->|                        |
  |   (cookie: tlv2_auth_token)|                        |
  |                            |-- middleware: extract   |
  |                            |   token from cookie     |
  |                            |-- verify JWT            |
  |                            |-- set event.context.auth|
  |                            |   { sub, email,         |
  |                            |     permissions }       |
  |                            |                        |
  |                            |-- SSR: auth.server.ts   |
  |                            |   plugin copies auth    |
  |                            |   to useState           |
  |                            |                        |
  |<-- HTML (SSR rendered) ----|                        |
  |   (useState hydrated       |                        |
  |    in payload)             |                        |
```

### 4. Client-Side API Request (via proxy)

```
Browser                    Nuxt Server (proxy)        Upstream API
  |                            |                        |
  |-- POST /api/v2/query ----->|                        |
  |   (cookie: tlv2_auth_token)|                        |
  |   (header: x-csrf-token)   |                        |
  |                            |-- CSRF validation       |
  |                            |   (nuxt-csurf)          |
  |                            |                        |
  |                            |-- extract JWT from      |
  |                            |   cookie                |
  |                            |                        |
  |                            |-- POST upstream ------->|
  |                            |   Authorization: Bearer |
  |                            |   <jwt>                 |
  |                            |                        |
  |                            |<-- response ------------|
  |<-- response ---------------|                        |
```

### 5. Unauthenticated API Request (via proxy)

```
Browser                    Nuxt Server (proxy)        Upstream API
  |                            |                        |
  |-- POST /api/v2/query ----->|                        |
  |   (no auth cookie)         |                        |
  |   (header: x-csrf-token)   |                        |
  |                            |-- CSRF validation       |
  |                            |                        |
  |                            |-- no JWT found          |
  |                            |                        |
  |                            |-- POST upstream ------->|
  |                            |   apikey: <server key>  |
  |                            |                        |
  |                            |<-- response ------------|
  |<-- response ---------------|                        |
```

### 6. Manual Login

```
Browser                    Nuxt Server
  |                            |
  |  (useLogin() called)       |
  |                            |
  |-- GET /api/auth/login ---->|
  |   ?returnTo=/some/page     |
  |                            |-- generate PKCE
  |                            |-- set state cookie
  |<-- 302 to Auth0 /authorize |
  |                            |
  |  (continues as flow 1-2)   |
```

### 7. Logout

```
Browser                    Nuxt Server                Auth0
  |                            |                        |
  |  (useLogout() called)      |                        |
  |                            |                        |
  |-- GET /api/auth/logout --->|                        |
  |                            |-- clear auth cookie     |
  |                            |                        |
  |<-- 302 Redirect ----------|                        |
  |    to Auth0 /v2/logout                              |
  |    (with returnTo)                                  |
  |                                                     |
  |-- GET /v2/logout --------------------------------->|
  |                                                     |
  |<-- 302 Redirect to returnTo -----------------------|
```

## Proxy Auth Precedence

The proxy (`/api/v2/**`) determines upstream credentials in this order:

1. **Authorization header** -- present in client auth mode (SPA SDK sends `Bearer <token>`)
2. **`tlv2_auth_token` cookie** -- present in server auth mode (converted to `Bearer <token>`)
3. **apikey** -- fallback for unauthenticated users (from request query/header, or server-configured `graphqlApikey`)

JWT and apikey are mutually exclusive: if a JWT is found, no apikey is sent.

## Route-Specific Auth

The `serverAuthRoutes` option controls which routes require authentication. Routes not matching these patterns are accessible without login, but if a valid token is present it will still be verified and `event.context.auth` will be populated.

```typescript
serverAuthRoutes: [
  '/admin/**',     // All admin pages
  '/api/admin/**', // All admin API routes
  '/settings',     // Exact match
]
```

Pattern syntax:
- `/**` suffix matches any sub-path (e.g. `/admin/**` matches `/admin`, `/admin/users`, `/admin/users/123`)
- Exact strings match exactly (e.g. `/settings` matches only `/settings`)
- If `serverAuthRoutes` is empty or not set, all routes require authentication

## Composable Behavior

All composables behave identically regardless of auth mode. Components do not need to know which mode is active.

| Composable         | Server Auth                              | Client Auth                    |
|--------------------|------------------------------------------|--------------------------------|
| `useUser()`        | Reads from `useState` (SSR payload)      | Reads from `localStorage`      |
| `useLogin()`       | Navigates to `/api/auth/login`           | Redirects to Auth0 via SPA SDK |
| `useLogout()`      | Navigates to `/api/auth/logout`          | Redirects to Auth0 via SPA SDK |
| `useLoginGate()`   | Works with either mode (calls `useUser()`) | Same                         |
| `useAuthHeaders()` | CSRF only (cookie sent automatically)    | `Authorization` header + CSRF  |

## Security Properties

- **XSS resistant**: JWT stored in HttpOnly cookie, inaccessible to JavaScript
- **CSRF protected**: State parameter with short-lived cookie validates the OAuth callback; nuxt-csurf protects proxy requests
- **PKCE**: Authorization Code flow uses S256 code challenge, preventing authorization code interception
- **Server-only secrets**: `client_secret` and `auth0PublicKey` are in private runtime config, never exposed to the browser

## Files

| File                                          | Purpose                                                              |
|-----------------------------------------------|----------------------------------------------------------------------|
| `src/module.ts`                               | Module config: registers plugins and server handlers based on `serverAuth` |
| `src/runtime/server/middleware/auth.ts`       | Global middleware: verifies JWT, populates `event.context.auth`      |
| `src/runtime/server/utils/auth.ts`            | Shared auth helpers: config, token verification, PKCE, cookies       |
| `src/runtime/server/api/auth/login.get.ts`    | Login route: initiates Auth0 redirect with PKCE                      |
| `src/runtime/server/api/auth/callback.get.ts` | Callback route: exchanges code for token, sets cookie                |
| `src/runtime/server/api/auth/logout.get.ts`   | Logout route: clears cookie, redirects to Auth0 logout               |
| `src/runtime/plugins/auth.server.ts`          | Server plugin: copies `event.context.auth` to `useState` for SSR    |
| `src/runtime/plugins/auth.client.ts`          | Client plugin: Auth0 SPA SDK flow (only when `serverAuth: false`)   |
| `src/runtime/lib/util/proxy.ts`               | API proxy: extracts JWT from header or cookie for upstream requests  |
