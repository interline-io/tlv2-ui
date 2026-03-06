# Server-Side Authentication

tlv2-ui uses server-side authentication via Auth0. JWTs are stored in HttpOnly cookies, verified server-side with `jose`, and forwarded to upstream APIs. The Auth0 SPA SDK is not used.

## Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['tlv2-ui'],
  tlv2: {
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

### Environment Variables (server-only, via runtimeConfig)

```
NUXT_TLV2_AUTH0_CLIENT_SECRET=...   # Required: Auth0 client secret for code exchange
NUXT_TLV2_AUTH0_PUBLIC_KEY=...      # Optional: PEM public key for local JWT verification
NUXT_TLV2_GRAPHQL_APIKEY=...       # API key for unauthenticated upstream requests
```

If `auth0PublicKey` is not set, JWT verification uses JWKS (fetched once from Auth0's `/.well-known/jwks.json` endpoint and cached).

## Auth Flow

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

### 3. Authenticated Page Load (SSR)

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
  |                            |-- SSR: Apollo query --->|
  |                            |   Authorization: Bearer |
  |                            |   <user's jwt>          |
  |                            |                        |
  |                            |<-- GraphQL response ----|
  |                            |                        |
  |                            |-- auth.server.ts plugin |
  |                            |   copies auth to        |
  |                            |   useState for client   |
  |                            |                        |
  |<-- HTML (SSR rendered) ----|                        |
  |   (useState hydrated       |                        |
  |    in payload)             |                        |
```

During SSR, `useAuthHeaders()` extracts the user's JWT from the request cookie and forwards it as `Authorization: Bearer <jwt>` to the upstream API. This ensures SSR-rendered pages reflect the user's permissions and data. If no JWT is present, it falls back to the configured `graphqlApikey` for unauthenticated access.

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

On the client, the browser sends the HttpOnly cookie automatically with every request to the proxy (`/api/v2/**`). The proxy extracts the JWT from the cookie and forwards it as an `Authorization: Bearer` header to the upstream API.

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

When no JWT is available, the proxy sends the server-configured `graphqlApikey` instead. JWT and apikey are mutually exclusive: if a JWT is found, no apikey is sent.

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

## Upstream Auth Precedence

Both the proxy (`/api/v2/**`) and SSR (`useAuthHeaders`) use the same precedence for upstream credentials:

1. **User's JWT** from the `tlv2_auth_token` cookie (forwarded as `Authorization: Bearer <jwt>`)
2. **apikey** fallback for unauthenticated requests (server-configured `graphqlApikey`)

The proxy also accepts an `Authorization` header directly from the request, which takes priority over the cookie. This supports programmatic API clients that send their own Bearer tokens.

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

## Composables

| Composable         | Behavior                                                              |
|--------------------|-----------------------------------------------------------------------|
| `useUser()`        | Returns user from `useState` (populated via SSR payload)              |
| `useLogin()`       | Navigates to `/api/auth/login?returnTo=...`                           |
| `useLogout()`      | Navigates to `/api/auth/logout`                                       |
| `useLoginGate()`   | Returns `true` if login gate blocks access (calls `useUser()`)        |
| `useAuthHeaders()` | Server: JWT or apikey for upstream. Client: CSRF token for proxy      |

## Migration from Auth0 SPA SDK

A client-side migration plugin (`auth.migrate.client.ts`) runs on page load. It detects Auth0 SPA SDK tokens in localStorage, sends them to `POST /api/auth/migrate` for verification and cookie-setting, then clears the localStorage entries. This allows existing logged-in users to transition without being forced to re-login.

The migration endpoint verifies the token before accepting it and skips if the user already has a valid auth cookie. Once all users have migrated, the migration plugin can be removed.

## Security Properties

- **XSS resistant**: JWT stored in HttpOnly cookie, inaccessible to JavaScript
- **CSRF protected**: State parameter with short-lived cookie validates the OAuth callback; nuxt-csurf protects proxy requests
- **PKCE**: Authorization Code flow uses S256 code challenge, preventing authorization code interception
- **Open redirect prevention**: `returnTo` parameter is validated to be a relative path before use in redirects
- **Server-only secrets**: `client_secret` and `auth0PublicKey` are in private runtime config, never exposed to the browser

## Files

| File                                          | Purpose                                                              |
|-----------------------------------------------|----------------------------------------------------------------------|
| `src/module.ts`                               | Module config: registers plugins and server handlers                 |
| `src/runtime/server/middleware/auth.ts`       | Global middleware: verifies JWT, populates `event.context.auth`      |
| `src/runtime/server/utils/auth.ts`            | Shared auth helpers: config, token verification, PKCE, cookies       |
| `src/runtime/server/api/auth/login.get.ts`    | Login route: initiates Auth0 redirect with PKCE                      |
| `src/runtime/server/api/auth/callback.get.ts` | Callback route: exchanges code for token, sets cookie                |
| `src/runtime/server/api/auth/logout.get.ts`   | Logout route: clears cookie, redirects to Auth0 logout               |
| `src/runtime/server/api/auth/migrate.post.ts` | Migration route: accepts localStorage JWT, sets as cookie            |
| `src/runtime/plugins/auth.server.ts`          | Server plugin: copies `event.context.auth` to `useState` for SSR    |
| `src/runtime/plugins/auth.migrate.client.ts`  | Client plugin: migrates Auth0 SPA SDK tokens from localStorage       |
| `src/runtime/lib/util/proxy.ts`               | API proxy: extracts JWT from cookie for upstream requests            |
