<template>
  <div class="table-container">
    <div style="display: none;">
      <slot name="columns" />
    </div>
    <table class="table" :class="tableClasses">
      <thead v-if="hasHeader">
        <tr>
          <slot name="header" :columns="columns" :sort="handleSort">
            <th
              v-for="column in columns"
              :key="column.field"
              :class="getHeaderClasses(column)"
              @click="column.sortable ? handleSort(column.field) : null"
            >
              {{ column.label }}
              <span v-if="column.sortable" class="sort-icon">
                <i v-if="sortField === column.field" :class="sortIcon" />
                <i v-else class="mdi mdi-sort" />
              </span>
            </th>
          </slot>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!sortedData.length">
          <td :colspan="columns.length" class="has-text-centered">
            <slot name="empty">
              No data available
            </slot>
          </td>
        </tr>
        <tr v-for="(row, index) in sortedData" :key="index">
          <slot :row="row" :index="index" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'

interface Column {
  field: string
  label: string
  sortable?: boolean
  numeric?: boolean
}

interface Props {
  /**
   * Array of data to display in the table.
   */
  data?: any[]

  /**
   * Whether the table has narrow spacing.
   * @default false
   */
  narrowed?: boolean

  /**
   * Whether the table has striped rows.
   * @default false
   */
  striped?: boolean

  /**
   * Whether the table is bordered.
   * @default false
   */
  bordered?: boolean

  /**
   * Whether the table is hoverable.
   * @default false
   */
  hoverable?: boolean

  /**
   * Default sort field and direction [field, 'asc' | 'desc'].
   */
  defaultSort?: [string, 'asc' | 'desc']
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  narrowed: false,
  striped: false,
  bordered: false,
  hoverable: false,
  defaultSort: undefined
})

const columns = ref<Column[]>([])
const sortField = ref<string | null>(props.defaultSort?.[0] || null)
const sortDirection = ref<'asc' | 'desc'>(props.defaultSort?.[1] || 'asc')

const hasHeader = computed(() => columns.value.length > 0)

const tableClasses = computed(() => {
  const classes: string[] = []

  if (props.narrowed) {
    classes.push('is-narrow')
  }

  if (props.striped) {
    classes.push('is-striped')
  }

  if (props.bordered) {
    classes.push('is-bordered')
  }

  if (props.hoverable) {
    classes.push('is-hoverable')
  }

  classes.push('is-fullwidth')

  return classes
})

const sortIcon = computed(() => {
  return sortDirection.value === 'asc' ? 'mdi mdi-sort-ascending' : 'mdi mdi-sort-descending'
})

const sortedData = computed(() => {
  if (!sortField.value) {
    return props.data
  }

  const field = sortField.value
  const direction = sortDirection.value

  return [...props.data].sort((a, b) => {
    // Handle nested fields like "level.level_index"
    const aVal = getNestedValue(a, field)
    const bVal = getNestedValue(b, field)

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return direction === 'asc' ? 1 : -1
    if (bVal == null) return direction === 'asc' ? -1 : 1

    // Compare values
    let comparison = 0
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal
    } else {
      comparison = String(aVal).localeCompare(String(bVal))
    }

    return direction === 'asc' ? comparison : -comparison
  })
})

function getNestedValue (obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function getHeaderClasses (column: Column) {
  const classes: string[] = []

  if (column.sortable) {
    classes.push('is-sortable')
  }

  if (column.numeric) {
    classes.push('has-text-right')
  }

  return classes
}

function handleSort (field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function registerColumn (column: Column) {
  const existing = columns.value.find(col => col.field === column.field)
  if (!existing) {
    columns.value.push(column)
  }
}

// Provide registration function for columns
provide('registerColumn', registerColumn)
</script>

<style scoped>
th.is-sortable {
  cursor: pointer;
  user-select: none;
}

th.is-sortable:hover {
  background-color: #f5f5f5;
}

.sort-icon {
  margin-left: 0.25rem;
}

.sort-icon .mdi {
  font-size: 1rem;
  vertical-align: middle;
}
</style>
