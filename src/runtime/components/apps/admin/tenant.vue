<template>
  <div>
    <t-loading :active="loading" :full-page="false" />
    <t-notification
      v-if="error"
      variant="danger"
    >
      {{ error }}
    </t-notification>
    <div v-else-if="tenant && filterAction && !tenant.actions[filterAction]" />
    <div v-else-if="tenant">
      <t-field
        label="Name"
        horizontal
      >
        <tl-apps-admin-input
          :value="tenant.tenant?.name"
          :can-edit="tenant.actions.can_edit"
          @save="saveName"
        />
      </t-field>

      <t-field
        label="Groups"
        horizontal
      >
        <t-button
          v-if="tenant.actions.can_create_org"
          size="small"
          @click="createGroup"
        >
          <t-icon icon="plus" />
          <span>Create group</span>
        </t-button>
        <div class="field">
          <div class="field is-grouped is-grouped-multiline">
            <tl-apps-admin-group-item
              v-for="group of (nameSort(tenant.groups || []) as any[])"
              :key="group.id"
              :value="group"
            />
          </div>
        </div>
      </t-field>

      <t-field label="Your permissions" horizontal>
        <div :title="`You are logged in as ${user.name} (${user.email})`">
          <tl-apps-admin-perm-list :actions="tenant.actions" />
        </div>
      </t-field>

      <tl-apps-admin-entrel-list
        v-if="tenant.actions.can_edit_members || tenant.users.admins?.length > 0"
        text="Admins"
        action-text="Add a tenant admin"
        :action-info="permLevels('admin')"
        :entrels="tenant.users.admins"
        :can-add="tenant.actions.can_edit_members"
        :can-remove="tenant.actions.can_edit_members"
        @add-permissions="addPermissions('admin', $event)"
        @remove-permissions="removePermissions('admin', $event)"
      />

      <tl-apps-admin-entrel-list
        v-if="tenant.actions.can_edit_members || tenant.users.members?.length > 0"
        text="Members"
        action-text="Add a tenant member"
        :action-info="permLevels('member')"
        :entrels="tenant.users.members"
        :can-add="tenant.actions.can_edit_members"
        :can-remove="tenant.actions.can_edit_members"
        :show-user-star="true"
        @add-permissions="addPermissions('member', $event)"
        @remove-permissions="removePermissions('member', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUser } from '../../../composables/useUser'
import { nameSort } from '../../../lib/filters'
import { useAdminFetch, fetchAdmin } from './useAdminApi'
import { useAuthz } from './useAuthz'

const props = withDefaults(defineProps<{
  id: string | number
  filterAction?: string | null
}>(), {
  filterAction: null
})

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const user = useUser()
const { getObjectType, getRelation } = useAuthz()

const { data: tenant, pending: fetchPending, error: fetchError, refresh } = await useAdminFetch<any>(() => `/tenants/${props.id}`)

const submitting = ref(false)
const actionError = ref<any>(null)

const loading = computed({
  get: () => fetchPending.value || submitting.value,
  set: (_v) => { /* handle if needed */ }
})

const error = computed(() => fetchError.value || actionError.value)

const permLevels = (lvl: string) => {
  return {
    can_edit: ['admin'].includes(lvl),
    can_view: ['admin', 'member'].includes(lvl),
    can_edit_members: ['admin'].includes(lvl),
    can_create_org: ['admin'].includes(lvl),
    can_delete_org: ['admin'].includes(lvl)
  }
}

const saveName = async (value: string) => {
  console.log('saveName', value)
  submitting.value = true
  try {
    await fetchAdmin(`/tenants/${props.id}`, { method: 'POST', body: { name: value } })
    changed()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}

const createGroup = async () => {
  console.log('createGroup')
  const data = { group: { name: 'New Group' } }
  submitting.value = true
  try {
    await fetchAdmin(`/tenants/${props.id}/groups`, { method: 'POST', body: data })
    changed()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}

const addPermissions = async (relation: string, value: any) => {
  console.log('addPermissions:', relation, value)
  const data = {
    id: value.id,
    type: getObjectType(value.type),
    ref_relation: getRelation(value.refrel),
    relation: getRelation(relation)
  }
  submitting.value = true
  try {
    await fetchAdmin(`/tenants/${props.id}/permissions`, { method: 'POST', body: data })
    refresh()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}

const removePermissions = async (relation: string, value: any) => {
  console.log('removePermissions:', relation, value)
  const data = {
    id: value.id,
    type: getObjectType(value.type),
    ref_relation: getRelation(value.refrel),
    relation: getRelation(relation)
  }
  submitting.value = true
  try {
    await fetchAdmin(`/tenants/${props.id}/permissions`, { method: 'DELETE', body: data })
    refresh()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}

const changed = () => {
  refresh()
  emit('changed')
}
</script>
