# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tlv2-ui is a **Nuxt 4 module** (not a standalone app) that provides UI components, composables, and utilities for Interline transit/GTFS applications. It is consumed by other Nuxt apps via `modules: ['tlv2-ui']` with config key `tlv2`.

## Commands

```bash
yarn dev              # Start dev server with playground app
yarn test             # Run all tests (vitest)
yarn test -- -t "test name"  # Run a single test by name
yarn test -- src/runtime/lib/pathways/graph.spec.ts  # Run a single test file
yarn lint             # ESLint check
yarn lint --fix       # ESLint auto-fix
yarn check            # lint --fix + typecheck + test (full CI check)
yarn test:types       # TypeScript type checking (vue-tsc)
yarn prepack          # Build the module for distribution
```

## Test Setup

Tests use **Vitest** with four project configurations (see `vitest.config.js`):
- **node** — `src/**/*.{test,spec}.ts` (excludes controls), runs in Node environment
- **controls** — `src/runtime/controls/**/*.{test,spec}.ts`, runs in jsdom environment
- **e2e** — `test/e2e/**/*.{test,spec}.ts`, uses setup file
- **browser** — `test/browser/**/*.{test,spec}.ts`, uses setup file

HTTP fixtures use **Polly.js** (`@pollyjs/core`) with recordings stored in `testdata/recordings/`. See `src/runtime/lib/testutil/` for the `setupPolly` helper.

## Architecture

### Module Entry Point

`src/module.ts` — Nuxt module definition. Registers components, composables, plugins, CSS, server handlers, and runtime config. Module options are defined as `ModuleOptions` interface here.

### Runtime Structure (`src/runtime/`)

- **controls/** — Generic UI components (prefix `t-`): button, input, modal, table, select, etc. Styled with Bulma CSS.
- **components/** — Transit-specific Vue components (prefix `tl-`): route icons, pathway maps, breadcrumbs, links.
- **apps/** — Full app sections (prefix `TlApps-`), each with pages and composables:
  - `stations/` — Station/pathway editor (GTFS station editing, level management, stop editing, GeoJSON export)
  - `transfers/` — Transfer analyst (scenario comparison, transfer scoring, platform maps)
  - `admin/` — Admin panel (tenants, groups, feeds, permissions)
- **composables/** — Vue composables auto-imported by Nuxt: auth, API endpoints, basemap layers, downloads, route resolution.
- **plugins/** — Nuxt plugins: Apollo GraphQL client, Auth0 client-side auth, Mixpanel analytics, API proxy.
- **lib/** — Pure TypeScript libraries (exported as subpath imports like `tlv2-ui/lib/pathways`):
  - `pathways/` — Graph algorithms for GTFS station pathways (A* routing, graph construction)
  - `geom/` — Geometry utilities (haversine distance, coordinate helpers)
  - `gtfs/` — GTFS route types and departure stats
  - `auth/` — Auth0 integration and user types
  - `config/` — Shared ESLint config and styling rules
  - `util/` — Filters, sanitization, tree utilities, time formatting
  - `testutil/` — Polly.js test fixture setup
  - `analytics/` — Analytics helpers

### Data Layer

- **GraphQL** via Apollo Client (`@vue/apollo-composable`) — primary data fetching
- **Server proxy** (`server/api/`, `src/runtime/plugins/proxy.ts`) — optional API proxy for development
- **Auth0** for authentication (`src/runtime/plugins/auth.client.ts`)

### Route Keys

`src/runtime/route-keys.ts` defines `TLV2_ROUTE_KEYS` — typed route name constants used by `useRouteResolver` for cross-app navigation. Consumer apps can override routes via module options.

### Playground

`playground/` is a minimal Nuxt app for local development that imports the module directly from `src/module.ts`.

## Code Style

- ESLint with `@nuxt/eslint-config/flat`, strict TypeScript
- 2-space indent, single quotes, no semicolons
- 1TBS brace style, space before function parens
- Vue templates: single-word component names allowed, up to 10 attributes per single line
- Package manager: **yarn 4** (Yarn Berry)
