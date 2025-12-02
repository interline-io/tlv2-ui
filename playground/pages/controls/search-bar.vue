<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Search Bar Component
      </h1>
      <p class="subtitle">
        Search input with suggestions and filtering
      </p>

      <t-demo-box label="Basic Search Bar">
        <t-search-bar v-model="basicSearch" placeholder="Search..." />
        <p class="has-text-grey mt-3">
          Search query: {{ basicSearch || 'None' }}
        </p>
      </t-demo-box>

      <t-demo-box label="Example: Interactive Search with Results" example>
        <t-search-bar
          v-model="interactiveSearch as string | null"
          placeholder="Search products..."
        />
        <div v-if="searchResults.length > 0" class="mt-4">
          <p class="has-text-weight-bold mb-3">
            Results ({{ searchResults.length }}):
          </p>
          <div class="list">
            <div v-for="result in searchResults" :key="result.id" class="list-item">
              <div class="is-flex is-justify-content-space-between is-align-items-center">
                <div>
                  <p class="has-text-weight-bold">
                    {{ result.name }}
                  </p>
                  <p class="is-size-7 has-text-grey">
                    {{ result.category }}
                  </p>
                </div>
                <t-tag :variant="result.inStock ? 'success' : 'danger'">
                  {{ result.inStock ? 'In Stock' : 'Out of Stock' }}
                </t-tag>
              </div>
            </div>
          </div>
        </div>
        <p v-else-if="interactiveSearch" class="has-text-grey mt-3">
          No results found
        </p>
      </t-demo-box>

      <t-demo-box label="Example: Search with Filters" example>
        <div class="field has-addons">
          <div class="control is-expanded">
            <t-search-bar v-model="filterSearch" placeholder="Search..." />
          </div>
          <div class="control">
            <t-select v-model="filterCategory">
              <option value="">
                All Categories
              </option>
              <option value="electronics">
                Electronics
              </option>
              <option value="clothing">
                Clothing
              </option>
              <option value="books">
                Books
              </option>
            </t-select>
          </div>
          <div class="control">
            <t-button variant="primary">
              <t-icon icon="magnify" />
            </t-button>
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Example: Navbar Search" example>
        <nav class="navbar is-light">
          <div class="navbar-brand">
            <a class="navbar-item" href="#">
              <strong>Logo</strong>
            </a>
          </div>
          <div class="navbar-menu">
            <div class="navbar-start">
              <a class="navbar-item" href="#">Home</a>
              <a class="navbar-item" href="#">Products</a>
              <a class="navbar-item" href="#">About</a>
            </div>
            <div class="navbar-end">
              <div class="navbar-item">
                <t-search-bar v-model="navbarSearch" placeholder="Search..." />
              </div>
            </div>
          </div>
        </nav>
      </t-demo-box>

      <t-demo-box label="Example: With Suggestions" example>
        <t-search-bar
          v-model="suggestionSearch"
          placeholder="Type to see suggestions..."
        />
        <div v-if="suggestionSearch && suggestions.length > 0" class="dropdown is-active" style="width: 100%;">
          <div class="dropdown-menu" style="width: 100%;">
            <div class="dropdown-content">
              <a
                v-for="suggestion in suggestions"
                :key="suggestion"
                href="#"
                class="dropdown-item"
                @click.prevent="applySuggestion(suggestion)"
              >
                <t-icon icon="magnify" class="mr-2" />
                {{ suggestion }}
              </a>
            </div>
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Example: Advanced Search Form" example>
        <t-search-bar v-model="advancedSearch" placeholder="Search..." class="mb-4" />
        <div v-if="showAdvancedOptions" class="content">
          <p class="has-text-weight-bold">
            Advanced Options:
          </p>
          <div class="columns">
            <div class="column">
              <t-field label="Category:">
                <t-select v-model="advancedCategory" fullwidth>
                  <option value="">
                    All
                  </option>
                  <option value="web">
                    Web
                  </option>
                  <option value="mobile">
                    Mobile
                  </option>
                  <option value="desktop">
                    Desktop
                  </option>
                </t-select>
              </t-field>
            </div>
            <div class="column">
              <t-field label="Date Range:">
                <t-select v-model="advancedDateRange" fullwidth>
                  <option value="any">
                    Any time
                  </option>
                  <option value="day">
                    Past 24 hours
                  </option>
                  <option value="week">
                    Past week
                  </option>
                  <option value="month">
                    Past month
                  </option>
                </t-select>
              </t-field>
            </div>
          </div>
          <t-field>
            <t-checkbox v-model="advancedExact">
              Exact match only
            </t-checkbox>
          </t-field>
        </div>
        <t-button size="small" @click="showAdvancedOptions = !showAdvancedOptions">
          {{ showAdvancedOptions ? 'Hide' : 'Show' }} Advanced Options
        </t-button>
      </t-demo-box>

      <t-demo-box label="Example: Real-time Search" example>
        <p class="mb-3">
          Search updates as you type
        </p>
        <t-search-bar
          v-model="realtimeSearch"
          placeholder="Search users..."
        />
        <div v-if="isSearching" class="mt-3">
          <div class="is-flex is-align-items-center">
            <t-loading />
            <span class="ml-3">Searching...</span>
          </div>
        </div>
        <div v-else-if="realtimeResults.length > 0" class="mt-3">
          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in realtimeResults" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <t-tag>
                    {{ user.role }}
                  </t-tag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const basicSearch = ref<string | null>('')
