<template>
  <div class="t-checkbox-group" :class="groupClasses">
    <!-- Select All / Select None buttons -->
    <div v-if="!hideSelectAll" class="t-checkbox-group-header">
      <div class="buttons has-addons are-small">
        <button
          type="button"
          class="button"
          :class="{ 'is-primary is-selected': selectAllState === 'all' }"
          :disabled="disabled || options.length === 0"
          @click="handleSelectAll"
        >
          <slot name="select-all-label">
            {{ selectAllLabel }}
          </slot>
        </button>
        <button
          type="button"
          class="button"
          :class="{ 'is-primary is-selected': selectAllState === 'none' }"
          :disabled="disabled || options.length === 0"
          @click="handleSelectNone"
        >
          <slot name="select-none-label">
            {{ selectNoneLabel }}
          </slot>
        </button>
      </div>
    </div>

    <!-- Individual checkboxes -->
    <div class="t-checkbox-group-items">
      <t-field v-for="option in options" :key="getOptionValue(option)">
        <t-checkbox
          :model-value="isOptionSelected(option)"
          :disabled="disabled || isOptionDisabled(option)"
          :variant="variant"
          :size="size"
          @update:model-value="(checked: boolean) => handleOptionChange(option, checked)"
        >
          <slot name="option" :option="option" :selected="isOptionSelected(option)">
            {{ getOptionLabel(option) }}
          </slot>
        </t-checkbox>
      </t-field>

      <!-- Empty state -->
      <div v-if="options.length === 0" class="t-checkbox-group-empty">
        <slot name="empty">
          <span class="has-text-grey">{{ emptyLabel }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="V extends string | number = string, O extends V | Record<string, any> = V">
import { computed } from 'vue'
import type { CheckboxVariant, CheckboxSize } from './types'
import TCheckbox from './checkbox.vue'
import TField from './field.vue'

/**
 * Checkbox group component with "null means all" semantic support.
 *
 * ## Why use this instead of manual checkbox loops?
 *
 * When building a set of checkboxes backed by an array (e.g., `selectedAgencies[]`),
 * you often face these challenges:
 *
 * 1. **Async options**: The list of available options loads after a query completes
 * 2. **"Select all by default"**: Before options load, you want `null` to mean
 *    "all options selected, even those we don't know about yet"
 * 3. **Empty vs uninitialized**: You need to distinguish between:
 *    - `null` → uninitialized, treat as "all selected"
 *    - `[]` → user explicitly deselected everything
 *
 * With manual checkbox loops, you end up with bugs like:
 * - Deselecting items one-by-one resets to "all selected" when the last item is removed
 * - Race conditions between options loading and selection state
 * - Ugly workarounds to lazily initialize `selectedItems = allItems`
 *
 * ## Key semantics (default behavior)
 *
 * | modelValue  | Meaning |
 * |-------------|-------------------------------------------|
 * | `undefined` | All options selected (uninitialized)      |
 * | `[]`        | None selected (user deselected all)       |
 * | `['a','b']` | Specific items selected                   |
 *
 * Set `undefinedMeansNone` to `true` for traditional behavior where `undefined` = none selected.
 *
 * @component t-checkbox-group
 * @example
 * <!-- Basic usage: null means all selected until user interacts -->
 * <t-checkbox-group
 *   v-model="selectedAgencies"
 *   :options="knownAgencies"
 *   label-field="name"
 *   value-field="onestop_id"
 * />
 *
 * @example
 * <!-- Simple string options -->
 * <t-checkbox-group
 *   v-model="selectedRouteTypes"
 *   :options="['metro', 'bus', 'rail', 'ferry']"
 * />
 *
 * @example
 * <!-- Traditional behavior: undefined means none selected -->
 * <t-checkbox-group
 *   v-model="selection"
 *   :options="items"
 *   undefined-means-none
 * />
 */

interface Props {
  /**
   * Selected values (v-model).
   * - `undefined`: all selected when undefinedMeansNone is false (default)
   * - `[]`: none selected (user explicitly deselected all)
   * - `['a', 'b']`: specific items selected
   */
  modelValue?: V[]

  /**
   * Available options to display as checkboxes.
   * Can be an array of strings/numbers or objects.
   */
  options: O[]

  /**
   * When true, undefined modelValue means NO options are selected.
   * By default (false), undefined means ALL options are selected - useful for
   * async-loaded option lists where you want "select all" as the default.
   * @default false
   */
  undefinedMeansNone?: boolean

  /**
   * Field name to use as the option's value when options are objects.
   * @default 'value'
   */
  valueField?: string

  /**
   * Field name to use as the option's display label when options are objects.
   * @default 'label'
   */
  labelField?: string

  /**
   * Field name to check if an option is disabled when options are objects.
   * @default 'disabled'
   */
  disabledField?: string

  /**
   * Hide the "Select All" checkbox header.
   * @default false
   */
  hideSelectAll?: boolean

  /**
   * Label for the "Select All" button.
   * @default 'Select All'
   */
  selectAllLabel?: string

  /**
   * Label for the "Select None" button.
   * @default 'Select None'
   */
  selectNoneLabel?: string

  /**
   * Label shown when options array is empty.
   * @default 'No options available'
   */
  emptyLabel?: string

  /**
   * Disable all checkboxes.
   * @default false
   */
  disabled?: boolean

  /**
   * Color variant for all checkboxes.
   */
  variant?: CheckboxVariant

  /**
   * Size for all checkboxes.
   */
  size?: CheckboxSize
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  undefinedMeansNone: false,
  valueField: 'value',
  labelField: 'label',
  disabledField: 'disabled',
  hideSelectAll: false,
  selectAllLabel: 'Select All',
  selectNoneLabel: 'Select None',
  emptyLabel: 'No options available',
  disabled: false,
  variant: undefined,
  size: undefined
})

