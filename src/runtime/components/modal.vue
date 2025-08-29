<template>
  <div class="tl-modal">
    <o-modal
      :active="modelValue"
      has-modal-card
      :can-cancel="closable"
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

<script>
export default {
  props: {
    text: { type: String, default: '+' },
    title: { type: String, default: '' },
    modelValue: { type: Boolean },
    closable: { type: Boolean, default: true }
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
