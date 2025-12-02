<template>
  <div>
    <div v-if="showUser" class="pb-2">
      You are logged in as {{ user.name }} ({{ user.email }})
    </div>

    <div v-if="actionText" class="pb-2">
      {{ actionText }}
    </div>

    <div class="field is-grouped is-grouped-multiline">
      <div
        v-for="[k, v] of Object.entries(actions)"
        :key="k"
        class="control"
      >
        <div class="tags has-addons">
          <span class="tag is-list">{{ k.replace('can_', '').replaceAll('_', ' ') }}</span>
          <span
            v-if="v"
            class="tag is-primary"
          ><t-icon
            icon="check"
            size="small"
          /></span>
          <span
            v-else
            class="tag is-warning"
          ><t-icon
            icon="alert"
            size="small"
          /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUser } from '../../../composables/useUser'

withDefaults(defineProps<{
  showUser?: boolean
  actions?: Record<string, boolean>
  actionText?: string | null
}>(), {
  showUser: false,
  actions: () => ({ can_view: false }),
  actionText: null
})

const user = useUser()
</script>
