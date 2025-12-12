<template>
  <div class="card t-card">
    <header
      v-if="label || $slots.header"
      class="card-header"
      :class="{ 'is-clickable': expandable }"
      :role="expandable ? 'button' : undefined"
      :aria-expanded="expandable ? isOpen : undefined"
      :tabindex="expandable ? 0 : undefined"
      @click="expandable && toggle()"
      @keydown.enter="expandable && toggle()"
      @keydown.space.prevent="expandable && toggle()"
    >
      <slot name="header">
        <p v-if="label" class="card-header-title">
          {{ label }}
        </p>
      </slot>
      <button
        v-if="expandable"
        type="button"
        class="card-header-icon"
        :aria-label="isOpen ? 'Collapse' : 'Expand'"
        @click.stop="toggle()"
      >
        <t-icon
          :icon="icon"
          class="t-expand-icon"
          :class="{ 'is-rotated': !isOpen }"
        />
      </button>
    </header>
    <Transition name="t-expand">
      <div v-show="!expandable || isOpen">
        <div class="card-content">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="card-footer">
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

/**
 * Card component - a flexible content container.
 * Based on Bulma Card component with optional collapse functionality.
 *
 * @component t-card
 * @see https://bulma.io/documentation/components/card/
 * @example
 * <t-card label="Settings">Content</t-card>
 * <t-card label="Details" expandable>Expandable content</t-card>
 * <t-card label="Advanced" expandable v-model:open="isOpen">Controlled</t-card>
 */

interface Props {
  /**
   * Optional label/title for the card header.
   * If not provided and no #header slot is used, the header won't be rendered.
   */
  label?: string

  /**
   * Enable expand/collapse functionality.
   * @default false
   */
  expandable?: boolean

  /**
   * Control the open/closed state (v-model:open).
   * @default false
   */
  open?: boolean

  /**
   * Icon for the collapse indicator.
   * @default 'chevron-down'
   */
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  expandable: false,
  open: false,
  icon: 'chevron-down'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Use internal state that syncs with prop for proper v-model support
const internalOpen = ref(props.open)

// Sync internal state when prop changes
watch(() => props.open, (value) => {
  internalOpen.value = value
})

// Computed to read current state
const isOpen = computed(() => internalOpen.value)

function toggle () {
  internalOpen.value = !internalOpen.value
  emit('update:open', internalOpen.value)
}
</script>

<style lang="scss" scoped>
.t-card {
  .card-header.is-clickable {
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: var(--bulma-scheme-main-bis, #fafafa);
    }
  }

  .card-header-icon {
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .t-expand-icon {
    transition: transform 0.3s ease;

    &.is-rotated {
      transform: rotate(-90deg);
    }
  }
}

// Expand transition
.t-expand-enter-active,
.t-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.t-expand-enter-from,
.t-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.t-expand-enter-to,
.t-expand-leave-from {
  opacity: 1;
  max-height: 1000px; // Arbitrary large value
}
</style>
