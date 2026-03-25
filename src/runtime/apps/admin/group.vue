<template>
  <div class="admin-group">
    <t-loading :active="loading" :full-page="false" />

    <t-notification v-if="error" variant="danger">
      Error: {{ error }}
    </t-notification>

    <table v-else-if="group" class="admin-detail-table">
      <tbody>
        <!-- Name -->
        <tr>
          <th>Group name</th>
          <td>
            <tl-apps-admin-input
              :value="group.group?.name"
              :can-edit="editable && group.actions.can_edit"
              @save="saveName"
            />
          </td>
        </tr>

        <!-- Parent tenant -->
        <tr v-if="showTenant">
          <th>Parent</th>
          <td>
            <div class="is-flex is-align-items-center" style="gap: 0.5em;">
              <span>{{ group.tenant?.name }}</span>
              <tl-link
                v-if="group.tenant"
                class="button is-small"
                route-key="apps-admin-tenants-tenantKey"
                :to="{ params: { tenantKey: group.tenant.id } }"
              >
                View tenant
              </tl-link>
              <t-button
                v-if="editable && group.actions.can_set_tenant"
                size="small"
                @click="showAssignTenant = true"
              >
                Set tenant
              </t-button>
            </div>
          </td>
        </tr>

        <!-- Feeds -->
        <tr v-if="showFeeds">
          <th>Feeds</th>
          <td>
            <tl-apps-admin-entity-list
              :items="group.feeds || []"
              item-label="feed"
              item-label-plural="feeds"
              :search-fields="['name', 'onestop_id']"
            >
              <template #header>
                <th>Name</th>
                <th>Onestop ID</th>
              </template>
              <template #row="{ item }">
                <tr>
                  <td>
                    <tl-link
                      route-key="feeds-feedKey"
                      :to="{ params: { feedKey: item.onestop_id } }"
                    >
                      {{ item.name || item.onestop_id }}
                    </tl-link>
                  </td>
                  <td class="has-text-grey is-size-7">
                    {{ item.onestop_id }}
                  </td>
                </tr>
              </template>
            </tl-apps-admin-entity-list>
          </td>
        </tr>

        <!-- Your permissions -->
        <tr v-if="showActions">
          <th>Your permissions</th>
          <td>
            <tl-apps-admin-perm-list :actions="group.actions" />
          </td>
        </tr>

        <!-- Managers -->
        <tr v-if="showMembers && ((editable && group.actions.can_edit_members) || group.users.managers?.length > 0)">
          <th>Managers</th>
          <td>
            <tl-apps-admin-entrel-list
              action-text="Add a group manager"
              :action-info="permLevels('manager')"
              :entrels="group.users.managers"
              :can-add="editable && group.actions.can_edit_members"
              :can-remove="editable && group.actions.can_edit_members"
              @add-permissions="addPermissions('manager', $event)"
              @remove-permissions="removePermissions('manager', $event)"
            />
          </td>
        </tr>

        <!-- Editors -->
        <tr v-if="showMembers && ((editable && group.actions.can_edit_members) || group.users.editors?.length > 0)">
          <th>Editors</th>
          <td>
            <tl-apps-admin-entrel-list
              action-text="Add a group editor"
              :action-info="permLevels('editor')"
              :entrels="group.users.editors"
              :can-add="editable && group.actions.can_edit_members"
              :can-remove="editable && group.actions.can_edit_members"
              :show-tenants="true"
              @add-permissions="addPermissions('editor', $event)"
              @remove-permissions="removePermissions('editor', $event)"
            />
          </td>
        </tr>

        <!-- Viewers -->
        <tr v-if="showMembers && ((editable && group.actions.can_edit_members) || group.users.viewers?.length > 0)">
          <th>Viewers</th>
          <td>
            <tl-apps-admin-entrel-list
              action-text="Add a group viewer"
              :action-info="permLevels('viewer')"
              :entrels="group.users.viewers"
              :can-add="editable && group.actions.can_edit_members"
              :can-remove="editable && group.actions.can_edit_members"
              :show-tenants="true"
              @add-permissions="addPermissions('viewer', $event)"
              @remove-permissions="removePermissions('viewer', $event)"
            />
          </td>
        </tr>

        <!-- Note -->
        <tr v-if="showMembers && group.tenant?.name">
          <th />
          <td class="has-text-grey is-size-7">
            * Admin users in parent {{ group.tenant.name }} are also group managers (not shown)
          </td>
        </tr>
      </tbody>
    </table>

    <t-modal
      v-model="showAssignTenant"
      title="Set tenant"
    >
      <tl-apps-admin-entrel-search
        :show-users="false"
        :show-tenants="true"
        @select="showAssignTenant = false; setTenant($event)"
      />
    </t-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminFetch, fetchAdmin } from './useAdminApi'
import { useAuthz } from './useAuthz'

const props = withDefaults(defineProps<{
  id: string | number
  showFeeds?: boolean
  showActions?: boolean
  showTenant?: boolean
  showMembers?: boolean
  editable?: boolean
}>(), {
  showFeeds: true,
  showActions: true,
  showTenant: true,
  showMembers: true,
  editable: true
})

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const showAssignTenant = ref(false)

const { data: group, pending: fetchPending, error: fetchError, refresh } = await useAdminFetch<any>(() => `/groups/${props.id}`)
const { getObjectType, getRelation } = useAuthz()

const submitting = ref(false)
const actionError = ref<any>(null)

const loading = computed({
  get: () => fetchPending.value || submitting.value,
  set: (_v) => { /* handle if needed */ }
})

const error = computed(() => fetchError.value || actionError.value)

const permLevels = (lvl: string) => {
  return {
    can_edit: ['manager', 'editor'].includes(lvl),
    can_view: ['manager', 'editor', 'viewer'].includes(lvl),
    can_edit_members: ['manager'].includes(lvl),
    can_create_feed: ['manager', 'editor'].includes(lvl),
    can_delete_feed: ['manager', 'editor'].includes(lvl),
    can_set_tenant: false
  }
}

const saveName = async (value: string) => {
  submitting.value = true
  try {
    await fetchAdmin(`/groups/${props.id}`, { method: 'POST', body: { name: value } })
    changed()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}

const addPermissions = async (relation: string, value: any) => {
  const data = {
    id: String(value.id),
    type: getObjectType(value.type),
    ref_relation: getRelation(value.refrel),
    relation: getRelation(relation)
  }
  submitting.value = true
  try {
    await fetchAdmin(`/groups/${props.id}/permissions`, { method: 'POST', body: data })
    refresh()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}

const removePermissions = async (relation: string, value: any) => {
  const data = {
    id: String(value.id),
    type: getObjectType(value.type),
    ref_relation: getRelation(value.refrel),
    relation: getRelation(relation)
  }
  submitting.value = true
  try {
    await fetchAdmin(`/groups/${props.id}/permissions`, { method: 'DELETE', body: data })
    refresh()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}

const setTenant = async (value: any) => {
  const data = { tenant_id: value.id }
  submitting.value = true
  try {
    await fetchAdmin(`/groups/${props.id}/tenant`, { method: 'POST', body: data })
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

<style src="./admin.css" />
