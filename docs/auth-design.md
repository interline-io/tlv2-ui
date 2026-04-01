# Auth Design

## Overview

Two plugins handle all auth/CSRF injection globally — no per-callsite wiring needed.

| Plugin | Runs on | Does what |
|---|---|---|
| `csrf.client` | Browser | Wraps `$fetch` and `fetch` to add CSRF header to same-origin requests |
| `auth.server` | SSR | Wraps `$fetch` and `fetch` to add JWT + API key to backend requests |

Both plugins wrap `globalThis.$fetch` (ofetch) and `globalThis.fetch` (native), so all request mechanisms — `useFetch`, `$fetch`, and Apollo's `createUploadLink` — get headers injected automatically.

## Request Flows

### Browser → proxy → backend

1. Browser sends session cookie automatically (`credentials: 'same-origin'`)
2. CSRF header added globally by `csrf.client`
3. Request hits `/api/proxy/{backend}/...` on the same origin (e.g., `/api/proxy/default/query`)
4. `nuxt-csurf` validates the CSRF token
5. Proxy extracts backend name from path, looks up `proxyBase` config
6. Proxy extracts JWT from session cookie via `useAuth0Session(event)`
7. If logged in: forwards JWT + API key to backend
8. If anonymous: forwards API key only

### SSR → backend (direct)

1. `auth.server` plugin injects JWT + API key into both `$fetch` and `fetch`
2. Requests go directly to backend (via `proxyBase` URL), bypassing the proxy
3. If logged in: JWT from the original request's session
4. If anonymous: API key only

## Composables

- `useUser` — reads auth0-nuxt session state + enriched roles from GraphQL
- `useLogin` — navigates to `/auth/login`
- `useLogout` — navigates to `/auth/logout`

## User Enrichment

The `/api/auth/session` endpoint returns the auth0-nuxt session claims enriched with roles and identity from the GraphQL `me` endpoint (if a backend is configured). This is a single server-side request that combines auth0 identity with application-level data.