const emit = defineEmits<{
  /**
   * Emitted when selection changes.
   * Will emit `undefined` only when undefinedMeansNone is false and all options are selected.
   */
  'update:modelValue': [value: V[] | undefined]
}>()

// Get all option values
const allOptionValues = computed(() => {
  return props.options.map(opt => getOptionValue(opt))
})

// Determine which values are currently selected
const effectiveSelectedValues = computed((): V[] => {
  // If undefined and not undefinedMeansNone, treat as all selected
  if (props.modelValue === undefined && !props.undefinedMeansNone) {
    return allOptionValues.value
  }
  // Otherwise use the actual value (could be empty array)
  return props.modelValue ?? []
})

// Calculate select all state: 'all' | 'none' | 'some'
const selectAllState = computed((): 'all' | 'none' | 'some' => {
  if (props.options.length === 0) {
    return 'none'
  }

  const selected = effectiveSelectedValues.value
  const allValues = allOptionValues.value

  // Check how many of the current options are selected
  const selectedCount = allValues.filter(v => selected.includes(v)).length

  if (selectedCount === 0) {
    return 'none'
  }
  if (selectedCount === allValues.length) {
    return 'all'
  }
  return 'some'
})

const groupClasses = computed(() => {
  const classes: string[] = []
  if (props.disabled) {
    classes.push('is-disabled')
  }
  return classes
})

function getOptionValue (option: O): V {
  if (typeof option === 'string' || typeof option === 'number') {
    return option as V
  }
  return (option as Record<string, any>)[props.valueField] as V
}

function getOptionLabel (option: O): string {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option)
  }
  const obj = option as Record<string, any>
  return String(obj[props.labelField] ?? obj[props.valueField])
}

function isOptionDisabled (option: O): boolean {
  if (typeof option === 'string' || typeof option === 'number') {
    return false
  }
  return Boolean((option as Record<string, any>)[props.disabledField])
}

function isOptionSelected (option: O): boolean {
  const value = getOptionValue(option)
  return effectiveSelectedValues.value.includes(value)
}

function handleOptionChange (option: O, checked: boolean) {
  const value = getOptionValue(option)
  let newSelected: V[]

  // Start from effective selected values (handles null -> all conversion)
  const currentSelected = [...effectiveSelectedValues.value]

  if (checked) {
    // Add to selection if not present
    if (!currentSelected.includes(value)) {
      newSelected = [...currentSelected, value]
    } else {
      newSelected = currentSelected
    }
  } else {
    // Remove from selection
    newSelected = currentSelected.filter(v => v !== value)
  }

  emitValue(newSelected)
}

function handleSelectAll () {
  // Select all - emit undefined if !undefinedMeansNone, otherwise emit all values
  if (!props.undefinedMeansNone) {
    emit('update:modelValue', undefined)
  } else {
    emit('update:modelValue', [...allOptionValues.value])
  }
}

function handleSelectNone () {
  // Deselect all - always emit empty array
  emit('update:modelValue', [])
}

function emitValue (selected: V[]) {
  // If !undefinedMeansNone and all options are selected, emit undefined
  if (!props.undefinedMeansNone) {
    const allValues = allOptionValues.value
    const allSelected = allValues.length > 0
      && allValues.every(v => selected.includes(v))
      && selected.every(v => allValues.includes(v))

    if (allSelected) {
      emit('update:modelValue', undefined)
      return
    }
  }

  emit('update:modelValue', selected)
}
</script>

<style lang="scss" scoped>
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-checkbox-group {
  &-header {
    margin-bottom: 0.5rem;
  }

  &-items {
    display: flex;
    flex-direction: column;
  }

  &-empty {
    padding: 0.5rem 0;
    font-style: italic;
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
