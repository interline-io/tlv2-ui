# t-* Controls

This directory contains **general-purpose UI controls** that are **domain-agnostic** and have **no application-specific dependencies**.

## Purpose

Controls in this directory should be:

- ✅ **Pure presentational components** - UI-only logic with no business rules
- ✅ **Reusable across any application** - No transit/GTFS/domain-specific knowledge
- ✅ **Self-contained** - No dependencies on code outside this directory (except Vue, Bulma, MDI)
- ✅ **Simple, stable APIs** - TypeScript interfaces with clear prop contracts

## Examples of appropriate controls:
- Form inputs (button, checkbox, input, select)
- Layout components (field, card, modal)
- Feedback components (notification, loading, tooltip)
- Generic patterns (tabs, tree structures without domain logic)

Key principle: If the component could be copied to a completely different project and work without modification, it belongs here.

---

# Testing Strategy

Comprehensive testing and documentation for all 25 t-* components in the TLv2-UI library.

## Overview

We employ a multi-layered testing approach:

1. **Interactive Demo Pages** - Live playground for manual testing and documentation
2. **Unit Tests** - Automated tests for component logic and rendering
3. **Test Utilities** - Reusable helpers for consistent testing patterns

## Demo Pages (Playground)

The `playground/` directory contains a full Nuxt application showcasing all components with interactive examples.

### Running the Playground

```bash
# Start development server
yarn dev

# Build playground
yarn dev:build
```

Visit `http://localhost:3000` to see:
- **Index Page** - Navigation to all component demos
- **Individual Component Pages** - Detailed examples with code
- **All Components Page** - Quick overview of every component

### Demo Page Structure

```
playground/
├── nuxt.config.ts          # Playground configuration
├── app.vue                 # Root component
└── pages/
    ├── index.vue           # Landing page
    └── controls/
        ├── button.vue      # Button demos
        ├── input.vue       # Input demos
        ├── table.vue       # Table demos
        ├── modal.vue       # Modal demos
        ├── slider.vue      # Slider demos
        ├── all.vue         # All components
        └── ...             # More demos
```

### Adding New Demo Pages

1. Create a new file in `playground/pages/controls/<component>.vue`
2. Follow the existing demo pattern:
   - Back to index navigation
   - Component title and description
   - Sections for each major feature/variant
   - Live examples with code
   - Interactive elements showing state changes

Example template:

```vue
<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">Component Name</h1>
      <p class="subtitle">Component description</p>

      <div class="content">
        <h2 class="title is-3">Feature Section</h2>
        <div class="box">
          <!-- Examples here -->
        </div>
      </div>
    </section>
  </div>
</template>
```

3. Add a link to the new demo in `playground/pages/index.vue`

## Unit Tests

Automated tests using Vitest and @vue/test-utils.

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run type checking
yarn test:types
```

### Test File Convention

- Location: `src/runtime/controls/<component>.test.ts`
- Name: `<component>.test.ts` (matches component file name)
- Structure: Describe blocks for each major feature

### Example Test Structure

```typescript
import { describe, it, expect } from 'vitest'
import TButton from '../controls/button.vue'
import { mountComponent, testBulmaClasses } from '../testutil/component-helpers'

