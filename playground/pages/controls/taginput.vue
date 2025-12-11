<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Taginput Component
      </h1>
      <p class="subtitle">
        Tag input with autocomplete dropdown for selecting multiple values
      </p>

      <!-- Basic Taginput -->
      <t-demo-box label="Basic Taginput">
        <t-taginput
          v-model="basicSelected"
          :options="fruitOptions"
          placeholder="Select fruits..."
        />
        <p class="has-text-grey mt-3">
          Selected: {{ basicSelected }}
        </p>
      </t-demo-box>

      <!-- With Icon -->
      <t-demo-box label="With Icon">
        <t-taginput
          v-model="iconSelected"
          :options="fruitOptions"
          icon="magnify"
          placeholder="Search fruits..."
        />
      </t-demo-box>

      <!-- Open on Focus -->
      <t-demo-box label="Open on Focus">
        <t-taginput
          v-model="focusSelected"
          :options="fruitOptions"
          placeholder="Click to see options..."
          open-on-focus
        />
      </t-demo-box>

      <!-- Variants -->
      <t-demo-box label="Tag Variants">
        <div v-for="variant in variants" :key="variant" class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            {{ capitalize(variant) }}
          </p>
          <t-taginput
            v-model="variantValues[variant]"
            :options="colorOptions"
            :variant="variant"
            placeholder="Select colors..."
          />
        </div>
      </t-demo-box>

      <!-- Sizes -->
      <t-demo-box label="Sizes">
        <div v-for="taginputSize in sizes" :key="taginputSize" class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            {{ capitalize(taginputSize) }}
          </p>
          <t-taginput
            v-model="sizeValues[taginputSize]"
            :options="fruitOptions"
            :size="taginputSize"
            placeholder="Select..."
          />
        </div>
      </t-demo-box>

      <!-- Rounded -->
      <t-demo-box label="Rounded Style">
        <t-taginput
          v-model="roundedSelected"
          :options="fruitOptions"
          placeholder="Rounded tags..."
          rounded
        />
      </t-demo-box>

      <!-- Fullwidth -->
      <t-demo-box label="Fullwidth">
        <t-taginput
          v-model="fullwidthSelected"
          :options="fruitOptions"
          placeholder="Full width input..."
          fullwidth
        />
      </t-demo-box>

      <!-- Disabled -->
      <t-demo-box label="Disabled">
        <t-taginput
          v-model="disabledSelected"
          :options="fruitOptions"
          placeholder="Cannot edit..."
          disabled
        />
      </t-demo-box>

      <!-- Readonly -->
      <t-demo-box label="Readonly">
        <t-taginput
          v-model="readonlySelected"
          :options="fruitOptions"
          placeholder="View only..."
          readonly
        />
        <p class="has-text-grey mt-3">
          Tags are visible but cannot be added or removed
        </p>
      </t-demo-box>

      <!-- Max Tags -->
      <t-demo-box label="Max Tags Limit">
        <t-taginput
          v-model="maxTagsSelected"
          :options="fruitOptions"
          placeholder="Select up to 3 fruits..."
          :max-tags="3"
          open-on-focus
        />
        <p class="has-text-grey mt-3">
          Limited to 3 selections. Counter shows progress and input hides when max is reached.
        </p>
      </t-demo-box>

      <!-- Not Closable -->
      <t-demo-box label="Non-closable Tags">
        <t-taginput
          v-model="notClosableSelected"
          :options="fruitOptions"
          placeholder="Tags cannot be removed..."
          :closable="false"
        />
      </t-demo-box>

      <!-- Custom Slots -->
      <t-demo-box label="Custom Slots">
        <t-taginput
          v-model="customSelected"
          :options="userOptions"
          placeholder="Search users..."
          open-on-focus
          icon="account"
        >
          <template #tag="{ tag }">
            <span class="icon is-small mr-1">
              <i class="mdi mdi-account" />
            </span>
            {{ tag.label }}
          </template>
          <template #option="{ option }">
            <div class="is-flex is-align-items-center">
              <span class="icon is-small mr-2">
                <i class="mdi mdi-account-circle" />
              </span>
              <span>{{ option.label }}</span>
              <span class="has-text-grey ml-2 is-size-7">@{{ option.username }}</span>
            </div>
          </template>
          <template #empty>
            <span class="has-text-grey">No users found</span>
          </template>
        </t-taginput>
        <p class="has-text-grey mt-3">
          Selected user IDs: {{ customSelected }}
        </p>
      </t-demo-box>

      <!-- With Search Filtering -->
      <t-demo-box label="With Search Filtering">
        <t-taginput
          v-model="searchSelected"
          v-model:input="searchText"
          :options="countryOptions"
          placeholder="Type to search countries..."
          icon="earth"
        />
        <p class="has-text-grey mt-3">
          Search text: "{{ searchText }}"
        </p>
      </t-demo-box>

      <!-- Example: Async API Integration -->
      <t-demo-box label="Example: Async API Integration" example>
        <TaginputAsyncDemo />
      </t-demo-box>

      <!-- Example: Form Integration -->
      <t-demo-box label="Example: Form Integration" example>
        <form @submit.prevent="handleSubmit">
          <t-field label="Project Name">
            <t-input v-model="form.name" placeholder="Enter project name" />
          </t-field>
          <t-field label="Tags">
            <t-taginput
              v-model="form.tags"
              :options="tagOptions"
              placeholder="Add tags..."
              open-on-focus
              fullwidth
            />
          </t-field>
          <t-field label="Collaborators">
            <t-taginput
              v-model="form.collaborators"
              :options="userOptions"
              placeholder="Add team members..."
              variant="success"
              icon="account-group"
              open-on-focus
              fullwidth
            />
          </t-field>
          <div class="buttons">
            <t-button variant="primary" type="submit">
              Save Project
            </t-button>
            <t-button @click="resetForm">
              Reset
            </t-button>
          </div>
        </form>
        <div v-if="submitted" class="notification is-success is-light mt-4">
          <p><strong>Form submitted!</strong></p>
          <pre>{{ JSON.stringify(form, null, 2) }}</pre>
        </div>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { TaginputVariants, TaginputSizes } from '../../../src/runtime/controls/types'
