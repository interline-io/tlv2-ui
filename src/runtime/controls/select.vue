<template>
  <div class="control" :class="controlClasses">
    <div
      class="select"
      :class="selectClasses"
    >
      <select
        ref="selectRef"
        :value="modelValue"
        :disabled="disabled || readonly"
        v-bind="$attrs"
        @change="handleChange"
      >
        <slot />
      </select>
    </div>
    <span v-if="icon" class="icon is-left">
      <i :class="`mdi mdi-${icon}`" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import type { SelectVariant, SelectSize } from './types'

/**
 * Select dropdown component with Bulma styling.
 * Wraps a native select element with v-model support.
 *
 * @component t-select
 * @example
 * <t-select v-model="selectedValue">
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </t-select>
 */

interface Props {
  /**
   * The selected value (v-model).
   * For multiple select, use an array.
   */
  modelValue?: string | number | boolean | null | (string | number)[]

  /**
   * Select size variant.
   * @default undefined (normal size)
   */
  size?: SelectSize

  /**
   * Select color variant.
   */
  variant?: SelectVariant

  /**
   * Disable the select.
   * @default false
   */
  disabled?: boolean

  /**
   * Make the select full width.
   * @default false
   */
  fullwidth?: boolean

  /**
   * Round the select corners.
   * @default false
   */
  rounded?: boolean

  /**
   * Show loading state.
   * @default false
   */
  loading?: boolean

  /**
   * Make the select readonly (not editable).
   * @default false
   */
  readonly?: boolean

  /**
   * MDI icon name for left icon (without mdi- prefix).
   * @example 'magnify', 'account', 'calendar'
   */
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  size: undefined,
  variant: undefined,
  disabled: false,
  fullwidth: false,
  rounded: false,
  loading: false,
  readonly: false,
  icon: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean | null | (string | number)[]]
}>()

const selectRef = ref<HTMLSelectElement | null>(null)

const controlClasses = computed(() => {
  const classes: string[] = []

  if (props.icon) {
    classes.push('has-icons-left')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  if (props.fullwidth) {
    classes.push('is-expanded')
  }

  return classes
})

// Sync selected options for multiple select
function syncMultipleSelect () {
  if (!selectRef.value || !Array.isArray(props.modelValue)) return

  const options = selectRef.value.options
  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    if (option) {
      option.selected = props.modelValue.includes(option.value)
    }
  }
}

watch(() => props.modelValue, () => {
  if (Array.isArray(props.modelValue)) {
    nextTick(() => {
      syncMultipleSelect()
    })
  }
}, { deep: true })

onMounted(() => {
  if (Array.isArray(props.modelValue)) {
    syncMultipleSelect()
  }
})

const selectClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.fullwidth) {
    classes.push('is-fullwidth')
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  if (props.loading && !props.icon) {
    classes.push('is-loading')
  }

  if (Array.isArray(props.modelValue)) {
    classes.push('is-multiple')
  }

  return classes
})

function handleChange (event: Event) {
  const target = event.target as HTMLSelectElement

  // Handle multiple select
  if (target.multiple) {
    const selectedValues = Array.from(target.selectedOptions).map(option => option.value)
    emit('update:modelValue', selectedValues)
    return
  }

  // Handle single select
  let value: string | number | boolean | null = target.value

  // Try to preserve the type of the original modelValue
  if (typeof props.modelValue === 'number') {
    value = Number.parseFloat(target.value)
  } else if (typeof props.modelValue === 'boolean') {
    value = target.value === 'true'
  } else if (target.value === 'null') {
    value = null
  }

  emit('update:modelValue', value)
}
</script>

<style scoped>
/* Inherits Bulma select styles from global stylesheet */

/* Make select expand to fill container by default, like input */
.select {
  width: 100%;
}

.select select {
  width: 100%;
}

/* Ensure multiple select displays properly with specified size */
.select.is-multiple select {
  height: auto;
}
</style>
