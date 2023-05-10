<template>
  <div>
    <o-field v-if="canEdit">
      <o-input v-model="valueShadow" expanded />
      <o-button variant="primary" icon-left="pencil" @click="emits('save', valueShadow)">
        Save
      </o-button>
    </o-field>
    <div v-else>
      {{ value }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: { type: String, default: '' },
  canEdit: { type: Boolean, default: false }
})

const emits = defineEmits([
  'save'
])

const valueShadow = ref(props.value)
</script>
