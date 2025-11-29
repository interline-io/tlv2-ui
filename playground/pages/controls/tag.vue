<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tag Component
      </h1>
      <p class="subtitle">
        Small label components for categorization
      </p>

      <div class="content">
        <!-- Basic Tags -->
        <h2 class="title is-3">
          Basic Tags
        </h2>
        <div class="box">
          <t-tag>
            Tag label
          </t-tag>
        </div>

        <!-- Variants -->
        <h2 class="title is-3">
          Variants
        </h2>
        <div class="box">
          <div class="tags">
            <t-tag>
              Default
            </t-tag>
            <t-tag variant="primary">
              Primary
            </t-tag>
            <t-tag variant="link">
              Link
            </t-tag>
            <t-tag variant="info">
              Info
            </t-tag>
            <t-tag variant="success">
              Success
            </t-tag>
            <t-tag variant="warning">
              Warning
            </t-tag>
            <t-tag variant="danger">
              Danger
            </t-tag>
            <t-tag variant="light">
              Light
            </t-tag>
            <t-tag variant="dark">
              Dark
            </t-tag>
          </div>
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <div class="tags">
            <t-tag size="small">
              Small
            </t-tag>
            <t-tag>
              Normal
            </t-tag>
            <t-tag size="medium">
              Medium
            </t-tag>
            <t-tag size="large">
              Large
            </t-tag>
          </div>
        </div>

        <!-- Rounded Tags -->
        <h2 class="title is-3">
          Rounded Tags
        </h2>
        <div class="box">
          <div class="tags">
            <t-tag rounded>
              Rounded
            </t-tag>
            <t-tag rounded variant="primary">
              Primary
            </t-tag>
            <t-tag rounded variant="info">
              Info
            </t-tag>
            <t-tag rounded variant="success">
              Success
            </t-tag>
            <t-tag rounded variant="warning">
              Warning
            </t-tag>
            <t-tag rounded variant="danger">
              Danger
            </t-tag>
          </div>
        </div>

        <!-- Deletable Tags -->
        <h2 class="title is-3">
          Deletable Tags
        </h2>
        <div class="box">
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
        </div>

        <!-- Light Variants -->
        <h2 class="title is-3">
          Light Variants
        </h2>
        <div class="box">
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
        </div>

        <!-- Tag Combinations -->
        <h2 class="title is-3">
          Tag Combinations
        </h2>
        <div class="box">
          <div class="field is-grouped is-grouped-multiline">
            <div class="control">
              <div class="tags has-addons">
                <t-tag>
                  npm
                </t-tag>
                <t-tag variant="success">
                  v1.2.3
                </t-tag>
              </div>
            </div>
            <div class="control">
              <div class="tags has-addons">
                <t-tag>
                  build
                </t-tag>
                <t-tag variant="success">
                  passing
                </t-tag>
              </div>
            </div>
            <div class="control">
              <div class="tags has-addons">
                <t-tag>
                  chat
                </t-tag>
                <t-tag variant="primary">
                  discord
                </t-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Tags -->
        <h2 class="title is-3">
          Status Indicators
        </h2>
        <div class="box">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Website Redesign</td>
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
                <td>Mobile App</td>
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
                <td>API Integration</td>
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
                <td>Documentation</td>
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
        </div>

        <!-- Category Tags -->
        <h2 class="title is-3">
          Article Categories
        </h2>
        <div class="box">
          <article class="media">
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>Getting Started with Vue 3</strong>
                  <br>
                  Learn the basics of Vue 3 and the Composition API
                </p>
                <div class="tags">
                  <t-tag variant="info" size="small">
                    Tutorial
                  </t-tag>
                  <t-tag variant="success" size="small">
                    Beginner
                  </t-tag>
                  <t-tag variant="primary" size="small">
                    Vue
                  </t-tag>
                  <t-tag variant="primary" size="small">
                    JavaScript
                  </t-tag>
                </div>
              </div>
            </div>
          </article>

          <article class="media">
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>Advanced TypeScript Patterns</strong>
                  <br>
                  Deep dive into advanced TypeScript features and patterns
                </p>
                <div class="tags">
                  <t-tag variant="info" size="small">
                    Article
                  </t-tag>
                  <t-tag variant="danger" size="small">
                    Advanced
                  </t-tag>
                  <t-tag variant="primary" size="small">
                    TypeScript
                  </t-tag>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Interactive Tag Filter -->
        <h2 class="title is-3">
          Interactive Filter
        </h2>
        <div class="box">
          <p class="mb-3">
            <strong>Filter by technology:</strong>
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
            Select a technology to filter
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const technologies = ['Vue', 'React', 'Angular', 'Svelte', 'TypeScript', 'JavaScript']
const activeTech = ref<string | null>(null)
</script>
