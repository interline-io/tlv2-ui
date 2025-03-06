<template>
  <div class="tl-modal">
    <o-modal
      :active="modelValue"
      :cancelable="['escape', 'x']"
      @update:model-value="$emit('update:modelValue', $event)"
      @close="close"
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ title }}
          </p>
          <button
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

<script>
export default {
  props: {
    text: { type: String, default: '+' },
    title: { type: String, default: '' },
    modelValue: { type: Boolean }
  },
  emits: ['input', 'update:modelValue'],
  data () {
    return {
    }
  },
  methods: {
    close () {
      this.$emit('update:modelValue', false)
    }
  }
}
</script>

<style>
.tl-modal .modal-card {
  min-width: 800px;
}
</style>
