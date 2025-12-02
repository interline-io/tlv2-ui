<template>
  <div>
    <div v-if="!hideRoot && node" class="tree-row">
      <span v-if="!hasChildren" class="indent-spacer" aria-hidden="true" />
      <button
        v-else
        type="button"
        class="expand-button"
        :class="expanded ? 'expand-button-down' : 'expand-button-right'"
        :aria-expanded="expanded"
        :aria-label="expandButtonLabel"
        :title="expandButtonLabel"
        @click="toggleExpand"
        @keydown.enter="toggleExpand"
        @keydown.space.prevent="toggleExpand"
      />
      <t-checkbox
        :model-value="node.selected"
        :indeterminate="node.indet"
        @update:model-value="select(Array.isArray($event) ? $event[0] : $event, node.key)"
      >
        <span :class="node.opts?.style" class="tree-node-label">
          <span v-if="node.opts?.isFeedVersion" class="feed-version-display">
            <span class="feed-version-primary">{{ node.name }}</span>
            <span class="feed-version-meta">
              <span v-if="node.opts.feedVersionSecondary" class="feed-version-secondary">{{ node.opts.feedVersionSecondary }}</span>
              <a
                v-if="node.opts.feedOnestopId && node.opts.feedVersionSha1"
                :href="`/feeds/${node.opts.feedOnestopId}/versions/${node.opts.feedVersionSha1}`"
                target="_blank"
                rel="noopener noreferrer"
                class="feed-link-icon"
                title="View feed version"
                @click.stop
                @keydown.enter.stop
                @keydown.space.stop
              >
                <t-icon icon="open-in-new" size="small" />
              </a>
            </span>
          </span>
          <template v-else>
            {{ node.name }}
          </template>
          <tl-route-category v-if="node.opts?.routeCategory" :show-category="node.opts?.showCategory" :category="node.opts?.routeCategory" :subcategory="node.opts?.routeSubcategory" />
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
const expandButtonLabel = computed(() => {
  const action = expanded.value ? 'Collapse' : 'Expand'
  const nodeName = props.node?.name || 'item'
  return `${action} ${nodeName}`
})

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
  width: 0.75rem;
  flex-shrink: 0;
}

.expand-button {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  font: inherit;
  color: inherit;
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

.expand-button:focus {
  outline: 2px solid #3273dc;
  outline-offset: 2px;
  border-radius: 2px;
}

.indented {
  margin-left: 30px;
}

.checkbox {
  padding: 0px;
  margin: 0px;
  height: inherit;
}

.tree-node-label {
  flex: 1;
  min-width: 0;
}

.feed-version-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

.feed-version-primary {
  font-weight: bold;
  flex-shrink: 0;
}

.feed-version-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: auto;
}

.feed-version-secondary {
  font-size: 0.75rem;
  color: #666;
  font-weight: normal;
  white-space: nowrap;
}

.feed-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #666;
  opacity: 0.6;
  transition: opacity 0.2s;
  text-decoration: none;
}

.feed-link-icon:hover {
  opacity: 1;
  color: #3273dc;
}
</style>
