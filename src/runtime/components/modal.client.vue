<template>
  <div class="tl-modal">
    <o-modal
      :active="modelValue"
      has-modal-card
      close-class="tl-modal-hideclose"
      :cancelable="closable"
      :full-screen="fullScreen"
      full-screen-class="tl-modal-fullscreen"
      @update:model-value="$emit('update:modelValue', $event)"
      @close="close"
    >
      <template #close>
        ...
      </template>
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
          <div v-if="modelValue" class="container">
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
withDefaults(defineProps<{
  text?: string
  title?: string
  modelValue?: boolean
  closable?: boolean
  fullScreen?: boolean
}>(), {
  text: '+',
  title: '',
  modelValue: false,
  closable: true,
  fullScreen: false
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
.tl-modal-fullscreen {
  padding-top:30px;
  padding-bottom:30px;
}
.tl-modal-hideclose {
  display:none;
}
</style>
