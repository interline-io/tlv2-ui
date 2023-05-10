<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <tl-search-bar v-model="search" />
    <hr>
    <div class="field">
      <div class="field is-grouped is-grouped-multiline">
        <tl-admin-user v-for="user of users || []" :key="user.id" :user="user" action="add" @select-user="selectUser" />
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const search = ref('')

defineProps({
  title: { type: String, default: '' }
})

const emits = defineEmits([
  'selectUser'
])

const selectUser = function(userId) {
  emits('selectUser', userId)
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
    immediate: true,
    default: () => { return [] },
    watch: [
      search
    ]
  }
)
</script>
