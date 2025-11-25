<template>
  <div>
    <slot name="title">
      <tl-title title="Groups" />
    </slot>

    <slot name="description">
      <p class="content">
        Your user belongs to the following groups. Each group grants access to one or more associated feeds and their feed versions.
      </p>
    </slot>

    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>

    <ul>
      <li
        v-for="v of groups"
        :key="v.id"
      >
        <tl-apps-admin-group-item
          :key="v.id"
          :value="v"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminFetch } from '../useAdminApi'

interface Group {
  id: string
  name: string
  [key: string]: any
}

const { data, error } = await useAdminFetch<{ groups: Group[] }>('/groups')

const groups = computed(() => data.value?.groups || [])
</script>
