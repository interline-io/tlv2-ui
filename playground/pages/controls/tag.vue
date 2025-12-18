<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tag Component
      </h1>
      <p class="subtitle">
        Small label components for categorization
      </p>

      <t-demo-box label="Basic Tag">
        <t-tag>
          Tag label
        </t-tag>
      </t-demo-box>

      <t-demo-box label="Variants">
        <div class="tags">
          <t-tag>
            Default
          </t-tag>
          <t-tag v-for="variant in variants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </t-tag>
        </div>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <div class="tags">
          <t-tag v-for="size in sizes" :key="size" :size="size">
            {{ capitalize(size) }}
          </t-tag>
        </div>
      </t-demo-box>

      <t-demo-box label="Rounded">
        <div class="tags">
          <t-tag rounded>
            Rounded
          </t-tag>
          <t-tag v-for="variant in roundedVariants" :key="variant" rounded :variant="variant">
            {{ capitalize(variant) }}
          </t-tag>
        </div>
      </t-demo-box>

      <t-demo-box label="Closable Tags">
        <p class="mb-3">
          Selected tags: {{ selectedTags.join(', ') || 'None' }}
        </p>
        <div class="tags">
          <t-tag v-if="selectedTags.includes('javascript')" closable @close="removeTag('javascript')">
            JavaScript
          </t-tag>
          <t-tag v-if="selectedTags.includes('vue')" closable variant="success" @close="removeTag('vue')">
            Vue
          </t-tag>
          <t-tag v-if="selectedTags.includes('typescript')" closable variant="info" @close="removeTag('typescript')">
            TypeScript
          </t-tag>
          <t-tag v-if="selectedTags.includes('nuxt')" closable variant="primary" @close="removeTag('nuxt')">
            Nuxt
          </t-tag>
        </div>
        <t-button size="small" @click="resetTags">
          Reset Tags
        </t-button>
      </t-demo-box>

      <t-demo-box label="Light Variants">
        <div class="tags">
          <t-tag variant="primary" light>
            Primary
          </t-tag>
          <t-tag variant="info" light>
            Info
          </t-tag>
          <t-tag variant="success" light>
            Success
          </t-tag>
          <t-tag variant="warning" light>
            Warning
          </t-tag>
          <t-tag variant="danger" light>
            Danger
          </t-tag>
        </div>
      </t-demo-box>

      <t-demo-box label="Tag Combinations">
        <div class="field is-grouped is-grouped-multiline">
          <div class="control">
            <div class="tags has-addons">
              <t-tag>
                Package
              </t-tag>
              <t-tag variant="success">
                v1.0.0
              </t-tag>
            </div>
          </div>
          <div class="control">
            <div class="tags has-addons">
              <t-tag>
                Status
              </t-tag>
              <t-tag variant="success">
                Active
              </t-tag>
            </div>
          </div>
          <div class="control">
            <div class="tags has-addons">
              <t-tag>
                Type
              </t-tag>
              <t-tag variant="primary">
                Feature
              </t-tag>
            </div>
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Example: Delete Tag Combinations" example>
        <p class="mb-3">
          Selected items (click X to remove):
        </p>
        <div class="field is-grouped is-grouped-multiline">
          <div v-for="item in selectedItems" :key="item.id" class="control">
            <div class="tags has-addons">
              <t-tag :variant="item.variant">
                {{ item.label }}
              </t-tag>
              <t-tag is-delete @click="removeItem(item.id)" />
            </div>
          </div>
        </div>
        <t-button v-if="selectedItems.length === 0" size="small" @click="resetItems">
          Reset Items
        </t-button>
      </t-demo-box>

      <t-demo-box label="Example: Status Indicators" example>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Item 1</td>
              <td>
                <t-tag variant="success">
                  Active
                </t-tag>
              </td>
              <td>
                <t-tag variant="danger">
                  High
                </t-tag>
              </td>
            </tr>
            <tr>
              <td>Item 2</td>
              <td>
                <t-tag variant="warning">
                  In Review
                </t-tag>
              </td>
              <td>
                <t-tag variant="warning">
                  Medium
                </t-tag>
              </td>
            </tr>
            <tr>
              <td>Item 3</td>
              <td>
                <t-tag variant="info">
                  Planning
                </t-tag>
              </td>
              <td>
                <t-tag variant="info">
                  Low
                </t-tag>
              </td>
            </tr>
            <tr>
              <td>Item 4</td>
              <td>
                <t-tag>
                  On Hold
                </t-tag>
              </td>
              <td>
                <t-tag variant="info">
                  Low
                </t-tag>
              </td>
            </tr>
          </tbody>
        </table>
      </t-demo-box>

      <t-demo-box label="Example: Category Tags" example>
        <article class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>Article Title</strong>
                <br>
                Article description text goes here
              </p>
              <div class="tags">
                <t-tag variant="info" size="small">
                  Category
                </t-tag>
                <t-tag variant="success" size="small">
                  Level
                </t-tag>
                <t-tag variant="primary" size="small">
                  Topic 1
                </t-tag>
                <t-tag variant="primary" size="small">
                  Topic 2
                </t-tag>
              </div>
            </div>
          </div>
        </article>

        <article class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>Another Article</strong>
                <br>
                Another article description text
              </p>
              <div class="tags">
                <t-tag variant="info" size="small">
                  Category
                </t-tag>
                <t-tag variant="danger" size="small">
                  Level
                </t-tag>
                <t-tag variant="primary" size="small">
                  Topic
                </t-tag>
              </div>
            </div>
          </div>
        </article>
      </t-demo-box>

      <t-demo-box label="Example: Interactive Filter" example>
        <p class="mb-3">
          <strong>Filter by category:</strong>
        </p>
        <div class="tags mb-4">
          <t-tag
            v-for="tech in technologies"
            :key="tech"
            :variant="activeTech === tech ? 'primary' : undefined"
            style="cursor: pointer"
            @click="activeTech = tech"
          >
            {{ tech }}
          </t-tag>
          <t-tag
            v-if="activeTech"
            variant="danger"
            style="cursor: pointer"
            @click="activeTech = null"
          >
            Clear filter
          </t-tag>
        </div>
        <p v-if="activeTech" class="notification is-info is-light">
          Showing results for: <strong>{{ activeTech }}</strong>
        </p>
        <p v-else class="has-text-grey">
          Select a category to filter
        </p>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TagVariants, TagSizes } from '../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const variants = TagVariants
const sizes = TagSizes
const roundedVariants = ['primary', 'info', 'success', 'warning', 'danger'] as const

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const selectedTags = ref(['javascript', 'vue', 'typescript', 'nuxt'])

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const resetTags = () => {
  selectedTags.value = ['javascript', 'vue', 'typescript', 'nuxt']
}

const technologies = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6']
const activeTech = ref<string | null>(null)

const selectedItems = ref([
  { id: 1, label: 'Item 1', variant: 'primary' as const },
  { id: 2, label: 'Item 2', variant: 'info' as const },
  { id: 3, label: 'Item 3', variant: 'success' as const },
  { id: 4, label: 'Item 4', variant: 'warning' as const }
])

const removeItem = (id: number) => {
  const index = selectedItems.value.findIndex(item => item.id === id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
}

const resetItems = () => {
  selectedItems.value = [
    { id: 1, label: 'Item 1', variant: 'primary' as const },
    { id: 2, label: 'Item 2', variant: 'info' as const },
    { id: 3, label: 'Item 3', variant: 'success' as const },
    { id: 4, label: 'Item 4', variant: 'warning' as const }
  ]
}
</script>
