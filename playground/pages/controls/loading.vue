<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Loading Component
      </h1>
      <p class="subtitle">
        Loading indicators and spinners
      </p>

      <t-demo-box label="Basic Loading Spinner">
        <div class="has-text-centered">
          <t-loading />
        </div>
      </t-demo-box>

      <t-demo-box label="Inline Loading">
        <p class="is-flex is-align-items-center">
          <t-loading />
          <span class="ml-3">Loading data...</span>
        </p>
      </t-demo-box>

      <t-demo-box label="Loading Overlay">
        <div style="position: relative; min-height: 200px;">
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
      </t-demo-box>

      <t-demo-box label="Loading in Buttons">
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
      </t-demo-box>

      <t-demo-box label="Full Page Loading">
        <p class="mb-3">
          Click the button to show a full-page loading overlay
        </p>
        <t-button variant="primary" @click="showFullPageLoading">
          Show Full Page Loading
        </t-button>
      </t-demo-box>

      <t-demo-box label="Loading States">
        <t-button variant="primary" @click="loadData">
          Load Data
        </t-button>
        <div v-if="dataLoading" class="mt-3">
          <div class="is-flex is-align-items-center">
            <t-loading />
            <span class="ml-3">Loading data...</span>
          </div>
        </div>
        <div v-else-if="dataLoaded" class="mt-3">
          <div class="notification is-success is-light">
            <t-icon icon="check-circle" />
            Data loaded successfully!
          </div>
        </div>
      </t-demo-box>

      <!-- Full Page Loading Overlay -->
      <div v-if="fullPageLoading" class="full-page-overlay">
        <div class="has-text-centered">
          <t-loading />
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
