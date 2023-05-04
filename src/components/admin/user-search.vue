<template>
  <div>
    v: {{ showUserSelect }}
    <o-button size="small" icon-left="plus" @click="showModal(true)" />
    <o-modal
      v-model:active="showUserSelect"
      can-cancel
      has-modal-card
      @close="showModal(false)"
    >
      <template #default>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              {{ title }}
            </p>
            <button type="button" class="delete" @click="showModal(false)" />
          </header>
          <section class="modal-card-body">
            <div class="container content">
              <tl-msg-error v-if="error">
                {{ error }}
              </tl-msg-error>
              <tl-search-bar v-model="search" />
              <tl-admin-user v-for="user of users || []" :key="user.id" :user="user" @click="selectUser(user.id)" />
            </div>
          </section>
        </div>
      </template>
    </o-modal>
    <hr>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const search = ref('')
const showUserSelect = ref(false)

defineProps({
  title: { type: String, default: '' }
})

const emits = defineEmits([
  'selectUser'
])

const selectUser = function(userId) {
  emits('selectUser', userId)
  showUserSelect.value = false
}

const showModal = function(v) {
  console.log('showModal', v)
  showUserSelect.value = v
}

const { data: users, error } = await useAsyncData(
  'users',
  () => $fetch('/users', {
    method: 'GET',
    baseURL: config.public.adminEndpoint,
    params: {
      q: (search.value && search.value.length > 1) ? (search.value + '*') : null
    }
  }), {
    immediate: false,
    default: () => { return [] },
    watch: [
      search
    ]
  }
)
</script>
