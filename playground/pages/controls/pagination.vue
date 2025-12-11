<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Pagination Component
      </h1>
      <p class="subtitle">
        Navigation for paginated content with page numbers and controls
      </p>

      <!-- Basic Pagination -->
      <t-demo-box label="Basic Pagination">
        <t-pagination v-model:current="basicPage" :total="100" :per-page="10" />
        <p class="has-text-grey mt-3">
          Current page: {{ basicPage }}
        </p>
      </t-demo-box>

      <!-- Positions -->
      <t-demo-box label="Positions">
        <div class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            Left
          </p>
          <t-pagination v-model:current="positionPage" :total="100" :per-page="10" position="left" />
        </div>
        <div class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            Centered
          </p>
          <t-pagination v-model:current="positionPage" :total="100" :per-page="10" position="centered" />
        </div>
        <div>
          <p class="has-text-weight-semibold mb-2">
            Right (default)
          </p>
          <t-pagination v-model:current="positionPage" :total="100" :per-page="10" position="right" />
        </div>
      </t-demo-box>

      <!-- Sizes -->
      <t-demo-box label="Sizes">
        <div v-for="paginationSize in sizes" :key="paginationSize" class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            {{ capitalize(paginationSize) }}
          </p>
          <t-pagination v-model:current="sizePage" :total="100" :per-page="10" :size="paginationSize" />
        </div>
      </t-demo-box>

      <!-- Rounded -->
      <t-demo-box label="Rounded">
        <t-pagination v-model:current="roundedPage" :total="100" :per-page="10" rounded />
      </t-demo-box>

      <!-- Custom Range -->
      <t-demo-box label="Custom Range">
        <div class="mb-4">
          <p class="has-text-weight-semibold mb-2">
            Range Before: 2, Range After: 2
          </p>
          <t-pagination v-model:current="rangePage" :total="200" :per-page="10" :range-before="2" :range-after="2" />
        </div>
        <div>
          <p class="has-text-weight-semibold mb-2">
            Range Before: 3, Range After: 3
          </p>
          <t-pagination v-model:current="rangePage" :total="200" :per-page="10" :range-before="3" :range-after="3" />
        </div>
        <p class="has-text-grey mt-3">
          Current page: {{ rangePage }}
        </p>
      </t-demo-box>

      <!-- Large Dataset -->
      <t-demo-box label="Large Dataset">
        <t-pagination v-model:current="largePage" :total="1000" :per-page="25" />
        <p class="has-text-grey mt-3">
          Page {{ largePage }} of {{ Math.ceil(1000 / 25) }} ({{ 1000 }} total items)
        </p>
      </t-demo-box>

      <!-- Custom Per Page -->
      <t-demo-box label="Custom Items Per Page">
        <div class="mb-4">
          <div class="buttons">
            <t-button
              v-for="perPage in [5, 10, 25, 50]"
              :key="perPage"
              :variant="customPerPage === perPage ? 'primary' : undefined"
              :outlined="customPerPage !== perPage"
              @click="customPerPage = perPage"
            >
              {{ perPage }}
            </t-button>
          </div>
        </div>
        <t-pagination v-model:current="customPage" :total="100" :per-page="customPerPage" />
        <p class="has-text-grey mt-3">
          Showing page {{ customPage }} with {{ customPerPage }} items per page ({{ Math.ceil(100 / customPerPage) }} total pages)
        </p>
      </t-demo-box>

      <!-- Example: Data Table -->
      <t-demo-box label="Example: Data Table with Pagination" example>
        <t-table :data="paginatedData">
          <template #columns>
            <t-table-column field="id" label="ID" />
            <t-table-column field="name" label="Name" />
            <t-table-column field="email" label="Email" />
          </template>
          <template #default="{ row }">
            <td>{{ row.id }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.email }}</td>
          </template>
        </t-table>
        <div class="mt-4">
          <t-pagination v-model:current="tablePage" :total="tableData.length" :per-page="tablePerPage" position="centered" />
        </div>
        <p class="has-text-grey has-text-centered mt-2">
          Showing {{ (tablePage - 1) * tablePerPage + 1 }} - {{ Math.min(tablePage * tablePerPage, tableData.length) }} of {{ tableData.length }} items
        </p>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PaginationSizes } from '../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const sizes = PaginationSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// Demo states
const basicPage = ref(1)
const positionPage = ref(5)
const sizePage = ref(3)
const roundedPage = ref(1)
const rangePage = ref(10)
const largePage = ref(1)
const customPage = ref(1)
const customPerPage = ref(10)

// Table example
const tablePage = ref(1)
const tablePerPage = 5

const tableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com' },
  { id: 6, name: 'Diana Miller', email: 'diana@example.com' },
  { id: 7, name: 'Edward Davis', email: 'edward@example.com' },
  { id: 8, name: 'Fiona Garcia', email: 'fiona@example.com' },
  { id: 9, name: 'George Martinez', email: 'george@example.com' },
  { id: 10, name: 'Helen Anderson', email: 'helen@example.com' },
  { id: 11, name: 'Ivan Taylor', email: 'ivan@example.com' },
  { id: 12, name: 'Julia Thomas', email: 'julia@example.com' },
  { id: 13, name: 'Kevin Jackson', email: 'kevin@example.com' },
  { id: 14, name: 'Laura White', email: 'laura@example.com' },
  { id: 15, name: 'Michael Harris', email: 'michael@example.com' }
]

const paginatedData = computed(() => {
  const start = (tablePage.value - 1) * tablePerPage
  const end = start + tablePerPage
  return tableData.slice(start, end)
})
</script>
