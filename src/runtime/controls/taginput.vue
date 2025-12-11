<template>
  <div
    class="t-taginput"
    :class="containerClasses"
    role="combobox"
    :aria-expanded="showDropdown"
    :aria-haspopup="'listbox'"
    :aria-owns="listboxId"
  >
    <!-- Selected tags (above input) -->
    <div class="t-taginput-tags" role="list" aria-label="Selected tags">
      <template v-if="selectedTags.length > 0">
        <div
          v-for="tag in selectedTags"
          :key="tag.value"
          class="tags has-addons"
          role="listitem"
        >
          <a
            v-if="!disabled && !readonly && closable"
            class="tag is-delete"
            :class="tagClasses"
            :aria-label="`Remove ${tag.label}`"
            @click="removeTag(tag)"
          />
          <span class="tag" :class="tagClasses">
            <slot name="tag" :tag="tag">
              {{ tag.label }}
            </slot>
          </span>
        </div>
      </template>
      <!-- Placeholder to reserve vertical space when no tags selected -->
      <span v-else class="t-taginput-placeholder">
        {{ emptyText }}
      </span>
      <!-- Counter for max tags -->
      <span v-if="maxTags !== undefined" class="t-taginput-counter" :class="{ 'is-max': isMaxReached }">
        {{ counterText }}
      </span>
    </div>

    <!-- Input wrapper with dropdown positioned relative to it (hidden in readonly mode) -->
    <div v-if="!readonly" class="t-taginput-input-wrapper">
      <!-- Input with icon -->
      <div class="control" :class="controlClasses">
        <input
          ref="inputRef"
          v-model="searchText"
          type="text"
          class="input"
          :class="inputClasses"
          :placeholder="isMaxReached ? 'Maximum reached' : placeholder"
          :disabled="disabled || isMaxReached"
          autocomplete="off"
          role="searchbox"
          :aria-controls="listboxId"
          :aria-activedescendant="highlightedIndex >= 0 ? `${componentId}-option-${highlightedIndex}` : undefined"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        >
        <span v-if="icon" class="icon is-left">
          <i :class="`mdi mdi-${icon}`" aria-hidden="true" />
        </span>
      </div>

      <!-- Dropdown -->
      <div
        v-show="showDropdown"
        :id="listboxId"
        class="t-taginput-dropdown"
        role="listbox"
        :aria-label="placeholder || 'Select options'"
      >
        <!-- Header slot -->
        <div v-if="$slots.header" class="t-taginput-dropdown-header">
          <slot name="header" />
        </div>

        <!-- Options list -->
        <div class="t-taginput-dropdown-content">
          <a
            v-for="(option, index) in filteredOptions"
            :id="`${componentId}-option-${index}`"
            :key="option.value"
            class="t-taginput-dropdown-item"
            :class="{ 'is-active': index === highlightedIndex }"
            role="option"
            :aria-selected="false"
            @mousedown.prevent="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <slot name="option" :option="option">
              {{ option.label }}
            </slot>
          </a>
          <div v-if="filteredOptions.length === 0 && $slots.empty" class="t-taginput-dropdown-item is-empty">
            <slot name="empty" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { computed, ref, watch, useSlots } from 'vue'
import type { TaginputVariant, TaginputSize } from './types'

/**
 * Tag input component with autocomplete dropdown.
 * Allows selecting multiple values displayed as removable tags.
 * Uses generic type T for value types (defaults to string).
 *
 * @component t-taginput
 * @example
 * <t-taginput v-model="selectedIds" :options="options" />
 * <t-taginput v-model="tags" :options="items" variant="primary" open-on-focus />
 */

defineOptions({
  inheritAttrs: true
})

/**
 * Option type for taginput items.
 */
interface TagOption {
  /** Unique value identifier */
  value: T
  /** Display label */
  label: string
  /** Allow additional properties */
  [key: string]: unknown
}

