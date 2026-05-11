<template>
  <div class="admin-feed-version">
    <t-loading :active="loading" :full-page="false" />

    <t-notification v-if="error" variant="danger">
      Error: {{ error }}
    </t-notification>

    <table v-else-if="fv && perms" class="table is-fullwidth">
      <tbody>
        <!-- Name -->
        <tr v-if="fv.name">
          <th>Name</th>
          <td>{{ fv.name }}</td>
        </tr>

        <!-- SHA1 -->
        <tr>
          <th>SHA1</th>
          <td><code>{{ fv.sha1 }}</code></td>
        </tr>

        <!-- Description -->
        <tr v-if="fv.description">
          <th>Description</th>
          <td>{{ fv.description }}</td>
        </tr>

        <!-- Your permissions -->
        <tr>
          <th>Your permissions</th>
          <td>
            <tl-apps-admin-perm-list :actions="perms.actions" />
          </td>
        </tr>

        <!-- Editors -->
        <tr v-if="perms.actions.can_edit_members || perms.users.editors?.length > 0">
          <th>Editors</th>
          <td>
            <tl-apps-admin-entrel-list
              action-text="Add a feed version editor"
              :action-info="permLevels('editor')"
              :entrels="perms.users.editors"
              :can-add="perms.actions.can_edit_members"
              :can-remove="perms.actions.can_edit_members"
              :show-groups="true"
              :show-tenants="true"
              @add-permissions="addPermissions('editor', $event)"
              @remove-permissions="removePermissions('editor', $event)"
            />
          </td>
        </tr>

        <!-- Viewers -->
        <tr v-if="perms.actions.can_edit_members || perms.users.viewers?.length > 0">
          <th>Viewers</th>
          <td>
            <tl-apps-admin-entrel-list
              action-text="Add a feed version viewer"
              :action-info="permLevels('viewer')"
              :entrels="perms.users.viewers"
              :can-add="perms.actions.can_edit_members"
              :can-remove="perms.actions.can_edit_members"
              :show-groups="true"
              :show-tenants="true"
              @add-permissions="addPermissions('viewer', $event)"
              @remove-permissions="removePermissions('viewer', $event)"
            />
          </td>
        </tr>

        <!-- Note -->
        <tr>
          <th />
          <td class="has-text-grey is-size-7">
            * Permissions are additive with permissions defined by feed and group (not shown)
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { useAdminFetch, fetchAdmin } from './useAdminApi'
import { useAuthz } from './useAuthz'

const props = withDefaults(defineProps<{
  id: string | number
  client?: string
}>(), {
  client: 'default'
})

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const changed = () => {
  refresh()
  emit('changed')
}

defineExpose({ changed })

const { getObjectType, getRelation } = useAuthz()

const feedVersionQuery = gql`
  query($ids: [Int!]!) {
    feed_versions(ids: $ids) {
      id
      name
      sha1
      description
    }
  }
`

// Apollo for feed version details
const { result: fvData, error: fvError } = useQuery(feedVersionQuery, () => ({ ids: [props.id] }), { clientId: props.client, fetchPolicy: 'no-cache' })
const fv = computed(() => fvData.value?.feed_versions?.[0] || null)

// Admin API for permissions
const { data: perms, pending: fetchPending, error: fetchError, refresh } = await useAdminFetch<any>(() => `/feed_versions/${props.id}`)

const submitting = ref(false)
const actionError = ref<any>(null)

const loading = computed({
  get: () => fetchPending.value || submitting.value,
  set: (_v) => { /* handle if needed */ }
})

const error = computed(() => fvError.value || fetchError.value || actionError.value)

const permLevels = (lvl: string) => {
  return {
    can_edit: ['manager', 'editor'].includes(lvl),
    can_view: ['manager', 'editor', 'viewer'].includes(lvl),
    can_edit_members: ['manager'].includes(lvl)
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
    await fetchAdmin(`/feed_versions/${props.id}/permissions`, { method: 'POST', body: data })
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
    await fetchAdmin(`/feed_versions/${props.id}/permissions`, { method: 'DELETE', body: data })
    refresh()
  } catch (e) {
    actionError.value = e
  } finally {
    submitting.value = false
  }
}
</script>
