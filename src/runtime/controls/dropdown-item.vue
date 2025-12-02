<template>
  <hr
    v-if="separator"
    class="t-dropdown-divider"
  >
  <a
    v-else
    :class="itemClass"
    :role="ariaRole"
    @click="handleClick"
  >
    <slot />
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

interface Props {
  /**
   * Value associated with this item (used for selection).
   * Type should match the parent t-dropdown's generic type.
   */
  value?: T

  /**
   * Disable this item (cannot be selected)
   */
  disabled?: boolean

  /**
   * Mark this item as active/selected
   */
  active?: boolean

  /**
   * Render as a separator (divider)
   */
  separator?: boolean

  /**
   * ARIA role for accessibility
   * @default 'listitem'
   */
  ariaRole?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  disabled: false,
  active: false,
  separator: false,
  ariaRole: 'listitem'
})

interface DropdownContext<T> {
  handleItemClick: (value: T) => void
  isMultiple: boolean
  selectedValue: { value: T | T[] | undefined }
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
  't-dropdown-item': true,
  'is-active': isSelected.value,
  'is-disabled': props.disabled
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
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-dropdown-item {
  color: $text;
  display: block;
  font-size: $size-small;
  line-height: 1.5;
  padding: 0.375rem 1rem;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: none;

  &:hover:not(.is-disabled) {
    background-color: lighten($link, 20%);
    color: $white;
  }

  &.is-active {
    background-color: $link;
    color: $white;
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.t-dropdown-divider {
  background-color: $background;
  border: none;
  display: block;
  height: 1px;
  margin: 0.5rem 0;
}
</style>
