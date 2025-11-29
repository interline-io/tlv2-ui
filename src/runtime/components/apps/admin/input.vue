<template>
  <t-field grouped>
    <!-- These are arranged in this specific way to get correct widths and 'addon' rounding -->

    <!-- Text or edit -->
    <t-field addons class="is-fullwidth">
      <!-- Editable field -->
      <template v-if="currentlyEditing">
        <t-input
          v-model="valueShadow"
          size="small"
          expanded
        />
        <!-- Editing buttons -->
        <t-button
          variant="danger"
          size="small"
          @click="cancel"
        >
          Cancel
        </t-button>
        <t-button
          variant="primary"
          size="small"
          @click="save"
        >
          <t-icon icon="pencil" />
          <span>Save</span>
        </t-button>
      </template>

      <div v-else class="is-fullwidth">
        {{ value }}
      </div>

      <!-- Show edit button? -->
      <t-field v-if="canEdit && !currentlyEditing">
        <t-button
          size="small"
          variant="primary"
          @click="currentlyEditing = true"
        >
          <t-icon icon="pencil" />
          <span>Edit</span>
        </t-button>
      </t-field>
    </t-field>

    <!-- Show links -->
    <t-field
      v-if="link"
      grouped
    >
      <slot name="link" />
    </t-field>
  </t-field>
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

<style scoped>
.is-fullwidth {
  width:100%;
}
</style>
