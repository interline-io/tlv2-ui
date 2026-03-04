<template>
  <t-card :label="editMode ? editHeading : viewHeading" variant="panel" class="station-editor-panel">
    <template #actions>
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
        <span>{{ editMode ? 'View' : editLabel }}</span> <kbd>E</kbd>
      </t-button>
    </template>

    <!-- View Mode (Read-only) -->
    <template v-if="!editMode">
      <slot name="view" />
    </template>

    <!-- Edit Mode -->
    <template v-else>
      <slot name="edit" :cancel="() => (editMode = false)" />
    </template>
  </t-card>
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
