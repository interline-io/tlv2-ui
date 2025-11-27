<template>
  <div
    ref="dropdownRef"
    class="dropdown"
    :class="dropdownClass"
  >
    <div class="dropdown-trigger">
      <slot name="trigger" :toggle="toggle">
        <button
          class="button"
          type="button"
          aria-haspopup="true"
          :aria-controls="`dropdown-menu-${uid}`"
          @click="toggle"
        >
          <span>{{ triggerLabel }}</span>
          <span class="icon is-small">
            <i class="mdi mdi-menu-down" aria-hidden="true" />
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
  triggerLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  selectable: false,
  multiple: false,
  position: 'bottom-left',
  inline: false,
  ariaRole: 'list',
  triggerLabel: 'Select'
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any]
  'open': []
  'close': []
}>()

const dropdownRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const uid = ref(`dropdown-${Math.random().toString(36).substr(2, 9)}`)

const dropdownClass = computed(() => ({
  'is-active': isActive.value,
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
  if (!props.selectable) return

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
  selectedValue: computed(() => props.modelValue)
})

defineExpose({ open, close, toggle })
</script>

<style scoped>
.dropdown {
  display: inline-flex;
  position: relative;
  vertical-align: top;
}

.dropdown.is-active .dropdown-menu {
  display: block;
}

.dropdown-menu {
  display: none;
  left: 0;
  min-width: 12rem;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  z-index: 20;
}

.dropdown.is-top-left .dropdown-menu,
.dropdown.is-top-right .dropdown-menu {
  bottom: 100%;
  padding-bottom: 4px;
  padding-top: initial;
  top: auto;
}

.dropdown.is-bottom-right .dropdown-menu,
.dropdown.is-top-right .dropdown-menu {
  left: auto;
  right: 0;
}

.dropdown-content {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(10, 10, 10, 0.02);
  padding: 0.5rem 0;
}
</style>
