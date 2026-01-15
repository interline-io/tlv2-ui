<template>
  <hr
    v-if="separator"
    class="dropdown-divider"
  >
  <a
    v-else
    :class="itemClass"
    :aria-disabled="props.disabled"
    :role="props.ariaRole"
    @click.stop="handleClick"
  >
    <slot>{{ label }}</slot>
  </a>
</template>

<script setup lang="ts" generic="T = any">
import { inject, computed } from 'vue'

/**
 * Dropdown item component - must be used within t-dropdown.
 * Represents a single selectable option in a dropdown menu.
 * Type-safe with generic support matching parent dropdown's type.
 *
 * @component t-dropdown-item
 * @example
 * <t-dropdown-item value="option1">
 *   Option 1
 * </t-dropdown-item>
 */

const props = withDefaults(defineProps<{
  /** Value associated with this item (used for selection). Type should match the parent t-dropdown's generic type. */
  value?: T
  /** Label text (alternative to using default slot). */
  label?: string
  /** Disable this item (cannot be selected) */
  disabled?: boolean
  /** Mark this item as active/selected */
  active?: boolean
  /** Render as a separator (divider) */
  separator?: boolean
  /** ARIA role for accessibility @default 'listitem' */
  ariaRole?: string
  /** Color variant for this item (overrides parent dropdown variant) */
  variant?: import('./types').DropdownTriggerVariant
  /** Render as a nested/indented child item with tree connector styling */
  nested?: boolean
}>(), {
  value: undefined,
  label: undefined,
  disabled: false,
  active: false,
  separator: false,
  ariaRole: 'listitem',
  variant: undefined,
  nested: false
})

interface DropdownContext<T> {
  handleItemClick: (value: T) => void
  isMultiple: boolean
  selectedValue: { value: T | T[] | undefined }
  variant?: { value: import('./types').DropdownTriggerVariant | undefined }
}

const dropdown = inject<DropdownContext<T> | null>('dropdown', null)

const isSelected = computed(() => {
  if (!dropdown) return props.active

  const selectedValue = dropdown.selectedValue?.value

  if (dropdown.isMultiple) {
    return Array.isArray(selectedValue) && props.value !== undefined && selectedValue.includes(props.value)
  }

  return selectedValue === props.value
})

const itemClass = computed(() => ({
  'dropdown-item': true,
  'is-active': isSelected.value,
  'is-disabled': props.disabled,
  't-dropdown-item-nested': props.nested,
}))

function handleClick (event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  if (dropdown && props.value !== undefined) {
    dropdown.handleItemClick(props.value)
  }
}
</script>

<style lang="scss" scoped>
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Tree-like hierarchy for nested items */
.t-dropdown-item-nested {
  padding-left: 1.5rem;
  position: relative;
}

.t-dropdown-item-nested::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #dbdbdb;
}

/* Adjust vertical line for first/last nested items when they're the first/last child */
.t-dropdown-item-nested:first-child::before {
  top: 50%;
}

.t-dropdown-item-nested:last-child::before {
  bottom: 50%;
}

/* If nested items are not first/last child (e.g., header item before them),
   the default top: 0 and bottom: 0 still works fine for the connector */

.t-dropdown-item-nested::after {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 50%;
  width: 0.5rem;
  height: 2px;
  background-color: #dbdbdb;
  transform: translateY(-50%);
}
</style>
