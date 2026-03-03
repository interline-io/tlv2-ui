<template>
  <t-card variant="panel" class="station-editor-panel">
    <template #header>
      <p class="card-header-title">
        <span v-if="!editMode">{{ viewHeading }}</span>
        <span v-else>{{ editHeading }}</span>
      </p>
      <div class="card-header-actions">
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
      </div>
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
