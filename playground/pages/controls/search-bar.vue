<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Search Bar Component
      </h1>
      <p class="subtitle">
        Search input with suggestions and filtering
      </p>

      <div class="content">
        <!-- Basic Search Bar -->
        <h2 class="title is-3">
          Basic Search Bar
        </h2>
        <div class="box">
          <t-search-bar v-model="basicSearch" placeholder="Search..." />
          <p class="has-text-grey mt-3">
            Search query: {{ basicSearch || 'None' }}
          </p>
        </div>

        <!-- With Icon -->
        <h2 class="title is-3">
          With Search Icon
        </h2>
        <div class="box">
          <t-search-bar v-model="iconSearch" placeholder="Search products..." icon="magnify" />
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <t-search-bar v-model="sizeSmall" placeholder="Small search" size="small" class="mb-3" />
          <t-search-bar v-model="sizeNormal" placeholder="Normal search" class="mb-3" />
          <t-search-bar v-model="sizeMedium" placeholder="Medium search" size="medium" class="mb-3" />
          <t-search-bar v-model="sizeLarge" placeholder="Large search" size="large" />
        </div>

        <!-- Rounded Style -->
        <h2 class="title is-3">
          Rounded Style
        </h2>
        <div class="box">
          <t-search-bar v-model="roundedSearch" placeholder="Rounded search..." rounded icon="magnify" />
        </div>

        <!-- Loading State -->
        <h2 class="title is-3">
          Loading State
        </h2>
        <div class="box">
          <t-search-bar v-model="loadingSearch" placeholder="Search..." loading icon="magnify" />
          <p class="has-text-grey mt-3">
            Shows a loading spinner while fetching results
          </p>
        </div>

        <!-- With Clear Button -->
        <h2 class="title is-3">
          With Clear Button
        </h2>
        <div class="box">
          <t-search-bar v-model="clearableSearch" placeholder="Search..." clearable icon="magnify" />
        </div>

        <!-- Full Width -->
        <h2 class="title is-3">
          Full Width
        </h2>
        <div class="box">
          <t-search-bar v-model="fullWidthSearch" placeholder="Search across the entire site..." expanded icon="magnify" />
        </div>

        <!-- Interactive Search -->
        <h2 class="title is-3">
          Interactive Search with Results
        </h2>
        <div class="box">
          <t-search-bar
            v-model="interactiveSearch"
            placeholder="Search products..."
            icon="magnify"
            clearable
            @input="handleSearch"
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
        </div>

        <!-- Search with Filters -->
        <h2 class="title is-3">
          Search with Filters
        </h2>
        <div class="box">
          <div class="field has-addons">
            <div class="control is-expanded">
              <t-search-bar v-model="filterSearch" placeholder="Search..." icon="magnify" />
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
        </div>

        <!-- Navbar Search -->
        <h2 class="title is-3">
          Navbar Search
        </h2>
        <div class="box">
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
                  <t-search-bar v-model="navbarSearch" placeholder="Search..." size="small" icon="magnify" />
                </div>
              </div>
            </div>
          </nav>
        </div>

        <!-- Search Suggestions -->
        <h2 class="title is-3">
          With Suggestions
        </h2>
        <div class="box">
          <t-search-bar
            v-model="suggestionSearch"
            placeholder="Type to see suggestions..."
            icon="magnify"
            clearable
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
        </div>

        <!-- Advanced Search -->
        <h2 class="title is-3">
          Advanced Search Form
        </h2>
        <div class="box">
          <t-search-bar v-model="advancedSearch" placeholder="Search..." icon="magnify" clearable class="mb-4" />
          <div v-if="showAdvancedOptions" class="content">
            <p class="has-text-weight-bold">
              Advanced Options:
            </p>
            <div class="columns">
              <div class="column">
                <t-field label="Category:">
                  <t-select v-model="advancedCategory" expanded>
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
                  <t-select v-model="advancedDateRange" expanded>
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
        </div>

        <!-- Real-time Search -->
        <h2 class="title is-3">
          Real-time Search
        </h2>
        <div class="box">
          <p class="mb-3">
            Search updates as you type
          </p>
          <t-search-bar
            v-model="realtimeSearch"
            placeholder="Search users..."
            icon="account-search"
            clearable
            @input="handleRealtimeSearch"
          />
          <div v-if="isSearching" class="mt-3">
            <div class="is-flex is-align-items-center">
              <t-loading inline />
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
                    <t-tag size="small">
                      {{ user.role }}
                    </t-tag>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const basicSearch = ref('')
const iconSearch = ref('')
const sizeSmall = ref('')
const sizeNormal = ref('')
const sizeMedium = ref('')
const sizeLarge = ref('')
const roundedSearch = ref('')
const loadingSearch = ref('')
const clearableSearch = ref('Sample text')
const fullWidthSearch = ref('')
const navbarSearch = ref('')

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
  const query = interactiveSearch.value.toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
})

const handleSearch = () => {
  // Search handler
}

const filterSearch = ref('')
const filterCategory = ref('')

const suggestionSearch = ref('')
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
  const query = suggestionSearch.value.toLowerCase()
  return allSuggestions.filter(s => s.includes(query)).slice(0, 5)
})

const applySuggestion = (suggestion: string) => {
  suggestionSearch.value = suggestion
}

const advancedSearch = ref('')
const showAdvancedOptions = ref(false)
const advancedCategory = ref('')
const advancedDateRange = ref('any')
const advancedExact = ref(false)

const realtimeSearch = ref('')
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
    const query = realtimeSearch.value.toLowerCase()
    realtimeResults.value = allUsers.filter(u =>
      u.name.toLowerCase().includes(query)
      || u.email.toLowerCase().includes(query)
      || u.role.toLowerCase().includes(query))
    isSearching.value = false
  }, 500)
}
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
