<template>
  <nav class="pagination" :class="paginationClasses" role="navigation" aria-label="pagination">
    <button
      type="button"
      class="pagination-previous"
      :disabled="isFirst"
      @click="changePage(current - 1)"
    >
      <t-icon icon="chevron-left" />
    </button>
    <button
      type="button"
      class="pagination-next"
      :disabled="isLast"
      @click="changePage(current + 1)"
    >
      <t-icon icon="chevron-right" />
    </button>
    <ul class="pagination-list">
      <!-- First page -->
      <li v-if="hasFirst">
        <button type="button" class="pagination-link" @click="changePage(1)">
          1
        </button>
      </li>
      <li v-if="hasFirstEllipsis">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>

      <!-- Pages in range -->
      <li v-for="page in pagesInRange" :key="page">
        <button
          type="button"
          class="pagination-link"
          :class="{ 'is-current': page === current }"
          :aria-current="page === current ? 'page' : undefined"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- Last page -->
      <li v-if="hasLastEllipsis">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li v-if="hasLast">
        <button type="button" class="pagination-link" @click="changePage(pageCount)">
          {{ pageCount }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PaginationSize, PaginationPosition } from './types'

/**
 * Pagination component with Bulma styling.
 * Provides navigation between pages of content.
 *
 * @component t-pagination
 * @example
 * <t-pagination v-model:current="page" :total="100" :per-page="10" />
 * <t-pagination v-model:current="page" :total="500" size="small" position="centered" />
 */

defineOptions({
  inheritAttrs: true
})

interface Props {
  /**
   * Total number of items to paginate.
   */
  total: number

  /**
   * Number of items per page.
   * @default 20
   */
  perPage?: number

  /**
   * Position of the pagination using Bulma alignment classes.
   * @default 'right'
   */
  position?: PaginationPosition

  /**
   * Size of the pagination using Bulma size classes.
   * @default undefined (normal size)
   */
  size?: PaginationSize

  /**
   * Number of page links to show before the current page.
   * @default 1
   */
  rangeBefore?: number

  /**
   * Number of page links to show after the current page.
   * @default 1
   */
  rangeAfter?: number

  /**
   * Use rounded pagination style.
   * @default false
   */
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 20,
  position: 'right',
  size: undefined,
  rangeBefore: 1,
  rangeAfter: 1,
  rounded: false
})

const current = defineModel<number>('current', { default: 1 })

const pageCount = computed(() => Math.ceil(props.total / props.perPage))

const isFirst = computed(() => current.value <= 1)
const isLast = computed(() => current.value >= pageCount.value)

const hasFirst = computed(() => current.value >= props.rangeBefore + 2)
const hasFirstEllipsis = computed(() => current.value >= props.rangeBefore + 4)

const hasLast = computed(() => current.value <= pageCount.value - (1 + props.rangeAfter))
const hasLastEllipsis = computed(() => current.value < pageCount.value - (2 + props.rangeAfter))

const pagesInRange = computed(() => {
  let left = Math.max(1, current.value - props.rangeBefore)
  if (left - 1 === 2) left--

  let right = Math.min(current.value + props.rangeAfter, pageCount.value)
  if (pageCount.value - right === 2) right++

  const pages: number[] = []
  for (let i = left; i <= right; i++) {
    pages.push(i)
  }
  return pages
})

const paginationClasses = computed(() => {
  const classes: string[] = []

  if (props.position) {
    classes.push(`is-${props.position}`)
  }

  if (props.size) {
    classes.push(`is-${props.size}`)
  }

  if (props.rounded) {
    classes.push('is-rounded')
  }

  return classes
})

function changePage (page: number) {
  if (page >= 1 && page <= pageCount.value) {
    current.value = page
  }
}
</script>

<style scoped>
.pagination-previous,
.pagination-next,
.pagination-link {
  cursor: pointer;
}

.pagination-previous:disabled,
.pagination-next:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
