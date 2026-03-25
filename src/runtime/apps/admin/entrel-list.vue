<template>
  <div>
    <div class="is-flex is-align-items-center mb-2" style="gap: 0.5em;">
      <t-button
        v-if="canAdd"
        size="small"
        @click="showUserPicker = true"
      >
        <t-icon icon="plus" size="small" />
      </t-button>
      <span class="has-text-grey is-size-7">{{ allEntrels.length }} {{ allEntrels.length === 1 ? 'user' : 'users' }}</span>
    </div>

    <!-- Search (for larger lists) -->
    <div v-if="allEntrels.length > 8" class="mb-2">
      <t-input
        v-model="searchQuery"
        size="small"
        placeholder="Filter..."
      />
    </div>

    <!-- User tags -->
    <div v-if="filteredEntrels.length" class="field is-grouped is-grouped-multiline">
      <tl-apps-admin-tenant-item
        v-for="v of filteredTenants"
        :key="'t' + v.id"
        :value="v"
        :action="canRemove ? 'remove' : null"
        @select="$emit('removePermissions', { type: 'tenant', id: $event, refrel: 'member' })"
      />

      <tl-apps-admin-group-item
        v-for="v of filteredGroups"
        :key="'g' + v.id"
        :value="v"
        :action="canRemove ? 'remove' : null"
        @select="$emit('removePermissions', { type: 'org', id: $event, refrel: 'viewer' })"
      />

      <tl-apps-admin-user-item
        v-for="v of filteredUsers"
        :key="'u' + v.id"
        :user="v"
        :action="canRemove ? 'remove' : null"
        @select="$emit('removePermissions', { type: 'user', id: $event })"
      />
    </div>
    <span v-else-if="searchQuery" class="has-text-grey is-size-7">No matches</span>
    <span v-else class="has-text-grey">(none)</span>

    <t-modal
      v-slot="scope"
      v-model="showUserPicker"
      :title="actionText"
    >
      <tl-apps-admin-entrel-search
        :action-info="actionInfo"
        :show-users="showUsers"
        :show-groups="showGroups"
        :show-tenants="showTenants"
        :show-user-star="showUserStar"
        @select="$emit('addPermissions', $event); scope.close();"
      />
    </t-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { nameSort } from '../../lib/util/filters'

const props = withDefaults(defineProps<{
  text?: string
  actionText?: string
  actionInfo?: Record<string, any>
  entrels?: any[]
  canAdd?: boolean
  canRemove?: boolean
  showUsers?: boolean
  showGroups?: boolean
  showTenants?: boolean
  showUserStar?: boolean
}>(), {
  text: '',
  actionText: '',
  actionInfo: () => ({}),
  entrels: () => [],
  canAdd: false,
  canRemove: false,
  showUsers: true,
  showGroups: false,
  showTenants: false,
  showUserStar: false
})

defineEmits<{
  (e: 'addPermissions', value: any): void
  (e: 'removePermissions', value: any): void
}>()

const showUserPicker = ref(false)
const searchQuery = ref('')

const allEntrels = computed(() => props.entrels || [])

const users = computed(() => nameSort(allEntrels.value.filter(v => v.type === 5)) as any[])
const groups = computed(() => nameSort(allEntrels.value.filter(v => v.type === 2)) as any[])
const tenants = computed(() => nameSort(allEntrels.value.filter(v => v.type === 1)) as any[])

const filterBySearch = (items: any[]) => {
  if (!searchQuery.value) return items
  const q = searchQuery.value.toLowerCase()
  return items.filter(v => {
    const name = String(v.name || '').toLowerCase()
    const email = String(v.email || '').toLowerCase()
    return name.includes(q) || email.includes(q)
  })
}

const filteredUsers = computed(() => filterBySearch(users.value))
const filteredGroups = computed(() => filterBySearch(groups.value))
const filteredTenants = computed(() => filterBySearch(tenants.value))
const filteredEntrels = computed(() => [...filteredTenants.value, ...filteredGroups.value, ...filteredUsers.value])
</script>
