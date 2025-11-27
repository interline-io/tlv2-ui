<template>
  <div>
    <div v-if="!hideRoot && node">
      <span v-if="!hasChildren" class="indent-spacer">&nbsp;</span>
      <span v-else-if="expanded" class="button indent-buttons is-small" @click="toggleExpand">-</span>
      <span v-else class="button indent-buttons is-small" @click="toggleExpand">+</span>
      <!-- @vue-skip -->
      <t-checkbox
        :model-value="node.selected"
        :indeterminate="node.indet"
        @update:model-value="select(Array.isArray($event) ? $event[0] : $event, node.key)"
      >
        <span :class="node.opts?.style">
          {{ node.name }}
          <tl-route-category v-if="node.opts.routeCategory" :show-category="node.opts.showCategory" :category="node.opts.routeCategory" :subcategory="node.opts.routeSubcategory" />
        </span>
      </t-checkbox>
    </div>
    <div v-if="expanded">
      <div
        v-for="g of node.children"
        :key="g.key"
      >
        <div
          :class="hideRoot ? '' : 'indented'"
        >
          <tl-tree-control
            :node="g"
            :max-deep="maxDeep - 1"
            @select="select"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '../lib/tree'

interface Props {
  node?: TreeNode
  maxDeep?: number
  hideRoot?: boolean
}

interface Emits {
  (e: 'unselect', value: boolean, key: string): void
  (e: 'select', value: boolean, key: string): void
}

const props = withDefaults(defineProps<Props>(), {
  node: () => ({} as TreeNode),
  maxDeep: 10,
  hideRoot: false
})

const emit = defineEmits<Emits>()

const expanded = ref(props.maxDeep > 0)
const hasChildren = computed(() => Object.keys(props.node?.children || {}).length > 0)

function select (v: boolean | undefined, key: string): void {
  if (v !== undefined) {
    emit('select', v, key)
  }
}

function toggleExpand (): void {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.bold {
  font-weight:bold
}
.indent-buttons {
  padding:0px;
  margin:0px;
  height:15px;
  width:15px;

}
.indented {
  margin-left:30px;
}
.checkbox {
  padding:0px;
  margin:0px;
  height:inherit;
}
</style>
