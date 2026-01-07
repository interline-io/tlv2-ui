<template>
  <div>
    <t-loading :active="loadingAll" :full-page="false" />
    <t-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </t-notification>

    <t-field v-if="actionInfo">
      <tl-apps-admin-perm-list :actions="actionInfo" action-text="This permission level permits the following actions:" :show-user="false" />
    </t-field>

    <hr>

    <t-search-bar v-model="search" />

    <hr>

    <t-field
      v-if="showUsers"
      label="Users"
      class="mb-4"
    >
      <div v-if="typeMore">
        Begin typing to search
      </div>
      <div v-else-if="!users || users.length === 0">
        No results
      </div>
      <div class="field is-grouped is-grouped-multiline">
        <tl-apps-admin-user-item
          v-for="v of (nameSort(users || []) as any[])"
          :key="v.id"
          :user="v"
          :new-tab="true"
          action="add"
          @select="$emit('select', { type: 'user', id: $event })"
        />
      </div>
    </t-field>

    <t-field
      v-if="showUserStar"
      class="mb-4"
      label="All users"
    >
      <div class="field is-grouped is-grouped-multiline">
        <template v-if="showUserStar">
          <tl-apps-admin-tenant-item
            key="*"
            :value="userStar"
            :new-tab="true"
            action="add"
            @select="$emit('select', { type: 'user', id: $event })"
          />
        </template>
      </div>
    </t-field>

    <t-field
      v-if="showGroups || showTenants"
      label="Groups"
      class="mb-4"
    >
      <div v-if="(!tenants || tenants.length === 0) && (!groups || groups.length === 0)">
        No results
      </div>
      <div v-else>
        <div class="field is-grouped is-grouped-multiline">
          <tl-apps-admin-tenant-item
            v-for="v of (nameSort(tenants || []) as any[])"
            :key="v.id"
            :new-tab="true"
            :value="v"
            action="add"
            @select="$emit('select', { type: 'tenant', id: $event, refrel: 'member' })"
          />
          <tl-apps-admin-group-item
            v-for="v of (nameSort(groups || []) as any[])"
            :key="v.id"
            :value="v"
            :new-tab="true"
            action="add"
            @select="$emit('select', { type: 'org', id: $event, refrel: 'viewer' })"
          />
        </div>
      </div>
    </t-field>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { nameSort } from '../../lib/util/filters'
import { fetchAdmin } from './useAdminApi'

withDefaults(defineProps<{
  title?: string
  showUsers?: boolean
  showGroups?: boolean
  showTenants?: boolean
  showUserStar?: boolean
  actionInfo?: Record<string, any>
}>(), {
  title: '',
  showUsers: true,
  showGroups: false,
  showTenants: false,
  showUserStar: false,
  actionInfo: () => ({})
})

defineEmits<{
  (e: 'select', value: any): void
}>()

const loadingAll = ref(false)
const error = ref<any>(null)
const search = ref<string | null>('')
const userStar = ref({
  id: '*',
  name: 'All users'
})
const users = ref<any[]>([])
const tenants = ref<any[]>([])
const groups = ref<any[]>([])

const typeMore = computed(() => {
  return (!search.value || search.value.length < 2)
})

const getData = async (searchValue: string) => {
  loadingAll.value = true
  error.value = null
  try {
    // users
    if (searchValue && searchValue.length > 1) {
      const data: any = await fetchAdmin('/users', { query: { q: searchValue } })
      users.value = (data?.users || []).slice(0, 10)
    } else {
      users.value = []
    }

    // groups
    const groupsData: any = await fetchAdmin('/groups')
    groups.value = (groupsData?.groups || []).slice(0, 100)

    // tenants
    const tenantsData: any = await fetchAdmin('/tenants')
    tenants.value = (tenantsData?.tenants || []).slice(0, 100)
  } catch (e) {
    error.value = e
  } finally {
    loadingAll.value = false
  }
}

watch(search, (v) => { getData(v || '') })

onMounted(() => { getData('') })
</script>