describe('TButton', () => {
  it('renders default button', () => {
    const wrapper = mountComponent(TButton, {
      slots: { default: 'Click me' }
    })
    
    expect(wrapper.html()).toContain('Click me')
    testBulmaClasses(wrapper, ['button'])
  })

  it('renders all variants', () => {
    // Test variant props
  })

  it('emits click event', async () => {
    // Test event handling
  })
})
```

## Test Utilities

Reusable testing helpers in `src/runtime/testutil/component-helpers.ts`.

### Available Utilities

#### `mountComponent(component, options)`
Mount a component with common test configuration.

```typescript
const wrapper = mountComponent(TButton, {
  props: { variant: 'primary' },
  slots: { default: 'Click me' }
})
```

#### `variantProps()` and `sizeProps()`
Generate arrays of standard prop values for iteration.

```typescript
variantProps().forEach(variant => {
  const wrapper = mountComponent(TButton, { props: { variant } })
  // Assert variant classes
})
```

#### `testVModel(wrapper, selector, value)`
Test v-model binding on input components.

```typescript
await testVModel(wrapper, 'input', 'new value')
// Verifies update:modelValue event was emitted
```

#### `testBulmaClasses(wrapper, classes)`
Verify Bulma CSS classes are applied.

```typescript
testBulmaClasses(wrapper, ['button', 'is-primary', 'is-large'])
```

#### `testDisabledState(wrapper, selector)`
Test disabled state on interactive elements.

```typescript
testDisabledState(wrapper, 'button')
```

#### `testSlotContent(wrapper, content)`
Verify slot content is rendered.

```typescript
testSlotContent(wrapper, 'Expected text')
```

#### `createMockTableData(count)`
Generate mock data for table testing.

```typescript
const data = createMockTableData(5)
// Returns array of 5 objects with id, name, value, status, nested
```

## Testing Checklist for New Components

When creating a new t-* component, ensure:

### 1. Demo Page
- [ ] Create `playground/pages/controls/<component>.vue`
- [ ] Show all props and variants
- [ ] Include interactive examples
- [ ] Demonstrate real-world usage
- [ ] Add link in `playground/pages/index.vue`

### 2. Unit Tests
- [ ] Create `src/runtime/controls/<component>.test.ts`
- [ ] Test default rendering
- [ ] Test all prop variants
- [ ] Test all size variants
- [ ] Test disabled/readonly states
- [ ] Test v-model binding (if applicable)
- [ ] Test event emissions
- [ ] Test slot rendering
- [ ] Test edge cases (null, undefined, empty)

### 3. Documentation
- [ ] Add JSDoc comments to component
- [ ] Document all props with types
- [ ] Document all events
- [ ] Document all slots
- [ ] Add usage examples in comments

## Component Test Coverage

### ✅ Fully Tested
- `button.vue` - All variants, sizes, states, events
- `input.vue` - All types, variants, sizes, states, v-model

### 🚧 Needs Tests
- checkbox, radio, switch, select, textarea, field, slider, slider-tick
- tabs, tab-item, dropdown, dropdown-item, modal
- table, table-column, tag, card, notification, msg
- icon, loading, tooltip, search-bar

## Demo Page Coverage

### ✅ Complete Demos (21/25 components)

**Form Controls:**
- `button.vue` - All variants, sizes, states, with icons, grouped
- `checkbox.vue` - Variants, sizes, states, array binding, with descriptions
- `radio.vue` - Variants, sizes, states, payment/shipping examples
- `switch.vue` - Variants, sizes, states, settings panel, feature toggles
- `input.vue` - All types, variants, sizes, states, with icons
- `select.vue` - Basic, multiple, variants, sizes, states, with filters
- `textarea.vue` - Variants, sizes, rows, maxlength, fixed size, forms
- `field.vue` - Labels, validation, horizontal, grouped, registration form
- `slider.vue` - Basic, ticks, sizes, disabled, tooltip, color mixer

**Layout & Navigation:**
- `tabs.vue` - Basic, boxed, toggle, with icons, sizes, alignment, settings panel
- `dropdown.vue` - Basic, hoverable, positions, with icons, notifications, language selector
- `modal.vue` - Sizes, fullscreen, forms, footer, toast integration
- `card.vue` - Basic, header, footer, with images, profiles, statistics

**Data Display:**
- `table.vue` - Sorting, variants, nested fields, empty state, full width
- `tag.vue` - Variants, sizes, rounded, deletable, combinations, status indicators
- `notification.vue` - Variants, closable, with icons, rich content, actions
- `msg.vue` - Variants, with title, closable, rich content, validation messages

**Utilities:**
- `icon.vue` - Sizes, colors, common icons, in buttons, navigation, status
- `loading.vue` - Basic, inline, sizes, overlay, in buttons, full page, cards, tables
- `tooltip.vue` - Positions, variants, multiline, always visible, in forms, status
- `search-bar.vue` - Basic, sizes, rounded, loading, clearable, with filters, suggestions

### 🚧 Supporting Components (not standalone demos)
- `slider-tick.vue` - Demonstrated within slider.vue
- `tab-item.vue` - Demonstrated within tabs.vue
- `dropdown-item.vue` - Demonstrated within dropdown.vue
- `table-column.vue` - Demonstrated within table.vue

## Best Practices

### For Demo Pages
1. **Show, don't tell** - Interactive examples over text descriptions
2. **Group by feature** - Variants together, sizes together, etc.
3. **Include edge cases** - Empty states, long text, many items
4. **Real-world examples** - Forms, tables with real data, color pickers
5. **State visualization** - Show current values, click counts, etc.

### For Unit Tests
1. **Test behavior, not implementation** - Test what users see/do
2. **Use test utilities** - Don't repeat common patterns
3. **Test edge cases** - null, undefined, empty, very long
4. **Keep tests focused** - One assertion per test when possible

## Related Files

- `src/runtime/testutil/index.ts` - Test utility exports
- `src/runtime/testutil/component-helpers.ts` - Main test utilities
- `vitest.config.js` - Test configuration
- `package.json` - Test scripts

