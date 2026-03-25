<template>
  <div class="admin-feed">
    <t-loading :active="loading" :full-page="false" />

    <t-notification v-if="error" variant="danger">
      Error: {{ error }}
    </t-notification>

    <table v-else-if="feed" class="admin-detail-table">
      <tbody>
        <!-- Feed name -->
        <tr>
          <th>Feed name</th>
          <td>{{ feed.feed.name || '(unnamed)' }}</td>
        </tr>

        <!-- Onestop ID -->
        <tr>
          <th>Onestop ID</th>
          <td><code>{{ feed.feed.onestop_id }}</code></td>
        </tr>

        <!-- Group -->
        <tr>
          <th>Group</th>
          <td>
            <div class="is-flex is-align-items-center" style="gap: 0.5em;">
              <span>{{ feed.group?.name || '(none)' }}</span>
              <tl-link
                v-if="feed.group"
                class="button is-small"
                route-key="apps-admin-groups-groupKey"
                :to="{ params: { groupKey: feed.group.id } }"
              >
                View group
              </tl-link>
              <t-button
                v-if="feed.actions.can_set_group"
                size="small"
                @click="showAssignGroup = true"
              >
                Set group
              </t-button>
            </div>
          </td>
        </tr>

        <!-- Your permissions -->
        <tr>
          <th>Your permissions</th>
          <td>
            <tl-apps-admin-perm-list :actions="feed.actions" />
          </td>
        </tr>
      </tbody>
    </table>

    <t-modal
      v-model="showAssignGroup"
      title="Set group"
    >
      <tl-apps-admin-entrel-search
        :show-users="false"
        :show-groups="true"
        @select="showAssignGroup = false; setGroup($event)"
      />
    </t-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUser } from '../../composables/useUser'
import { useAdminFetch, fetchAdmin } from './useAdminApi'

const props = defineProps<{
  id: string | number
}>()

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const showAssignGroup = ref(false)
const user = useUser()

const { data: feed, pending: fetchPending, error: fetchError, refresh } = useAdminFetch<any>(() => `/feeds/${props.id}`)

const submitting = ref(false)
const actionError = ref<any>(null)

const loading = computed({
  get: () => fetchPending.value || submitting.value,
  set: (_v) => { /* handle if needed */ }
})

const error = computed(() => fetchError.value || actionError.value)

const setGroup = async (value: any) => {
  const data = { group_id: value.id }
  submitting.value = true
  try {
    await fetchAdmin(`/feeds/${props.id}/group`, { method: 'POST', body: data })
    changed()
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

defineExpose({ changed })
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
