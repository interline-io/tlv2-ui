# tlv2-ui

A Nuxt 4 module providing UI components, controls, and composables for transit and GTFS-related applications.

## Overview

`tlv2-ui` is a comprehensive UI library built for [Interline](https://interline.io) transit applications. It includes:

- **Controls** - General-purpose, domain-agnostic UI components (buttons, inputs, modals, tables, etc.)
- **Components** - Transit/GTFS-specific components (route icons, pathway maps, etc.)
- **Composables** - Vue composables for authentication, API endpoints, basemap layers, and more
- **Utilities** - Geometry helpers, library functions, and test utilities

## Installation

```bash
yarn add tlv2-ui
```

## Usage

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['tlv2-ui'],
  tlv2: {
    // Module options
    bulma: '',
    useProxy: false,
    loginGate: false,
    // ... see ModuleOptions for all available options
  }
})
```

## Module Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bulma` | `string` | `''` | Bulma CSS configuration |
| `useProxy` | `boolean` | `false` | Enable API proxy |
| `proxyBase` | `string` | - | Proxy base URL |
| `apiBase` | `string` | - | API base URL |
| `loginGate` | `boolean` | `false` | Enable login gate |
| `requireLogin` | `boolean` | `false` | Require user login |
| `protomapsApikey` | `string` | - | Protomaps API key |
| `nearmapsApikey` | `string` | - | Nearmaps API key |
| `mixpanelApikey` | `string` | - | Mixpanel API key |
| `auth0ClientId` | `string` | - | Auth0 client ID |
| `auth0Domain` | `string` | - | Auth0 domain |
| `auth0Audience` | `string` | - | Auth0 audience |
| `auth0Scope` | `string` | - | Auth0 scope |
| `auth0RedirectUri` | `string` | - | Auth0 redirect URI |
| `auth0LogoutUri` | `string` | - | Auth0 logout URI |
| `safelinkUtmSource` | `string` | - | UTM source parameter for generated safelinks |
| `routes` | `Partial<Record<Tlv2RouteKey, string>>` | - | Custom route overrides for TLV2 routes |
| `transferAnalystReadOnlyFeedSelector` | `boolean` | `false` | Enable read-only mode for feed selector in Transfer Analyst |
| `transferAnalystGtfsRealtimeStopObservations` | `boolean` | `false` | Enable GTFS-realtime stop observations in Transfer Analyst |

## Exports

The module provides several subpath exports:

```typescript
// Main module
import { ... } from 'tlv2-ui'

// Configuration utilities
import { ... } from 'tlv2-ui/config'

// Library utilities
import { ... } from 'tlv2-ui/lib'

// Geometry utilities
import { ... } from 'tlv2-ui/geom'

// Test utilities
import { ... } from 'tlv2-ui/testutil'
```

## Controls

General-purpose UI controls (prefixed with `t-`):

- `t-button` - Button component
- `t-card` - Card container
- `t-checkbox` - Checkbox input
- `t-datepicker` - Date picker
- `t-dropdown` - Dropdown menu
- `t-field` - Form field wrapper
- `t-icon` - Icon component (MDI)
- `t-input` - Text input
- `t-loading` - Loading indicator
- `t-modal` - Modal dialog
- `t-msg` - Message display
- `t-notification` - Notification toast
- `t-pagination` - Pagination controls
- `t-radio` - Radio button
- `t-search-bar` - Search bar
- `t-select` - Select dropdown
- `t-slider` - Slider input
- `t-switch` - Toggle switch
- `t-table` - Data table
- `t-tabs` - Tab navigation
- `t-tag` - Tag/badge
- `t-taginput` - Tag input
- `t-textarea` - Textarea input
- `t-theme-toggle` - Light/dark theme toggle
- `t-tooltip` - Tooltip

## Composables

Available Vue composables:

- `useApiEndpoint` - API endpoint configuration
- `useAuthHeaders` - Authentication headers
- `useBasemapLayers` - MapLibre basemap layers
- `useDownload` - File download utilities
- `useLogin` / `useLogout` - Authentication actions
- `useLoginGate` - Login gate management
- `useMixpanel` - Mixpanel analytics
- `useRouteCategories` - Transit route categories
- `useRouteResolver` - Route resolution
- `useToastNotification` - Toast notifications
- `useUser` - Current user state

## Development

```bash
# Install dependencies
yarn install

# Start development server with playground
yarn dev

# Run linting
yarn lint

# Run tests
yarn test

# Type check
yarn test:types

# Build the module
yarn prepack
```

## Requirements

- Nuxt 4.2.0
- Vue 3.5.22
- Node.js (see `.nvmrc` if available)

## License

Dual licensed:
- **GPLv3** for open-source use
- **Commercial license** available from [Interline](mailto:info@interline.io)

See [LICENSE.md](LICENSE.md) for full details.

---

Copyright © Interline Technologies LLC
