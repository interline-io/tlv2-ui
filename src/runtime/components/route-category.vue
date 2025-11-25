<template>
  <span>
    <o-tooltip
      v-if="rc && showCategory"
      multiline
      class="rc-tooltip"
    >
      {{ rc?.name }}
      <template #content>
        {{ rcDesc }}
      </template>
    </o-tooltip>
    <span v-if="rc && showCategory && rsc && showSubcategory"> / </span>
    <o-tooltip
      v-if="rsc && showSubcategory"
      multiline
      class="rc-tooltip"
    >
      {{ rsc.name }}
      <template #content>
        {{ rscDesc }}
      </template>
    </o-tooltip>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from '../components/utils/tree'
import { useRouteCategories } from '../composables/useRouteCategories'

const { getRouteCategory, getRouteSubcategory } = useRouteCategories()

interface Props {
  category?: number | string | null
  subcategory?: number | string | null
  showCategory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  category: null,
  subcategory: null,
  showCategory: true
})

const rc = computed<TreeNode | undefined>(() =>
  getRouteCategory(props.category ?? 'unknown')
)

const rsc = computed<TreeNode | undefined>(() =>
  (props.category != null && props.subcategory != null)
    ? (getRouteSubcategory(props.category, props.subcategory) ?? undefined)
    : undefined
)

const rcDesc = computed<string>(() =>
  `The route category is ${rc.value?.name}. ${rc.value?.desc}`
)

const rscDesc = computed<string>(() =>
  `The route sub-category is ${rsc.value?.name}. ${rsc.value?.desc}`
)

const showSubcategory = computed<boolean>(() =>
  Object.keys(rc.value?.children || {}).length > 1
)
</script>

<style>
.rc-tooltip .tooltip-content {
  white-space: normal;
  word-wrap: break-word;
  width: 300px !important;
}
</style>
