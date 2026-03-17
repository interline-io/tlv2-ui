<template>
  <span>
    <t-tooltip
      v-if="rc && showCategory"
      class="rc-tooltip"
      :text="rcDesc"
    >
      {{ rc?.name }}
    </t-tooltip>
    <span v-if="rc && showCategory && rsc && showSubcategory"> / </span>
    <t-tooltip
      v-if="rsc && showSubcategory"
      class="rc-tooltip"
      :text="rscDesc"
    >
      {{ rsc.name }}
    </t-tooltip>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from '../lib/util/tree'
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
