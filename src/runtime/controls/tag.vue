<template>
  <a
    v-if="isDelete"
    class="tag is-delete"
    @click="handleClick"
  />
  <span
    v-else
    class="tag"
    :class="tagClasses"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
    <button
      v-if="closable"
      type="button"
      class="delete is-small"
      @click.stop="handleClose"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TagVariant, TagSize } from './types'

interface Props {
  /**
   * Tag label text (alternative to using default slot).
   */
  label?: string

  /**
   * Color variant of the tag.
   */
  variant?: TagVariant

  /**
   * Size of the tag.
   */
  size?: TagSize

  /**
   * Whether the tag has rounded corners.
   */
  rounded?: boolean

  /**
   * Whether the tag uses light color variant.
   */
  light?: boolean

  /**
   * Whether the tag has a close button.
   */
  closable?: boolean

  /**
   * Whether the tag is a delete button (renders as pure delete X).
   */
  isDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  variant: undefined,
  size: undefined,
  rounded: false,
  light: false,
  closable: false,
  isDelete: false
})

const emit = defineEmits<{
  close: []
  click: []
}>()

const handleClick = () => emit('click')
const handleClose = () => emit('close')

const tagClasses = computed(() => {
  const classes: string[] = []

  if (props.isDelete) {
    classes.push('is-delete')
    return classes
  }

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  if (props.light) {
    classes.push('is-light')
  }

  return classes
})
</script>
