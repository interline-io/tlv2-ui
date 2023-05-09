<template>
  <span>
    <o-button size="small" @click="showModal(true)">{{ text }}</o-button>
    <o-modal
      v-model:active="active"
      can-cancel
      has-modal-card
      @close="showModal(false)"
    >
      <template #default>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">{{ title }}</p>
            <button type="button" class="delete" @click="showModal(false)" />
          </header>
          <section class="modal-card-body">
            <div class="container">
              <slot />
              <br><br>
            </div>
          </section>
        </div>
      </template>
    </o-modal>
  </span>
</template>

<script setup>
const active = ref(false)

defineProps({
  text: { type: String, default: '+' },
  title: { type: String, default: '' }
})

const showModal = function(v) {
  console.log('showModal', v)
  active.value = v
}
</script>
