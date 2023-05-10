<template>
  <span>
    <o-button size="small" @click.stop="open">
      {{ text }}
    </o-button>
    <o-modal
      v-model:active="active"
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
  </span>
</template>

<script setup>
const active = ref(false)

defineProps({
  text: { type: String, default: '+' },
  title: { type: String, default: '' }
})

const open = function () {
  active.value = true
  console.log('???')
}

const close = function () {
  active.value = false
}
</script>
