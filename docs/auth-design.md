# Auth Design

## Overview

Two plugins handle all auth/CSRF injection globally — no per-callsite wiring needed.

| Plugin | Runs on | Does what |
|---|---|---|
| `csrf.client` | Browser | Wraps `$fetch` and `fetch` to add CSRF header to every request |
| `auth.server` | SSR | Wraps `$fetch` and `fetch` to add JWT + API key to every request |

Both plugins wrap `globalThis.$fetch` (ofetch) and `globalThis.fetch` (native), so all request mechanisms — `useFetch`, `$fetch`, and Apollo's `createUploadLink` — get headers injected automatically.

## Request Flows

### Browser → proxy → backend

1. Browser sends session cookie automatically (`credentials: 'same-origin'`)
2. CSRF header added globally by `csrf.client`
3. Request hits `/api/v2/**` on the same origin
4. `nuxt-csurf` validates the CSRF token
5. Proxy extracts JWT from session cookie via `auth0.getAccessToken()`
6. If logged in: forwards JWT + API key to backend
7. If anonymous: forwards API key only

### SSR → backend (direct)

1. `auth.server` plugin injects JWT + API key into both `$fetch` and `fetch`
2. Requests go directly to backend (via `proxyBase` URL), bypassing the proxy
4. If logged in: JWT from the original request's session
5. If anonymous: API key only

## Composables

- `useUser` — reads auth0-nuxt session state + enriched roles from GraphQL
- `useLogin` — navigates to `/auth/login`
- `useLogout` — navigates to `/auth/logout`

## User Enrichment

`auth/server/plugin.client` is a global route middleware that queries the GraphQL `me` endpoint to enrich the auth0-nuxt user with application-level roles and a GraphQL ID. Results are stored in `useState` and cached client-side for 10 minutes.

During SSR, roles are not yet available — only identity (name, email, sub) from the auth0-nuxt session is present. Role-gated UI renders after client-side hydration. A future improvement is to cache the `me` response in a server-side KV store so roles are available during SSR.

## CSRF

CSRF protection is provided by `nuxt-csurf` and applies to all requests, including anonymous ones. The CSRF token prevents other websites from using the proxy as an open relay — either with a logged-in user's session cookie (classic CSRF) or with the module's API key (anonymous abuse).

The `csrf.client` plugin wraps both `globalThis.$fetch` (ofetch) and `globalThis.fetch` (native) so that all client-side requests automatically include the CSRF header. No per-callsite injection is needed.

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
| `src/runtime/plugins/proxy.ts` | `/api/v2/**` proxy handler, extracts JWT from session |
| `src/runtime/lib/util/proxy.ts` | Proxy implementation, forwards to backend with auth headers |
| `src/runtime/auth/server/plugin.client.ts` | Route middleware that enriches user with roles from GraphQL |
| `src/runtime/auth/server/useUser.ts` | `useUser` composable (reads session + enriched roles) |
| `src/runtime/auth/server/useLogin.ts` | `useLogin` composable (redirects to `/auth/login`) |
| `src/runtime/auth/server/useLogout.ts` | `useLogout` composable (redirects to `/auth/logout`) |
| `src/runtime/auth/shared/types.ts` | `TlUser` interface |
