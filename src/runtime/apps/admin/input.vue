<template>
  <div class="admin-input">
    <!-- Edit mode -->
    <div v-if="currentlyEditing" class="field has-addons">
      <div class="control is-expanded">
        <t-input
          v-model="valueShadow"
          size="small"
        />
      </div>
      <div class="control">
        <t-button
          variant="danger"
          size="small"
          @click="cancel"
        >
          Cancel
        </t-button>
      </div>
      <div class="control">
        <t-button
          variant="primary"
          size="small"
          @click="save"
        >
          <t-icon icon="pencil" size="small" />
          <span>Save</span>
        </t-button>
      </div>
    </div>

    <!-- Display mode -->
    <div v-else class="is-flex is-align-items-center" style="gap: 0.5em;">
      <span>{{ value }}</span>
      <t-button
        v-if="canEdit"
        size="small"
        variant="primary"
        @click="currentlyEditing = true"
      >
        <t-icon icon="pencil" size="small" />
        <span>Edit</span>
      </t-button>
      <slot name="link" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  value?: string
  canEdit?: boolean
}>(), {
  value: '',
  canEdit: false
})

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

const valueShadow = ref<string | number>(props.value ?? '')
const currentlyEditing = ref(false)

const cancel = () => {
  valueShadow.value = props.value || ''
  currentlyEditing.value = false
}

const save = () => {
  emit('save', String(valueShadow.value || ''))
  currentlyEditing.value = false
}
</script>
