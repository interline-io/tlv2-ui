<template>
  <div class="admin-entity-list">
    <!-- Header: click to toggle, shows count -->
    <div class="admin-entity-list-header" @click="expanded = !expanded">
      <span class="admin-entity-list-toggle">
        <t-icon :icon="expanded ? 'chevron-down' : 'chevron-right'" size="small" />
      </span>
      <span class="has-text-grey">
        {{ items.length }} {{ items.length === 1 ? itemLabel : itemLabelPlural }}
      </span>
    </div>

    <div v-if="expanded">
      <!-- Search (only shown for lists with enough items) -->
      <div v-if="items.length > searchThreshold" class="mb-2">
        <t-input
          v-model="searchQuery"
          size="small"
          placeholder="Filter..."
        />
      </div>

      <!-- Table -->
      <table v-if="filteredItems.length" class="table is-fullwidth is-hoverable is-narrow">
        <thead>
          <tr>
            <slot name="header" />
          </tr>
        </thead>
        <tbody>
          <template v-for="item of filteredItems" :key="item.id">
            <slot name="row" :item="item" />
          </template>
        </tbody>
      </table>
      <span v-else-if="searchQuery" class="has-text-grey is-size-7">No matches for "{{ searchQuery }}"</span>
      <span v-else class="has-text-grey">(none)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  items: any[]
  itemLabel?: string
  itemLabelPlural?: string
  searchFields?: string[]
  collapseThreshold?: number
  searchThreshold?: number
}>(), {
  itemLabel: 'item',
  itemLabelPlural: 'items',
  searchFields: () => ['name'],
  collapseThreshold: 8,
  searchThreshold: 8
})

const searchQuery = ref('')
const expanded = ref(props.items.length <= props.collapseThreshold)

const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return props.items
  }
  const q = searchQuery.value.toLowerCase()
  return props.items.filter((item) => {
    return props.searchFields.some((field) => {
      const val = item[field]
      return val && String(val).toLowerCase().includes(q)
    })
  })
})
</script>

<style scoped>
.admin-entity-list-header {
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  padding: 0.25em 0;
}

.admin-entity-list-header:hover {
  color: #363636;
}

.admin-entity-list-toggle {
  display: inline-flex;
  width: 1.25em;
}
</style>
