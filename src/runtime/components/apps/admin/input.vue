<template>
  <o-field grouped>
    <!-- These are arranged in this specific way to get correct widths and 'addon' rounding -->

    <!-- Text or edit -->
    <o-field addons class="is-fullwidth">
      <!-- Editable field -->
      <template v-if="currentlyEditing">
        <o-input
          v-model="valueShadow"
          size="small"
          expanded
        />
        <!-- Editing buttons -->
        <o-button
          variant="danger"
          size="small"
          @click="cancel"
        >
          Cancel
        </o-button>
        <o-button
          variant="primary"
          icon-left="pencil"
          size="small"
          @click="save"
        >
          Save
        </o-button>
      </template>

      <div v-else class="is-fullwidth">
        {{ value }}
      </div>

      <!-- Show edit button? -->
      <o-field v-if="canEdit && !currentlyEditing">
        <o-button
          size="small"
          variant="primary"
          icon-left="pencil"
          @click="currentlyEditing = true"
        >
          Edit
        </o-button>
      </o-field>
    </o-field>

    <!-- Show links -->
    <o-field
      v-if="link"
      grouped
    >
      <slot name="link" />
    </o-field>
  </o-field>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  value?: string
  canEdit?: boolean
  link?: boolean
}>(), {
  value: '',
  canEdit: false,
  link: false
})

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

const valueShadow = ref<string | undefined>(props.value ?? '')
const currentlyEditing = ref(false)

const cancel = () => {
  valueShadow.value = props.value || ''
  currentlyEditing.value = false
}

const save = () => {
  emit('save', valueShadow.value || '')
  currentlyEditing.value = false
}
</script>

<style scoped>
.is-fullwidth {
  width:100%;
}
</style>
