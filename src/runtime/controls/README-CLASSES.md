# CSS Class Conventions

This document describes when and how to use Bulma classes versus our custom `t-` prefixed classes.

## Overview

We use a layered approach:
1. **Bulma base classes** - For structure and standard styling
2. **Our `t-` prefixed classes** - For component-specific customizations
3. **Bulma helper/utility classes** - For common utilities (no need to prefix)

---

## Style Block Convention

Use `<style lang="scss" scoped>` for component styles:

```vue
<style lang="scss" scoped>
/* Component styles here - use Bulma CSS custom properties */
</style>
```

**Why scoped?**
- Prevents styles from leaking to other components
- Allows using `is-*` modifier classes without conflicting with Bulma globals
- Makes component styles self-contained and predictable

**When to skip scoped:**
- Styling deeply nested child components that need parent styling
- Global theme overrides (should be rare and in dedicated files)

---

## When to Use Bulma Classes Alone

Use Bulma classes without any `t-` prefix when:

- Using **helper/utility classes** that don't need customization
- The element doesn't require any custom styling beyond Bulma defaults

### Bulma Helper Classes (use as-is)

These are utility classes provided by Bulma. Use them directly without creating `t-` versions:

```html
<!-- Visibility -->
is-hidden, is-invisible, is-sr-only

<!-- Interaction -->
is-clickable, is-unselectable

<!-- Layout -->
is-clearfix, is-pulled-left, is-pulled-right, is-overlay, is-clipped

<!-- Appearance -->
is-radiusless, is-shadowless, is-relative

<!-- Flexbox helpers -->
is-flex, is-inline-flex, is-flex-direction-row, is-justify-content-center, etc.

<!-- Spacing (margin/padding) -->
m-0, m-1, mt-2, mb-4, p-3, px-4, py-2, etc.

<!-- Typography -->
has-text-centered, has-text-left, has-text-weight-bold, is-size-4, etc.

<!-- Colors -->
has-text-primary, has-text-danger, has-background-light, etc.
```

### Example: Using Bulma helpers directly

```vue
<template>
  <div class="t-slider-tick" :class="{ 'is-clickable': clickable }">
    <!-- is-clickable is a Bulma helper, no need for t-is-clickable -->
  </div>
</template>
```

---

## When to Use Bulma + Our `t-` Classes

Add a `t-` prefixed class **on the root element** alongside Bulma classes when:

- We need **custom styling** beyond Bulma defaults
- We want to **override** specific Bulma styles
- The component has **component-specific behavior**

### Pattern: Root Element Gets `t-` Prefix

Only the **root/top-level element** needs the `t-` prefix. Nested child elements can use Bulma classes directly since they'll be styled under the scoped `t-` parent class.

```vue
<template>
  <!-- Root element: Both Bulma "card" AND "t-card" -->
  <div class="card t-card">
    <!-- Nested elements: Bulma classes only (no t- prefix needed) -->
    <header class="card-header" :class="{ 'is-clickable': collapsible }">
      <p class="card-header-title">{{ label }}</p>
      <button class="card-header-icon">
        <t-icon icon="chevron-down" class="t-collapse-icon" />
      </button>
    </header>
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Root t- class scopes everything */
.t-card {
  /* Nested Bulma classes can be styled directly - they're scoped by .t-card */
  .card-header.is-clickable {
    cursor: pointer;
    &:hover {
      background-color: var(--bulma-scheme-main-bis);
    }
  }

  .card-header-icon {
    border: none;
    background: transparent;
  }

  /* Our own custom classes still use t- prefix */
  .t-collapse-icon {
    transition: transform 0.3s ease;
  }
}
</style>
```

### Why Nested Elements Don't Need `t-` Prefix

- The styles are **scoped** to the component by Vue
- Nested selectors like `.t-card .card-header` won't leak globally
- The parent `t-` class provides the isolation we need
- Less verbose markup

### When to Add `t-` to Nested Elements

Add `t-` prefix to nested elements when:
- It's a **custom class we invented** (not from Bulma), e.g., `t-collapse-icon`, `t-sort-icon`
- The class name doesn't exist in Bulma at all

**Rule: All custom/invented class names MUST use the `t-` prefix.**

This ensures:
- Clear distinction between Bulma classes and our custom classes
- No future naming conflicts if Bulma adds a similar class
- Easy identification of custom styling in code reviews

```html
<!-- ✅ Correct: Custom class uses t- prefix -->
<span class="t-sort-icon">...</span>
<span class="t-collapse-icon">...</span>
<div class="t-collapsible-content">...</div>

<!-- ❌ Wrong: Custom class without t- prefix -->
<span class="sort-icon">...</span>
<span class="collapse-icon">...</span>
```

