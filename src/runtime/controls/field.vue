<template>
  <div
    class="field"
    :class="fieldClasses"
  >
    <label v-if="(label || $slots.label) && !horizontal" class="label" :for="fieldId">
      <slot name="label">{{ label }}</slot>
    </label>

    <div v-if="horizontal" class="field-label" :class="labelSizeClass">
      <label v-if="label || $slots.label" class="label" :for="fieldId">
        <slot name="label">{{ label }}</slot>
      </label>
    </div>

    <div v-if="horizontal" class="field-body">
      <div class="field" :class="{ 'has-addons': addons }">
        <slot />
        <p v-if="message || $slots.message" class="help" :class="messageClass">
          <slot name="message">
            {{ message }}
          </slot>
        </p>
      </div>
    </div>

    <template v-else>
      <slot />
      <p v-if="message || $slots.message" class="help" :class="messageClass">
        <slot name="message">
          {{ message }}
        </slot>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, provide } from 'vue'
import { FieldIdKey } from './types'

const fieldId = useId()
provide(FieldIdKey, fieldId)

/**
 * Form field wrapper component following Bulma field structure.
 * Supports labels, horizontal layout, addons, grouping, and validation messages.
 *
 * @component t-field
 * @example
 * <t-field label="Name">
 *   <input class="input" type="text">
 * </t-field>
 *
 * <t-field label="Email" horizontal>
 *   <input class="input" type="email">
 * </t-field>
 *
 * <t-field addons>
 *   <div class="control">
 *     <input class="input" type="text">
 *   </div>
 *   <div class="control">
 *     <button class="button">Search</button>
 *   </div>
 * </t-field>
 */

interface Props {
  /**
   * Field label text.
   */
  label?: string

  /**
   * Use horizontal layout (label beside input).
   * @default false
   */
  horizontal?: boolean

  /**
   * Use addons layout (attached controls).
   * @default false
   */
  addons?: boolean

  /**
   * Use grouped layout (side-by-side controls).
   * @default false
   */
  grouped?: boolean

  /**
   * Help text message below field.
   */
  message?: string

  /**
   * Validation state variant.
   */
  variant?: 'success' | 'warning' | 'danger' | 'info'

  /**
   * Label size for horizontal fields.
   */
  labelSize?: 'small' | 'normal' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  horizontal: false,
  addons: false,
  grouped: false,
  message: undefined,
  variant: undefined,
  labelSize: 'normal'
})

const fieldClasses = computed(() => {
  const classes: string[] = []

  if (props.horizontal) {
    classes.push('is-horizontal')
  }

  if (props.addons && !props.horizontal) {
    classes.push('has-addons')
  }

  if (props.grouped && !props.horizontal) {
    classes.push('is-grouped')
  }

  return classes
})

const messageClass = computed(() => {
  if (!props.variant) return ''
  return `is-${props.variant}`
})

const labelSizeClass = computed(() => {
  return `is-${props.labelSize}`
})
</script>