`auth/plugin.client` is a global route middleware that:
1. Checks if `useState('auth0_user')` is populated (it will be during SSR via auth0-nuxt's server middleware)
2. If not (e.g., `ssr: false`), fetches `/api/auth/session` to populate it
3. Reads `tlv2_roles` and `tlv2_id` from the session response and stores them in `useState`
4. Caches for 10 minutes before re-checking

During SSR, roles are not yet available — only identity (name, email, sub) from the auth0-nuxt session is present. Role-gated UI renders after client-side hydration. A future improvement is to cache the `me` response in a server-side KV store so roles are available during SSR.

## CSRF

CSRF protection is provided by `nuxt-csurf` and applies to all requests, including anonymous ones. The CSRF token prevents other websites from using the proxy as an open relay — either with a logged-in user's session cookie (classic CSRF) or with the module's API key (anonymous abuse).

The `csrf.client` plugin wraps both `globalThis.$fetch` (ofetch) and `globalThis.fetch` (native) so that same-origin client-side requests automatically include the CSRF header. Cross-origin requests (e.g., map tiles) are excluded to avoid triggering CORS preflights. No per-callsite injection is needed.

## Anonymous Access

Anonymous users (no auth0 session) can access public data through the proxy. The proxy forwards these requests with the API key only (no JWT). The backend decides what data to serve based on the presence or absence of a JWT.

## Auth0 Integration

Authentication is handled entirely by `@auth0/auth0-nuxt`, which manages server-side sessions using HTTP-only encrypted cookies. The user's JWT never touches client-side JavaScript. Login and logout are server-side routes (`/auth/login`, `/auth/logout`) provided by auth0-nuxt.

## Key Files

| File | Purpose |
|---|---|
| `src/module.ts` | Installs `nuxt-csurf` and `@auth0/auth0-nuxt`, registers plugins |
| `src/runtime/plugins/csrf.client.ts` | Global CSRF header injection (browser) |
| `src/runtime/plugins/auth.server.ts` | Global JWT + API key injection (SSR) |
| `src/runtime/plugins/apollo.ts` | Apollo client setup (no auth awareness — handled by plugins) |
| `src/runtime/plugins/proxy.ts` | `/api/proxy/{backend}/**` handler, routes to configured proxyBase |
| `src/runtime/lib/util/proxy.ts` | Proxy implementation, forwards to backend with auth headers |
| `src/runtime/server/api/auth/session.get.ts` | Session endpoint, returns auth0 claims + enriched roles |
| `src/runtime/auth/plugin.client.ts` | Route middleware that populates user state from session endpoint |
| `src/runtime/auth/useUser.ts` | `useUser` composable (reads session + enriched roles) |
| `src/runtime/auth/useLogin.ts` | `useLogin` composable (redirects to `/auth/login`) |
| `src/runtime/auth/useLogout.ts` | `useLogout` composable (redirects to `/auth/logout`) |
| `src/runtime/auth/types.ts` | `TlUser` interface |
| `src/runtime/server/useSession.ts` | `useAuth0Session` — single entry point for all server-side auth0 calls |

## Migration Guide for Existing Consumers

### Auth0 Configuration

Consumer apps must switch from Auth0 SPA application credentials to a **Regular Web Application** in the Auth0 console.

1. Create or reconfigure an Auth0 application as "Regular Web Application"
2. Set Allowed Callback URLs to `https://<your-domain>/auth/callback`
3. Set Allowed Logout URLs to `https://<your-domain>`
4. Ensure the Auth0 API has "Allow Offline Access" enabled (for refresh tokens)
5. If using a custom Auth0 domain (e.g., `auth.example.com`), use that as the domain — not the raw `*.auth0.com` tenant domain — so the JWT `iss` claim matches what the backend expects

### Environment Variables

Replace the old SPA-style Auth0 config with server-side env vars:

```
# Remove these (no longer used)
# NUXT_PUBLIC_TLV2_AUTH0_CLIENT_ID
# NUXT_PUBLIC_TLV2_AUTH0_DOMAIN
# NUXT_PUBLIC_TLV2_AUTH0_AUDIENCE
# NUXT_PUBLIC_TLV2_AUTH0_SCOPE
# NUXT_PUBLIC_TLV2_AUTH0_REDIRECT_URI
# NUXT_PUBLIC_TLV2_AUTH0_LOGOUT_URI

# Add these (server-side only, never exposed to client)
NUXT_AUTH0_DOMAIN=auth.example.com
NUXT_AUTH0_CLIENT_ID=...
NUXT_AUTH0_CLIENT_SECRET=...
NUXT_AUTH0_SESSION_SECRET=<random 32+ character string>
NUXT_AUTH0_APP_BASE_URL=https://your-app.example.com
NUXT_AUTH0_AUDIENCE=https://api.transit.land
```

### Module Options

Remove these options from your `nuxt.config.ts` module config:

- `authMode` — no longer exists, server mode is the only mode
- `auth0ClientId`, `auth0Domain`, `auth0Audience`, `auth0Scope`, `auth0RedirectUri`, `auth0LogoutUri` — replaced by `NUXT_AUTH0_*` env vars
- `apiBase` — no longer used, client routes through `/api/proxy/{backend}` proxy
- `useProxy` — removed, proxy is always active

### Code Changes

- **Remove `useAuthHeaders()` calls.** CSRF and auth headers are injected globally. Delete any manual header injection in `onRequest` callbacks or fetch options.
- **`useUser()`, `useLogin()`, `useLogout()`** — API is unchanged, no code changes needed.
- **`clearUser()`** — removed. Logout navigates to `/auth/logout` which clears the session server-side.
- **Direct imports from `tlv2-ui/lib/auth`** — `useUser` and `TlUser` are still exported. `clearUser` and the `User` class are removed.

### User Impact

All existing user sessions will be invalidated on deployment. Users will need to log in again — the old SPA tokens (stored in browser memory/localStorage) are not compatible with the new server-side session cookies. Users who authenticated via Google or other social providers can log in again with one click. Users with email/password accounts can use Auth0's "Forgot Password" flow if needed.

## Proxy Routing

The proxy routes client-side requests to backend services based on the URL path:

```
/api/proxy/{backend}/...  →  proxyBase.{backend} + /...
```

For example, with this config:
```
proxyBase.default = https://api.transit.land/api/v2
proxyBase.stationEditor = https://station-api.example.com
```

- `/api/proxy/default/query` → `https://api.transit.land/api/v2/query`
- `/api/proxy/stationEditor/query` → `https://station-api.example.com/query`

`useApiEndpoint(path, clientName)` generates the correct URL for each context:
- Server-side (SSR): returns the direct `proxyBase` URL
- Client-side: returns `/api/proxy/{clientName}` to route through the proxy

If a backend name is not found in the config, the proxy responds with a 404.

## Future Work

- **Server-side role caching.** Cache the GraphQL `me` response in a KV store so roles are available during SSR without a round-trip on every request.
