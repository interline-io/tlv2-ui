<template>
  <div class="card t-card">
    <header
      v-if="label || $slots.header"
      class="card-header"
      :class="{ 'is-clickable': collapsible }"
      :role="collapsible ? 'button' : undefined"
      :aria-expanded="collapsible ? isOpen : undefined"
      :tabindex="collapsible ? 0 : undefined"
      @click="collapsible && toggle()"
      @keydown.enter="collapsible && toggle()"
      @keydown.space.prevent="collapsible && toggle()"
    >
      <slot name="header">
        <p v-if="label" class="card-header-title">
          {{ label }}
        </p>
      </slot>
      <button
        v-if="collapsible"
        type="button"
        class="card-header-icon"
        :aria-label="isOpen ? 'Collapse' : 'Expand'"
        @click.stop="toggle()"
      >
        <t-icon
          :icon="icon"
          class="t-collapse-icon"
          :class="{ 'is-rotated': !isOpen }"
        />
      </button>
    </header>
    <Transition name="t-collapse">
      <div v-show="!collapsible || isOpen">
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
import { ref, watch } from 'vue'

/**
 * Card component - a flexible content container.
 * Based on Bulma Card component with optional collapse functionality.
 *
 * @component t-card
 * @see https://bulma.io/documentation/components/card/
 * @example
 * <t-card label="Settings">Content</t-card>
 * <t-card label="Details" collapsible>Collapsible content</t-card>
 * <t-card label="Advanced" collapsible v-model:open="isOpen">Controlled</t-card>
 */

interface Props {
  /**
   * Optional label/title for the card header.
   * If not provided and no #header slot is used, the header won't be rendered.
   */
  label?: string

  /**
   * Enable collapse functionality.
   * @default false
   */
  collapsible?: boolean

  /**
   * Control the open/closed state (v-model:open).
   * @default true
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
  collapsible: false,
  open: true,
  icon: 'chevron-down'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

watch(() => props.open, (value) => {
  isOpen.value = value
})

function toggle () {
  isOpen.value = !isOpen.value
  emit('update:open', isOpen.value)
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

  .t-collapse-icon {
    transition: transform 0.3s ease;

    &.is-rotated {
      transform: rotate(-90deg);
    }
  }
}

// Collapse transition
.t-collapse-enter-active,
.t-collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.t-collapse-enter-from,
.t-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.t-collapse-enter-to,
.t-collapse-leave-from {
  opacity: 1;
  max-height: 1000px; // Arbitrary large value
}
</style>
