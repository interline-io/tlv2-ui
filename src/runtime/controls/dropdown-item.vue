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
}>(), {
  value: undefined,
  label: undefined,
  disabled: false,
  active: false,
  separator: false,
  ariaRole: 'listitem',
  variant: undefined
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
</style>
