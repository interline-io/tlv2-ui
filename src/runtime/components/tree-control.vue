<template>
  <div>
    <div v-if="!hideRoot && node" class="tree-row">
      <span v-if="!hasChildren" class="indent-spacer">&nbsp;</span>
      <span
        v-else
        class="expand-button"
        :class="expanded ? 'expand-button-down' : 'expand-button-right'"
        :title="expanded ? 'Collapse' : 'Expand'"
        @click="toggleExpand"
      />
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
  font-weight: bold;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.indent-spacer {
  width: 1.125rem;
  display: inline-block;
  flex-shrink: 0;
}

.expand-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.expand-button-right::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 0.375rem solid #363636;
  border-top: 0.25rem solid transparent;
  border-bottom: 0.25rem solid transparent;
}

.expand-button-down::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 0.375rem solid #363636;
  border-left: 0.25rem solid transparent;
  border-right: 0.25rem solid transparent;
}

.expand-button:hover {
  opacity: 0.7;
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
