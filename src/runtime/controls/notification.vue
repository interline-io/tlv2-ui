<template>
  <div class="notification" :class="notificationClasses">
    <button v-if="closeable" class="delete" @click="handleClose" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotificationVariant } from './types'

/**
 * Notification/alert message component using Bulma styling.
 * Displays contextual messages with optional close button.
 *
 * @component t-notification
 * @example
 * <t-notification>Default info message</t-notification>
 * <t-notification variant="warning" closeable @close="handleClose">
 *   Warning message
 * </t-notification>
 */

interface Props {
  /**
   * Notification color variant using Bulma color classes.
   * @default 'info'
   */
  variant?: NotificationVariant

  /**
   * Show close button and allow user to dismiss.
   * @default false
   */
  closeable?: boolean

  /**
   * Use light variant of the notification.
   * @default false
   */
  light?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  closeable: false,
  light: false
})

/**
 * Emitted when close button is clicked.
 * @event close
 */
const emit = defineEmits<{
  close: []
}>()

const notificationClasses = computed(() => {
  const classes: string[] = []

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  if (props.light) {
    classes.push('is-light')
  }

  return classes
})

function handleClose () {
  emit('close')
}
</script>
