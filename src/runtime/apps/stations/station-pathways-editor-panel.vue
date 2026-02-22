<template>
  <div>
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        <span v-if="!editMode">{{ viewHeading }}</span>
        <span v-else>{{ editHeading }}</span>
        <span class="panel-heading-buttons">
          <button
            v-if="showUnselect"
            class="button is-small"
            @click="$emit('unselect')"
          >
            Unselect <kbd>ESC</kbd>
          </button>
          <button
            class="button is-small"
            :class="editMode ? 'is-primary' : ''"
            @click="toggleEditMode"
          >
            <t-icon :icon="editMode ? 'eye' : 'pencil'" size="small" />
            <span>{{ editMode ? 'View' : 'Edit' }}</span>
          </button>
        </span>
      </p>

      <!-- View Mode (Read-only) -->
      <div v-if="!editMode" class="panel-block is-block">
        <slot name="view" />
      </div>

      <!-- Edit Mode -->
      <div v-else class="panel-block is-block">
        <slot name="edit" :cancel="() => editMode = false" />
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    viewHeading: {
      type: String,
      default: 'View'
    },
    editHeading: {
      type: String,
      default: 'Edit'
    },
    showUnselect: {
      type: Boolean,
      default: false
    }
  },
  emits: ['unselect'],
  data () {
    return {
      editMode: false
    }
  },
  methods: {
    toggleEditMode () {
      this.editMode = !this.editMode
    }
  }
}
</script>

<style scoped>
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-heading-buttons {
  display: flex;
  gap: 0.5rem;
}

.button kbd {
  display: inline-block;
  margin-left: 0.3em;
  padding: 0 0.3em;
  font-size: 0.7em;
  font-family: monospace;
  line-height: 1.4;
  color: inherit;
  background-color: rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  opacity: 0.75;
}
</style>