### Common Components Using This Pattern

| Bulma Class | Our Class | Purpose |
|-------------|-----------|---------|
| `button` | `t-button` | Custom loading states, icon alignment |
| `card` | `t-card` | Collapsible behavior |
| `checkbox` | `t-checkbox` | Custom checkbox appearance, variants |
| `dropdown` | `t-dropdown` | Custom menu width |
| `icon` | (no `t-icon` class; use Bulma `icon` only) | No customization needed |  
| `modal` | `t-modal` | Custom sizing |
| `pagination` | `t-pagination` | Custom cursor styles |
| `select` | `t-select` | Full-width behavior |
| `message` | `t-message` | Collapsible behavior |

---

## When to Use Scoped SCSS Without Extra Classes

Inside scoped styles targeting our `t-` class, we can use Bulma's modifier class names directly since they're scoped to our component.

### Example: Size/color variants without `t-` prefix

```vue
<template>
  <input class="t-slider" :class="{ 'is-primary': variant === 'primary' }">
</template>

<style lang="scss" scoped>
.t-slider {
  /* Base styles */

  /* These modifiers are scoped to .t-slider, no conflict with Bulma */
  &.is-primary {
    /* Custom primary color handling */
  }

  &.is-small {
    /* Custom small size */
  }
}
</style>
```

### Why This Works

- The styles are **scoped** to the component
- The `is-*` class is applied to our `t-slider` element, not a Bulma element
- No global override of Bulma's `.is-primary` class

### Use Explicit Variant Styles

When you have multiple color or size variants, write them out explicitly using Bulma CSS custom properties:

```scss
.t-slider {
  // Color variants
  &.is-primary {
    background: var(--bulma-primary);
    border-color: var(--bulma-primary);
  }

  &.is-link {
    background: var(--bulma-link);
    border-color: var(--bulma-link);
  }

  &.is-info {
    background: var(--bulma-info);
    border-color: var(--bulma-info);
  }

  &.is-success {
    background: var(--bulma-success);
    border-color: var(--bulma-success);
  }

  &.is-warning {
    background: var(--bulma-warning);
    border-color: var(--bulma-warning);
  }

  &.is-danger {
    background: var(--bulma-danger);
    border-color: var(--bulma-danger);
  }
}
```

### When a Variant Needs Special Handling

If one variant needs different styling (e.g., warning needs dark text for contrast), handle it separately:

```scss
.t-checkbox {
  // Most colors use white checkmark
  &.is-primary input:checked {
    background-color: var(--bulma-primary);
  }

  &.is-link input:checked {
    background-color: var(--bulma-link);
  }

  &.is-info input:checked {
    background-color: var(--bulma-info);
  }

  &.is-success input:checked {
    background-color: var(--bulma-success);
  }

  &.is-danger input:checked {
    background-color: var(--bulma-danger);
  }

  // Warning needs dark checkmark for contrast
  &.is-warning input:checked {
    background-color: var(--bulma-warning);
    &::after {
      border-color: rgba(0, 0, 0, 0.7);
    }
  }
}
```

### Size Variants

Sizes should use Bulma CSS custom properties where applicable:

```scss
.t-checkbox {
  &.is-small {
    font-size: var(--bulma-size-small);
    input { width: 0.875rem; height: 0.875rem; }
  }

  &.is-medium {
    font-size: var(--bulma-size-medium);
    input { width: 1.25rem; height: 1.25rem; }
  }

  &.is-large {
    font-size: var(--bulma-size-large);
    input { width: 1.5rem; height: 1.5rem; }
  }
}
```

---

## Decision Flowchart

```
Is it a Bulma helper/utility class? (is-clickable, has-text-*, m-*, etc.)
  └── YES → Use Bulma class directly, no t- prefix needed
  └── NO ↓

Does the element need custom styling?
  └── NO → Use Bulma class alone
  └── YES ↓

Add both: Bulma class + t- prefixed class
  - Bulma class: provides base structure/styling
  - t- class: target for our scoped customizations

Inside scoped styles for t- class:
  - Use is-* modifiers freely (they're scoped)
  - Use Bulma CSS custom properties (e.g., var(--bulma-primary))
```

---

## Summary

| Scenario | What to Do |
|----------|------------|
| Bulma helper classes | Use directly: `is-clickable`, `has-text-primary`, `mb-4` |
| Bulma structural classes with no customization | Use directly: `icon`, `media`, `level` |
| Bulma structural classes with customization | Add both: `modal t-modal`, `button t-button` |
| Modifier classes in scoped styles | Use `is-*` directly since they're scoped to `t-` class |
| Color/size variants | Use Bulma CSS custom properties: `var(--bulma-primary)`, etc. |
