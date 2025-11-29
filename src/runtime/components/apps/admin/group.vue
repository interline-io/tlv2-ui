<template>
  <div>
    <t-loading :active="loading" :full-page="false" />
    <t-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </t-notification>
    <div v-else-if="group">
      <div>
        <t-field
          label="Group name"
          horizontal
        >
          <tl-apps-admin-input
            :value="group.group?.name"
            :can-edit="editable && group.actions.can_edit"
            @save="saveName"
          />
        </t-field>

        <t-field
          v-if="showTenant"
          label="Parent"
          horizontal
        >
          <tl-apps-admin-input
            :value="group.tenant?.name"
            :link="true"
          >
            <template #link>
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

              <t-field
                v-if="showFeeds"
                label="Feeds"
                horizontal
              >
                <div class="field">
                  <div class="field is-grouped is-grouped-multiline">
                    <tl-apps-admin-feed-item
                      v-for="v of group.feeds || []"
                      :key="v.id"
                      :value="v"
                    />
                  </div>
                </div>
              </t-field>

              <t-field v-if="showActions" label="Your permissions" horizontal>
                <div :title="`You are logged in as ${user.name} (${user.email})`">
                  <tl-apps-admin-perm-list :actions="group.actions" />
                </div>
              </t-field>

              <div v-if="showMembers">
                <tl-apps-admin-entrel-list
                  v-if="(editable && group.actions.can_edit_members) || group.users.managers?.length > 0"
                  text="Managers"
                  action-text="Add a group manager"
                  :action-info="permLevels('manager')"
                  :entrels="group.users.managers"
                  :can-add="editable && group.actions.can_edit_members"
                  :can-remove="editable && group.actions.can_edit_members"
                  @add-permissions="addPermissions('manager', $event)"
                  @remove-permissions="removePermissions('manager', $event)"
                />

                <tl-apps-admin-entrel-list
                  v-if="(editable && group.actions.can_edit_members) || group.users.editors?.length > 0"
                  text="Editors"
                  action-text="Add a group editor"
                  :action-info="permLevels('editor')"
                  :entrels="group.users.editors"
                  :can-add="editable && group.actions.can_edit_members"
                  :can-remove="editable && group.actions.can_edit_members"
                  :show-tenants="true"
                  @add-permissions="addPermissions('editor', $event)"
                  @remove-permissions="removePermissions('editor', $event)"
                />

                <tl-apps-admin-entrel-list
                  v-if="(editable && group.actions.can_edit_members) || group.users.viewers?.length > 0"
                  text="Viewers"
                  action-text="Add a group viewer"
                  :action-info="permLevels('viewer')"
                  :entrels="group.users.viewers"
                  :can-add="editable && group.actions.can_edit_members"
                  :can-remove="editable && group.actions.can_edit_members"
                  :show-tenants="true"
                  @add-permissions="addPermissions('viewer', $event)"
                  @remove-permissions="removePermissions('viewer', $event)"
                />

                <t-field label="" horizontal>
                  * Admin users in parent {{ group.tenant?.name }} are also group managers (not shown)
                </t-field>
              </div>

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
            </template>
          </tl-apps-admin-input>
        </t-field>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUser } from '../../../composables/useUser'
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
const user = useUser()

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
  console.log('saveName', value)
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
  console.log('addPermissions:', relation, value)
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
  console.log('removePermissions:', relation, value)
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
  console.log('setTenant', value)
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
