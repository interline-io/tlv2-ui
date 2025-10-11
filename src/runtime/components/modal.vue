<template>
  <div class="tl-modal">
    <o-modal
      :active="modelValue"
      has-modal-card
      :cancelable="closable"
      @update:model-value="$emit('update:modelValue', $event)"
      @close="close"
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ title }}
          </p>
          <button
            v-if="closable"
            type="button"
            class="delete"
            @click="close"
          />
        </header>
        <section class="modal-card-body">
          <div class="container">
            <slot :close="close" />
            <br>
          </div>
        </section>
      </div>
    </o-modal>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  text?: string
  title?: string
  modelValue?: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '+',
  title: '',
  modelValue: false,
  closable: true
})

// Emits
const emit = defineEmits<{
  'input': [value: boolean]
  'update:modelValue': [value: boolean]
}>()

// Methods
const close = (): void => {
  emit('update:modelValue', false)
}
</script>

<style>
.tl-modal .modal-card {
  min-width: 800px;
}
</style>
