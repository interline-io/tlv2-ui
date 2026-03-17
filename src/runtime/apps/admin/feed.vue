<template>
  <div>
    <t-loading :active="loading" :full-page="false" />
    <t-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </t-notification>
    <div v-if="feed">
      <t-field label="Feed name" horizontal>
        {{ feed.feed.name }}
      </t-field>

      <t-field label="Feed ID" horizontal>
        {{ feed.feed.onestop_id }}
      </t-field>

      <t-field
        label="Group"
        horizontal
      >
        <tl-apps-admin-input
          :value="feed?.group?.name || 'Unnamed Group'"
          :link="true"
        >
          <template #link>
            <tl-link
              v-if="feed?.group"
              class="button is-small mr-2"
              route-key="apps-admin-groups-groupKey"
              :to="{ params: { groupKey: feed.group.id } }"
            >
              Show group
            </tl-link>
            <t-button
              v-if="feed.actions.can_set_group"
              size="small"
              @click="showAssignGroup = true"
            >
              Set group
            </t-button>
          </template>
        </tl-apps-admin-input>
      </t-field>

      <t-field label="Your permissions" horizontal>
        <div :title="`You are logged in as ${user.name} (${user.email})`">
          <tl-apps-admin-perm-list :actions="feed?.actions" />
        </div>
      </t-field>

      <t-modal
        v-model="showAssignGroup"
        :title="`Set group`"
      >
        <tl-apps-admin-entrel-search
          :show-users="false"
          :show-groups="true"
          @select="showAssignGroup = false; setGroup($event)"
        />
      </t-modal>
    </div>
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

const changed = () => {
  refresh()
  emit('changed')
}

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

defineExpose({ changed })
</script>