interface Props {
  /**
   * Array of options to choose from.
   * @default []
   */
  options?: TagOption[]

  /**
   * Placeholder text for the input.
   */
  placeholder?: string

  /**
   * MDI icon name for left icon (without mdi- prefix).
   * @example 'magnify', 'tag', 'account'
   */
  icon?: string

  /**
   * Open dropdown when input is focused.
   * @default false
   */
  openOnFocus?: boolean

  /**
   * Disable the input and prevent interaction.
   * @default false
   */
  disabled?: boolean

  /**
   * Make the input readonly (can view but not modify).
   * @default false
   */
  readonly?: boolean

  /**
   * Make the component take full width.
   * @default false
   */
  fullwidth?: boolean

  /**
   * Show loading state.
   * @default false
   */
  loading?: boolean

  /**
   * Color variant for the tags.
   * @default 'info'
   */
  variant?: TaginputVariant

  /**
   * Size of the input and tags.
   */
  size?: TaginputSize

  /**
   * Allow removing tags by clicking the delete button.
   * @default true
   */
  closable?: boolean

  /**
   * Use rounded style for tags and input.
   * @default false
   */
  rounded?: boolean

  /**
   * Text to display when no tags are selected.
   * @default 'None selected'
   */
  emptyText?: string

  /**
   * Maximum number of tags that can be selected.
   * When undefined, there is no limit.
   */
  maxTags?: number
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: '',
  icon: undefined,
  openOnFocus: false,
  disabled: false,
  readonly: false,
  fullwidth: false,
  loading: false,
  variant: 'info',
  size: undefined,
  closable: true,
  rounded: false,
  emptyText: 'None selected',
  maxTags: undefined
})

const emit = defineEmits<{
  /** Emitted when an option is selected */
  select: [option: TagOption]
  /** Emitted when a tag is removed */
  remove: [option: TagOption]
}>()

// v-model for selected values (array of value IDs)
const modelValue = defineModel<T[]>({ default: () => [] })

// v-model:input for search text
const searchText = defineModel<string>('input', { default: '' })

const slots = useSlots()
const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const highlightedIndex = ref(-1)

// Unique ID for ARIA attributes
const componentId = `taginput-${Math.random().toString(36).substring(2, 9)}`
const listboxId = `${componentId}-listbox`

// Check if max tags limit is reached
const isMaxReached = computed(() => {
  if (props.maxTags === undefined) return false
  return (modelValue.value?.length || 0) >= props.maxTags
})

// Counter text for max tags
const counterText = computed(() => {
  if (props.maxTags === undefined) return ''
  const current = modelValue.value?.length || 0
  return `${current} / ${props.maxTags} selected`
})

// Compute selected tags with labels from options
const selectedTags = computed(() => {
  const selected: TagOption[] = []
  for (const val of modelValue.value || []) {
    const option = props.options.find(o => o.value === val)
    if (option) {
      selected.push(option)
    } else {
      // If not found in options, create a basic tag
      selected.push({ value: val, label: String(val) })
    }
  }
  return selected
})

// Filter options: exclude already selected
const filteredOptions = computed(() => {
  const selectedValues = new Set(modelValue.value || [])
  let filtered = props.options.filter(o => !selectedValues.has(o.value))

  // Filter by search text if present
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(o => o.label.toLowerCase().includes(search))
  }

  return filtered
})

const showDropdown = computed(() => {
  return isOpen.value && (filteredOptions.value.length > 0 || !!slots.header || !!slots.empty)
})

const containerClasses = computed(() => {
  const classes: string[] = []

  if (props.fullwidth) {
    classes.push('is-fullwidth')
  }

  if (props.disabled) {
    classes.push('is-disabled')
  }

  return classes
})

