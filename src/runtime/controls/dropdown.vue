<template>
  <div
    ref="dropdownRef"
    class="dropdown"
    :class="dropdownClass"
  >
    <div
      class="dropdown-trigger"
      @click="toggle"
    >
      <slot name="trigger" :toggle="toggle">
        <button
          class="button"
          :class="{ [`is-${props.buttonVariant}`]: props.buttonVariant }"
          type="button"
          aria-haspopup="true"
          :aria-controls="`dropdown-menu-${uid}`"
        >
          <span v-if="iconLeft" class="icon is-small">
            <i :class="`mdi mdi-${iconLeft}`" aria-hidden="true" />
          </span>
          <span>{{ label }}</span>
          <span v-if="icon" class="icon is-small">
            <i :class="`mdi mdi-${icon}`" aria-hidden="true" />
          </span>
        </button>
      </slot>
    </div>
    <div
      :id="`dropdown-menu-${uid}`"
      class="dropdown-menu"
      role="menu"
      :style="menuStyle"
    >
      <div class="dropdown-content">
        <slot :close="close" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, provide } from 'vue'

/**
 * Dropdown component using Bulma dropdown structure.
 * Supports single and multiple selection with v-model.
 *
 * @component t-dropdown
 * @example
 * <t-dropdown v-model="selected" selectable>
 *   <template #trigger>
 *     <button class="button">Select item</button>
 *   </template>
 *   <t-dropdown-item value="1">Option 1</t-dropdown-item>
 *   <t-dropdown-item value="2">Option 2</t-dropdown-item>
 * </t-dropdown>
 */

interface Props {
  /**
   * Selected value(s) - use with v-model
   */
  modelValue?: any | any[]

  /**
   * Enable selection behavior (closes on item click)
   */
  selectable?: boolean

  /**
   * Allow multiple selections (value becomes array)
   */
  multiple?: boolean

  /**
   * Position of dropdown menu
   * @default 'bottom-left'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

  /**
   * Keep dropdown open after selection (only with selectable)
   */
  inline?: boolean

  /**
   * Custom width for dropdown menu (in pixels)
   */
  width?: number

  /**
   * ARIA role for accessibility
   * @default 'list'
   */
  ariaRole?: string

  /**
   * Label shown in default trigger button
   */
  label?: string

  /**
   * Icon shown in default trigger button (after label)
   * @default 'menu-down'
   */
  icon?: string

  /**
   * Icon shown before the label in default trigger button
   */
  iconLeft?: string

  /**
   * Button variant for default trigger
   */
  buttonVariant?: import('./types').DropdownTriggerVariant

  /**
   * Color variant inherited by dropdown items
   */
  variant?: import('./types').DropdownTriggerVariant

  /**
   * Open dropdown on hover instead of click
   */
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  selectable: false,
  multiple: false,
  position: 'bottom-left',
  inline: false,
  ariaRole: 'list',
  label: 'Select',
  icon: 'menu-down',
  iconLeft: undefined,
  buttonVariant: undefined,
  variant: undefined,
  hoverable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any]
  'select': [value: any]
  'open': []
  'close': []
}>()

const dropdownRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const uid = ref(`dropdown-${Math.random().toString(36).substr(2, 9)}`)

const dropdownClass = computed(() => ({
  'is-active': isActive.value,
  'is-hoverable': props.hoverable,
  [`is-${props.position}`]: props.position !== 'bottom-left'
}))

const menuStyle = computed(() => {
  if (props.width) {
    return { minWidth: `${props.width}px` }
  }
  return undefined
})

function toggle () {
  isActive.value = !isActive.value
  if (isActive.value) {
    emit('open')
  } else {
    emit('close')
  }
}

function open () {
  if (!isActive.value) {
    isActive.value = true
    emit('open')
  }
}

function close () {
  if (isActive.value) {
    isActive.value = false
    emit('close')
  }
}

function handleItemClick (value: any) {
  // Always emit select event for any item click
  emit('select', value)

  if (!props.selectable) {
    // Close dropdown even if not selectable (for action menus)
    if (!props.inline && !props.hoverable) {
      close()
    }
    return
  }

  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValues.indexOf(value)

    if (index >= 0) {
      currentValues.splice(index, 1)
    } else {
      currentValues.push(value)
    }

    emit('update:modelValue', currentValues)
    emit('change', currentValues)
  } else {
    emit('update:modelValue', value)
    emit('change', value)

    if (!props.inline) {
      close()
    }
  }
}

function handleClickOutside (event: MouseEvent) {
  if (isActive.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

function handleEscape (event: KeyboardEvent) {
  if (event.key === 'Escape' && isActive.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

// Provide context to child dropdown items
provide('dropdown', {
  handleItemClick,
  isMultiple: props.multiple,
  selectedValue: computed(() => props.modelValue),
  variant: computed(() => props.variant)
})

defineExpose({ open, close, toggle })
</script>

<style scoped>
/* Bulma provides all dropdown styling */
.dropdown-menu {
  min-width: 12rem;
}
</style>
