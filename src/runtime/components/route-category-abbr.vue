<template>
  <div>
    <span
      class="abbr tooltip"
      v-bind="{ 'data-tooltip': rcDesc }"
    >
      {{ rc?.name }}
    </span>
    <span
      v-if="rsc && showSubcategory"
      class="abbr tooltip"
      v-bind="{ 'data-tooltip': rscDesc }"
    >&nbsp;/ {{ rsc?.name }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from '~/src/runtime/components/utils/tree'
import { useRouteCategories } from '~/src/runtime/composables/useRouteCategories'

const { getRouteCategory, getRouteSubcategory } = useRouteCategories()

interface Props {
  category?: number | null
  subcategory?: number | null
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

<style scoped>
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: normal;
  width: max-content;
  max-width: 300px;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
}

.tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 2px;
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
}

.tooltip:hover::after,
.tooltip:hover::before {
  opacity: 1;
  visibility: visible;
}
</style>
