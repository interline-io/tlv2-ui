<script setup lang="ts">
import { inject, onMounted } from 'vue'

interface Column {
  field: string
  label: string
  sortable: boolean
  numeric: boolean
}

interface Props {
  /**
   * The field name from the data object.
   */
  field?: string

  /**
   * The column header label.
   */
  label?: string

  /**
   * Whether the column is sortable.
   * @default false
   */
  sortable?: boolean

  /**
   * Whether the column contains numeric data.
   * @default false
   */
  numeric?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  field: '',
  label: '',
  sortable: false,
  numeric: false
})

type RegisterColumnFn = (column: Column) => void
const registerColumn = inject<RegisterColumnFn | undefined>('registerColumn')

onMounted(() => {
  if (registerColumn && props.field) {
    registerColumn({
      field: props.field,
      label: props.label,
      sortable: props.sortable,
      numeric: props.numeric
    })
  }
})
</script>

<template>
  <div style="display: none;">
    <!-- This component is used for registration only, renders via parent slot -->
  </div>
</template>
