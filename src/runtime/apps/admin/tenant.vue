<template>
  <div class="admin-tenant">
    <t-loading :active="loading" :full-page="false" />

    <t-notification v-if="error" variant="danger">
      {{ error }}
    </t-notification>

    <div v-else-if="tenant && filterAction && !tenant.actions[filterAction]" />

    <table v-else-if="tenant" class="admin-detail-table">
      <tbody>
        <!-- Name -->
        <tr>
          <th>Name</th>
          <td>
            <tl-apps-admin-input
              :value="tenant.tenant?.name"
              :can-edit="tenant.actions.can_edit"
              @save="saveName"
            />
          </td>
        </tr>

        <!-- Groups -->
        <tr>
          <th>Groups</th>
          <td>
            <div class="is-flex is-align-items-center mb-2" style="gap: 0.5em;" v-if="tenant.actions.can_create_org">
              <t-button
                size="small"
                @click="createGroup"
              >
                <t-icon icon="plus" size="small" />
                <span>Create group</span>
              </t-button>
            </div>
            <div class="field is-grouped is-grouped-multiline">
              <tl-apps-admin-group-item
                v-for="group of (nameSort(tenant.groups || []) as any[])"
                :key="group.id"
                :value="group"
              />
              <span v-if="!tenant.groups?.length" class="has-text-grey">(none)</span>
            </div>
          </td>
        </tr>

        <!-- Your permissions -->
        <tr>
          <th>Your permissions</th>
          <td>
            <tl-apps-admin-perm-list :actions="tenant.actions" />
          </td>
        </tr>

        <!-- Admins -->
        <tr v-if="tenant.actions.can_edit_members || tenant.users.admins?.length > 0">
          <th>Admins</th>
          <td>
            <tl-apps-admin-entrel-list
              action-text="Add a tenant admin"
              :action-info="permLevels('admin')"
              :entrels="tenant.users.admins"
              :can-add="tenant.actions.can_edit_members"
              :can-remove="tenant.actions.can_edit_members"
              @add-permissions="addPermissions('admin', $event)"
              @remove-permissions="removePermissions('admin', $event)"
            />
          </td>
        </tr>

        <!-- Members -->
        <tr v-if="tenant.actions.can_edit_members || tenant.users.members?.length > 0">
          <th>Members</th>
          <td>
            <tl-apps-admin-entrel-list
              action-text="Add a tenant member"
              :action-info="permLevels('member')"
              :entrels="tenant.users.members"
              :can-add="tenant.actions.can_edit_members"
              :can-remove="tenant.actions.can_edit_members"
              :show-user-star="true"
              @add-permissions="addPermissions('member', $event)"
              @remove-permissions="removePermissions('member', $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUser } from '../../composables/useUser'
import { nameSort } from '../../lib/util/filters'
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

<style scoped>
.admin-detail-table {
  border-collapse: collapse;
  width: 100%;
}

.admin-detail-table th {
  vertical-align: top;
  text-align: right;
  white-space: nowrap;
  padding: 0.75em 1em 0.75em 0;
  width: 1%;
  font-weight: 600;
}

.admin-detail-table td {
  vertical-align: top;
  padding: 0.75em 0;
}
</style>
