<template>
  <nav class="panel station-editor-panel">
    <p class="panel-heading">
      <span v-if="!editMode">{{ viewHeading }}</span>
      <span v-else>{{ editHeading }}</span>
      <span style="display:flex;gap:0.5rem;">
        <t-button
          v-if="showUnselect"
          size="small"
          @click="$emit('unselect')"
        >
          Unselect <kbd>ESC</kbd>
        </t-button>
        <t-button
          size="small"
          :variant="editMode ? 'primary' : undefined"
          @click="editMode = !editMode"
        >
          <t-icon :icon="editMode ? 'eye' : 'pencil'" size="small" />
          <span>{{ editMode ? 'View' : editLabel }}</span>
        </t-button>
      </span>
    </p>

    <!-- View Mode (Read-only) -->
    <div v-if="!editMode" class="panel-block is-block">
      <slot name="view" />
    </div>

    <!-- Edit Mode -->
    <div v-else class="panel-block is-block">
      <slot name="edit" :cancel="() => (editMode = false)" />
    </div>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  viewHeading?: string
  editHeading?: string
  editLabel?: string
  showUnselect?: boolean
}

withDefaults(defineProps<Props>(), {
  viewHeading: 'View',
  editHeading: 'Edit',
  editLabel: 'Edit',
  showUnselect: false
})

defineEmits<{
  unselect: []
}>()

const editMode = defineModel<boolean>('editMode', { default: false })
</script>
