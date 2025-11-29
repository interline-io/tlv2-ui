<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Loading Component
      </h1>
      <p class="subtitle">
        Loading indicators and spinners
      </p>

      <div class="content">
        <!-- Basic Loading -->
        <h2 class="title is-3">
          Basic Loading Spinner
        </h2>
        <div class="box has-text-centered">
          <t-loading />
        </div>

        <!-- Inline Loading -->
        <h2 class="title is-3">
          Inline Loading
        </h2>
        <div class="box">
          <p class="is-flex is-align-items-center">
            <t-loading inline />
            <span class="ml-3">Loading data...</span>
          </p>
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <div class="is-flex is-align-items-center is-justify-content-space-around">
            <div class="has-text-centered">
              <t-loading size="small" />
              <p class="mt-2 is-size-7">
                Small
              </p>
            </div>
            <div class="has-text-centered">
              <t-loading />
              <p class="mt-2 is-size-7">
                Normal
              </p>
            </div>
            <div class="has-text-centered">
              <t-loading size="medium" />
              <p class="mt-2 is-size-7">
                Medium
              </p>
            </div>
            <div class="has-text-centered">
              <t-loading size="large" />
              <p class="mt-2 is-size-7">
                Large
              </p>
            </div>
          </div>
        </div>

        <!-- Loading Overlay -->
        <h2 class="title is-3">
          Loading Overlay
        </h2>
        <div class="box" style="position: relative; min-height: 200px;">
          <div v-if="overlayLoading" class="loading-overlay">
            <t-loading />
          </div>
          <div :class="{ 'is-invisible': overlayLoading }">
            <h3 class="subtitle">
              Content Section
            </h3>
            <p>
              This content is hidden when loading is active.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <t-button class="mt-3" @click="toggleOverlay">
            {{ overlayLoading ? 'Stop Loading' : 'Start Loading' }}
          </t-button>
        </div>

        <!-- Loading in Buttons -->
        <h2 class="title is-3">
          Loading in Buttons
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button variant="primary" :loading="buttonLoading" @click="simulateAction">
              {{ buttonLoading ? '' : 'Submit' }}
            </t-button>
            <t-button variant="info" :loading="buttonLoading2" @click="simulateAction2">
              {{ buttonLoading2 ? '' : 'Save' }}
            </t-button>
            <t-button variant="success" :loading="buttonLoading3" @click="simulateAction3">
              {{ buttonLoading3 ? '' : 'Download' }}
            </t-button>
          </div>
        </div>

        <!-- Full Page Loading -->
        <h2 class="title is-3">
          Full Page Loading
        </h2>
        <div class="box">
          <p class="mb-3">
            Click the button to show a full-page loading overlay
          </p>
          <t-button variant="primary" @click="showFullPageLoading">
            Show Full Page Loading
          </t-button>
        </div>

        <!-- Loading States -->
        <h2 class="title is-3">
          Loading States
        </h2>
        <div class="box">
          <t-button variant="primary" @click="loadData">
            Load Data
          </t-button>
          <div v-if="dataLoading" class="mt-3">
            <div class="is-flex is-align-items-center">
              <t-loading inline />
              <span class="ml-3">Loading data...</span>
            </div>
          </div>
          <div v-else-if="dataLoaded" class="mt-3">
            <div class="notification is-success is-light">
              <t-icon icon="check-circle" />
              Data loaded successfully!
            </div>
          </div>
        </div>

        <!-- Loading with Message -->
        <h2 class="title is-3">
          Loading with Message
        </h2>
        <div class="box has-text-centered">
          <t-loading />
          <p class="mt-3 has-text-grey">
            Please wait while we process your request...
          </p>
        </div>

        <!-- Card Loading State -->
        <h2 class="title is-3">
          Card Loading State
        </h2>
        <div class="columns">
          <div class="column">
            <t-card>
              <div class="card-content" style="min-height: 150px; position: relative;">
                <div v-if="cardLoading1" class="loading-overlay">
                  <t-loading />
                </div>
                <div :class="{ 'is-invisible': cardLoading1 }">
                  <p class="title is-4">
                    Card 1
                  </p>
                  <p>
                    Content for the first card.
                  </p>
                </div>
              </div>
              <template #footer>
                <a href="#" class="card-footer-item" @click.prevent="toggleCard1">
                  {{ cardLoading1 ? 'Stop' : 'Load' }}
                </a>
              </template>
            </t-card>
          </div>
          <div class="column">
            <t-card>
              <div class="card-content" style="min-height: 150px; position: relative;">
                <div v-if="cardLoading2" class="loading-overlay">
                  <t-loading />
                </div>
                <div :class="{ 'is-invisible': cardLoading2 }">
                  <p class="title is-4">
                    Card 2
                  </p>
                  <p>
                    Content for the second card.
                  </p>
                </div>
              </div>
              <template #footer>
                <a href="#" class="card-footer-item" @click.prevent="toggleCard2">
                  {{ cardLoading2 ? 'Stop' : 'Load' }}
                </a>
              </template>
            </t-card>
          </div>
        </div>

        <!-- Table Loading -->
        <h2 class="title is-3">
          Table Loading State
        </h2>
        <div class="box">
          <t-button variant="info" class="mb-3" @click="toggleTableLoading">
            {{ tableLoading ? 'Stop Loading' : 'Load Table Data' }}
          </t-button>
          <div style="position: relative; min-height: 200px;">
            <div v-if="tableLoading" class="loading-overlay">
              <t-loading />
            </div>
            <table :class="{ 'is-invisible': tableLoading }" class="table is-fullwidth">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>
                    <t-tag variant="success">
                      Active
                    </t-tag>
                  </td>
                  <td>2024-01-15</td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>
                    <t-tag variant="warning">
                      Pending
                    </t-tag>
                  </td>
                  <td>2024-01-16</td>
                </tr>
                <tr>
                  <td>Bob Johnson</td>
                  <td>
                    <t-tag variant="success">
                      Active
                    </t-tag>
                  </td>
                  <td>2024-01-17</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Full Page Loading Overlay -->
      <div v-if="fullPageLoading" class="full-page-overlay">
        <div class="has-text-centered">
          <t-loading size="large" />
          <p class="mt-4 has-text-white has-text-weight-bold">
            Processing...
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const overlayLoading = ref(false)
const buttonLoading = ref(false)
const buttonLoading2 = ref(false)
const buttonLoading3 = ref(false)
const dataLoading = ref(false)
const dataLoaded = ref(false)
const cardLoading1 = ref(false)
const cardLoading2 = ref(false)
const tableLoading = ref(false)
const fullPageLoading = ref(false)

const toggleOverlay = () => {
  overlayLoading.value = !overlayLoading.value
}

const simulateAction = () => {
  buttonLoading.value = true
  setTimeout(() => {
    buttonLoading.value = false
  }, 2000)
}

const simulateAction2 = () => {
  buttonLoading2.value = true
  setTimeout(() => {
    buttonLoading2.value = false
  }, 2000)
}

const simulateAction3 = () => {
  buttonLoading3.value = true
  setTimeout(() => {
    buttonLoading3.value = false
  }, 2000)
}

const loadData = () => {
  dataLoading.value = true
  dataLoaded.value = false
  setTimeout(() => {
    dataLoading.value = false
    dataLoaded.value = true
  }, 2000)
}

const toggleCard1 = () => {
  cardLoading1.value = !cardLoading1.value
}

const toggleCard2 = () => {
  cardLoading2.value = !cardLoading2.value
}

const toggleTableLoading = () => {
  tableLoading.value = !tableLoading.value
}

const showFullPageLoading = () => {
  fullPageLoading.value = true
  setTimeout(() => {
    fullPageLoading.value = false
  }, 3000)
}
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.full-page-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