import TaginputAsyncDemo from '../../components/taginput-async-demo.vue'
import TDemoBox from '../../components/t-demo-box.vue'

const variants = TaginputVariants
const sizes = TaginputSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// Options data
const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' }
]

const colorOptions = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' }
]

const userOptions = [
  { value: 1, label: 'Alice Johnson', username: 'alice' },
  { value: 2, label: 'Bob Smith', username: 'bob' },
  { value: 3, label: 'Carol Davis', username: 'carol' },
  { value: 4, label: 'David Wilson', username: 'david' },
  { value: 5, label: 'Eve Brown', username: 'eve' }
]

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' }
]

const tagOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Design' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' }
]

// Demo states
const basicSelected = ref<string[]>(['apple', 'banana'])
const iconSelected = ref<string[]>([])
const focusSelected = ref<string[]>([])
const roundedSelected = ref<string[]>(['cherry'])
const fullwidthSelected = ref<string[]>([])
const disabledSelected = ref<string[]>(['apple', 'banana'])
const readonlySelected = ref<string[]>(['apple', 'cherry', 'grape'])
const maxTagsSelected = ref<string[]>(['apple'])
const notClosableSelected = ref<string[]>(['apple'])
const customSelected = ref<number[]>([1, 3])
const searchSelected = ref<string[]>([])
const searchText = ref('')

const variantValues = reactive<Record<string, string[]>>({})
for (const v of variants) {
  variantValues[v] = ['red']
}

const sizeValues = reactive<Record<string, string[]>>({})
for (const s of sizes) {
  sizeValues[s] = ['apple']
}

// Form example
const form = reactive({
  name: '',
  tags: [] as (string | number)[],
  collaborators: [] as (string | number)[]
})
const submitted = ref(false)

function handleSubmit () {
  submitted.value = true
}

function resetForm () {
  form.name = ''
  form.tags = []
  form.collaborators = []
  submitted.value = false
}
</script>
