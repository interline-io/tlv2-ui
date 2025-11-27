<template>
  <div>
    <t-field
      horizontal
      :label="text"
      grouped
    >
      <t-button
        v-if="canAdd"
        size="small"
        @click="showUserPicker = true"
      >
        <t-icon icon="plus" />
      </t-button>
      <t-field
        grouped
      >
        <tl-apps-admin-tenant-item
          v-for="v of (nameSort(tenants || []) as any[])"
          :key="v.id"
          :value="v"
          :action="canRemove ? 'remove' : null"
          @select="$emit('removePermissions', { type: 'tenant', id: $event, refrel: 'member' })"
        />

        <tl-apps-admin-group-item
          v-for="v of (nameSort(groups || []) as any[])"
          :key="v.id"
          :value="v"
          :action="canRemove ? 'remove' : null"
          @select="$emit('removePermissions', { type: 'org', id: $event, refrel: 'viewer' })"
        />

        <tl-apps-admin-user-item
          v-for="v of (nameSort(users || []) as any[])"
          :key="v.id"
          :user="v"
          :action="canRemove ? 'remove' : null"
          @select="$emit('removePermissions', { type: 'user', id: $event })"
        />
      </t-field>
    </t-field>
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
import { nameSort } from '../../../lib/filters'

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

const users = computed(() => {
  return props.entrels.filter((v) => { return v.type === 5 })
})

const groups = computed(() => {
  return props.entrels.filter((v) => { return v.type === 2 })
})

const tenants = computed(() => {
  return props.entrels.filter((v) => { return v.type === 1 })
})
</script>