const navbarSearch = ref<string | null>('')

const interactiveSearch = ref('')
const products = [
  { id: 1, name: 'Laptop Computer', category: 'Electronics', inStock: true },
  { id: 2, name: 'Wireless Mouse', category: 'Electronics', inStock: true },
  { id: 3, name: 'Mechanical Keyboard', category: 'Electronics', inStock: false },
  { id: 4, name: 'USB Cable', category: 'Electronics', inStock: true },
  { id: 5, name: 'Monitor Stand', category: 'Accessories', inStock: true },
  { id: 6, name: 'Desk Lamp', category: 'Accessories', inStock: false }
]

const searchResults = computed(() => {
  if (!interactiveSearch.value) return []
  const query = (interactiveSearch.value || '').toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
})

const filterSearch = ref<string | null>('')
const filterCategory = ref<string | null>('')

const suggestionSearch = ref<string | null>('')
const allSuggestions = [
  'laptop computer',
  'laptop bag',
  'laptop stand',
  'wireless mouse',
  'wireless keyboard',
  'wireless headphones',
  'mechanical keyboard',
  'gaming keyboard'
]

const suggestions = computed(() => {
  if (!suggestionSearch.value) return []
  const query = (suggestionSearch.value || '').toLowerCase()
  return allSuggestions.filter(s => s.includes(query)).slice(0, 5)
})

const applySuggestion = (suggestion: string) => {
  suggestionSearch.value = suggestion
}

const advancedSearch = ref<string | null>('')
const showAdvancedOptions = ref(false)
const advancedCategory = ref<string | null>('')
const advancedDateRange = ref<string | null>('any')
const advancedExact = ref<boolean | any[]>(false)

const realtimeSearch = ref<string | null>('')
const isSearching = ref(false)
const allUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin' }
]

const realtimeResults = ref<typeof allUsers>([])

const handleRealtimeSearch = () => {
  if (!realtimeSearch.value) {
    realtimeResults.value = []
    return
  }

  isSearching.value = true
  setTimeout(() => {
    const query = realtimeSearch.value?.toLowerCase() || ''
    realtimeResults.value = allUsers.filter(u =>
      u.name.toLowerCase().includes(query)
      || u.email.toLowerCase().includes(query)
      || u.role.toLowerCase().includes(query))
    isSearching.value = false
  }, 500)
}

// Watch for changes and trigger search
watch(realtimeSearch, handleRealtimeSearch)
</script>

<style scoped>
.list {
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

.list-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dbdbdb;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background-color: #f5f5f5;
}
</style>
