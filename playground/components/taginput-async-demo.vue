<template>
  <div>
    <p class="mb-4">
      Search for users from a mock API. Selections trigger server actions with loading states.
    </p>

    <t-field label="Team Members">
      <div class="async-taginput-wrapper" :class="{ 'is-processing': actionPending }">
        <t-taginput
          v-model="selected"
          v-model:input="searchText"
          :options="options"
          :loading="loading"
          placeholder="Type to search users..."
          icon="account-search"
          variant="primary"
          fullwidth
          :max-tags="5"
        >
          <template #option="{ option }">
            <div class="is-flex is-align-items-center">
              <span class="t-avatar is-small mr-2">{{ option.avatar }}</span>
              <div>
                <div>{{ option.label }}</div>
                <div class="has-text-grey is-size-7">
                  {{ option.email }}
                </div>
              </div>
            </div>
          </template>
          <template #tag="{ tag }">
            <span class="t-avatar is-tiny mr-1">{{ tag.avatar }}</span>
            {{ tag.label }}
          </template>
          <template #empty>
            <span v-if="searchText">No users found for "{{ searchText }}"</span>
            <span v-else>Type to search...</span>
          </template>
        </t-taginput>
        <div v-if="actionPending" class="processing-indicator">
          <span class="icon"><i class="mdi mdi-loading mdi-spin" /></span>
          <span>Saving...</span>
        </div>
      </div>
    </t-field>

    <!-- Activity Log -->
    <div class="box mt-4">
      <p class="has-text-weight-semibold mb-2">
        <span class="icon"><i class="mdi mdi-history" /></span>
        Activity Log
      </p>
      <div class="activity-log">
        <div
          v-for="(entry, idx) in recentActivityLog"
          :key="idx"
          class="activity-entry"
          :class="entry ? entry.type : 'placeholder'"
        >
          <template v-if="entry">
            <span class="activity-time">{{ entry.time }}</span>
            <span class="activity-message">{{ entry.message }}</span>
            <span v-if="entry.pending" class="icon is-small">
              <i class="mdi mdi-loading mdi-spin" />
            </span>
            <span v-else-if="entry.success" class="icon is-small has-text-success">
              <i class="mdi mdi-check" />
            </span>
            <span v-else-if="entry.success === false" class="icon is-small has-text-danger">
              <i class="mdi mdi-close" />
            </span>
          </template>
          <template v-else>
            <span class="activity-placeholder">&nbsp;</span>
          </template>
        </div>
      </div>
    </div>

    <p class="has-text-grey mt-3 is-size-7">
      Selected IDs: {{ selected }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

/**
 * Demo component showing async API integration with taginput.
 * Demonstrates debounced search, server actions, and loading states.
 *
 * @component TaginputAsyncDemo
 */

interface UserOption {
  value: number
  label: string
  email: string
  avatar: string
}

interface ActivityEntry {
  time: string
  message: string
  type: 'search' | 'select' | 'remove'
  pending?: boolean
  success?: boolean
}

const ACTIVITY_LOG_SIZE = 8

const selected = ref<number[]>([])
const searchText = ref('')
const searchResults = ref<UserOption[]>([])
const loading = ref(false)
const activityLog = ref<ActivityEntry[]>([])

// Track selected users for display (since API only returns search results)
const selectedUsers = ref<Map<number, UserOption>>(new Map())

// Merge selected users with search results so taginput always has full option data
const options = computed(() => {
  const selectedArray = Array.from(selectedUsers.value.values())
  const searchFiltered = searchResults.value.filter(
    u => !selected.value.includes(u.value)
  )
  return [...selectedArray, ...searchFiltered]
})

// Check if any action is pending
const actionPending = computed(() => {
  return activityLog.value.some(entry => entry.pending)
})

// Return last 8 entries, padded with nulls to maintain fixed height
const recentActivityLog = computed(() => {
  const recent = activityLog.value.slice(-ACTIVITY_LOG_SIZE)
  const padded: (ActivityEntry | null)[] = []
  for (let i = 0; i < ACTIVITY_LOG_SIZE - recent.length; i++) {
    padded.push(null)
  }
  return [...padded, ...recent]
})

function getTimeString (): string {
  return new Date().toLocaleTimeString()
}

function addLogEntry (entry: Omit<ActivityEntry, 'time'>): number {
  const idx = activityLog.value.length
  activityLog.value.push({ ...entry, time: getTimeString() })
  return idx
}

function updateLogEntry (idx: number, updates: Partial<ActivityEntry>) {
  if (activityLog.value[idx]) {
    Object.assign(activityLog.value[idx], updates)
  }
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchText, (query) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!query.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    loading.value = true
    const logIdx = addLogEntry({
      message: `Searching for "${query}"...`,
      type: 'search',
      pending: true
    })

    try {
      const results = await $fetch<UserOption[]>('/api/users/search', {
        query: { q: query }
      })

      searchResults.value = results

      updateLogEntry(logIdx, {
        message: `Found ${results.length} users for "${query}"`,
        pending: false,
        success: true
      })
    } catch (error) {
      updateLogEntry(logIdx, {
        message: `Search failed: ${error}`,
        pending: false,
        success: false
      })
    } finally {
      loading.value = false
    }
  }, 300)
})

// Watch for selection changes to trigger server actions
watch(selected, async (newVal, oldVal) => {
  const added = newVal.filter(id => !oldVal.includes(id))
  const removed = oldVal.filter(id => !newVal.includes(id))

  // Handle additions
  for (const userId of added) {
    const user = searchResults.value.find(u => u.value === userId)
    if (user) {
      selectedUsers.value.set(userId, user)
    }

    const userName = selectedUsers.value.get(userId)?.label || `User ${userId}`
    const logIdx = addLogEntry({
      message: `Adding ${userName} to team...`,
      type: 'select',
      pending: true
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    updateLogEntry(logIdx, {
      message: `Added ${userName} to team`,
      pending: false,
      success: true
    })
  }

  // Handle removals
  for (const userId of removed) {
    const userName = selectedUsers.value.get(userId)?.label || `User ${userId}`
    const logIdx = addLogEntry({
      message: `Removing ${userName} from team...`,
      type: 'remove',
      pending: true
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    updateLogEntry(logIdx, {
      message: `Removed ${userName} from team`,
      pending: false,
      success: true
    })

    selectedUsers.value.delete(userId)
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.t-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--bulma-primary);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;

  &.is-small {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }

  &.is-tiny {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.625rem;
  }
}

.activity-log {
  font-size: 0.875rem;
}

.activity-entry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 1.75rem;
  border-bottom: 1px solid var(--bulma-border-weak);

  &:last-child {
    border-bottom: none;
  }

  &.placeholder {
    visibility: hidden;
  }

  .activity-time {
    color: var(--bulma-text-weak);
    font-size: 0.75rem;
    min-width: 5rem;
  }

  .activity-message {
    flex: 1;
  }

  &.search .activity-message {
    color: var(--bulma-info);
  }

  &.select .activity-message {
    color: var(--bulma-success);
  }

  &.remove .activity-message {
    color: var(--bulma-warning);
  }
}

.async-taginput-wrapper {
  position: relative;

  &.is-processing {
    opacity: 0.7;
    pointer-events: none;
  }
}

.processing-indicator {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: var(--bulma-primary);
  background: var(--bulma-scheme-main);
  border-radius: var(--bulma-radius);
}
</style>