const controlClasses = computed(() => {
  const classes: string[] = []

  if (props.icon) {
    classes.push('has-icons-left')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  return classes
})

const inputClasses = computed(() => {
  const classes: string[] = []

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  return classes
})

const tagClasses = computed(() => {
  const classes: string[] = []

  if (props.variant) {
    classes.push(`is-${props.variant}`)
  }

  // Bump up tag size by one level for better readability
  // default -> medium, small -> normal, etc.
  if (props.size === 'small') {
    classes.push('is-normal')
  } else if (props.size === 'normal') {
    classes.push('is-medium')
  } else if (props.size === 'medium') {
    classes.push('is-medium')
  } else if (props.size === 'large') {
    classes.push('is-large')
  } else {
    // Default to medium
    classes.push('is-medium')
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  return classes
})

function handleFocus () {
  if (props.openOnFocus && !props.readonly) {
    isOpen.value = true
  }
}

function handleBlur () {
  // Delay to allow click on dropdown item
  setTimeout(() => {
    isOpen.value = false
    highlightedIndex.value = -1
  }, 150)
}

function handleKeydown (event: KeyboardEvent) {
  if (props.readonly) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        isOpen.value = true
      } else if (highlightedIndex.value < filteredOptions.value.length - 1) {
        highlightedIndex.value++
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--
      }
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
        const option = filteredOptions.value[highlightedIndex.value]
        if (option) {
          selectOption(option)
        }
      }
      break
    case 'Escape':
      isOpen.value = false
      highlightedIndex.value = -1
      break
    case 'Backspace':
      if (searchText.value === '' && modelValue.value.length > 0) {
        const lastTag = selectedTags.value[selectedTags.value.length - 1]
        if (lastTag) {
          removeTag(lastTag)
        }
      }
      break
  }
}

function selectOption (option: TagOption) {
  if (!modelValue.value.includes(option.value)) {
    modelValue.value = [...modelValue.value, option.value]
    emit('select', option)
  }
  searchText.value = ''
  highlightedIndex.value = -1
  // Keep dropdown open for multiple selections
  inputRef.value?.focus()
}

function removeTag (tag: TagOption) {
  modelValue.value = modelValue.value.filter(v => v !== tag.value)
  emit('remove', tag)
}

// Open dropdown when typing
watch(searchText, (val) => {
  if (val.length > 0 && !props.readonly) {
    isOpen.value = true
  }
})

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style scoped lang="scss">
.t-taginput {
  &.is-fullwidth {
    width: 100%;
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.t-taginput-input-wrapper {
  position: relative;
}

.t-taginput-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  min-height: 2em; // Reserve space for tags
  align-items: center;

  // Reset Bulma's default margin on .tags
  .tags {
    margin-bottom: 0;
  }

  // Reduce left padding on label tag when following delete button
  .tag.is-delete + .tag {
    padding-left: 0.5em;
  }
}

.t-taginput-placeholder {
  color: var(--bulma-text-weak);
  font-style: italic;
  line-height: 2em; // Match tag height
}

.t-taginput-counter {
  margin-left: auto;
  font-size: 0.875rem;
  color: var(--bulma-text-weak);

  &.is-max {
    color: var(--bulma-warning);
    font-weight: 500;
  }
}

.t-taginput-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 300px;
  overflow-y: auto;
  background: var(--bulma-scheme-main);
  border: 1px solid var(--bulma-border);
  border-radius: var(--bulma-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.t-taginput-dropdown-header {
  padding: 0.5rem 0.75rem;
  background: var(--bulma-scheme-main-bis);
  border-bottom: 1px solid var(--bulma-border);
}

.t-taginput-dropdown-content {
  padding: 0.25rem 0;
}

.t-taginput-dropdown-item {
  display: block;
  padding: 0.5rem 0.75rem;
  color: var(--bulma-text);
  cursor: pointer;

  &:hover,
  &.is-active {
    background: var(--bulma-scheme-main-ter);
  }

  &.is-empty {
    color: var(--bulma-text-weak);
    cursor: default;

    &:hover {
      background: transparent;
    }
  }
}
</style>
