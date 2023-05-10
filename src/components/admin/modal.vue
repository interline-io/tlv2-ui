<template>
  <div>
    <o-modal
      :active="modelValue"
      can-cancel
      @close="close"
    >
      <template #default>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              {{ title }}
            </p>
            <button type="button" class="delete" @click="close" />
          </header>
          <section class="modal-card-body">
            <div class="container">
              <slot :close="close" />
              <br>
            </div>
          </section>
        </div>
      </template>
    </o-modal>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '+' },
  title: { type: String, default: '' },
  modelValue: { type: Boolean, default: false }
})

const emits = defineEmits(['update:modelValue', 'close'])

const close = function () {
  emits('update:modelValue', false)
}
</script>
