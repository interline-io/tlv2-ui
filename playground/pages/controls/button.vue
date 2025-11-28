<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Button Component
      </h1>
      <p class="subtitle">
        Interactive button control with various styles and states
      </p>

      <div class="content">
        <!-- Variants -->
        <h2 class="title is-3">
          Variants
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button>
              Default
            </t-button>
            <t-button variant="primary">
              Primary
            </t-button>
            <t-button variant="info">
              Info
            </t-button>
            <t-button variant="success">
              Success
            </t-button>
            <t-button variant="warning">
              Warning
            </t-button>
            <t-button variant="danger">
              Danger
            </t-button>
            <t-button variant="light">
              Light
            </t-button>
            <t-button variant="dark">
              Dark
            </t-button>
          </div>
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button size="small">
              Small
            </t-button>
            <t-button>
              Normal
            </t-button>
            <t-button size="medium">
              Medium
            </t-button>
            <t-button size="large">
              Large
            </t-button>
          </div>
        </div>

        <!-- Outlined -->
        <h2 class="title is-3">
          Outlined
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button variant="primary" outlined>
              Primary
            </t-button>
            <t-button variant="info" outlined>
              Info
            </t-button>
            <t-button variant="success" outlined>
              Success
            </t-button>
            <t-button variant="warning" outlined>
              Warning
            </t-button>
            <t-button variant="danger" outlined>
              Danger
            </t-button>
          </div>
        </div>

        <!-- Rounded -->
        <h2 class="title is-3">
          Rounded
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button variant="primary" rounded>
              Rounded
            </t-button>
            <t-button variant="info" rounded outlined>
              Rounded Outlined
            </t-button>
          </div>
        </div>

        <!-- With Icons -->
        <h2 class="title is-3">
          With Icons
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button variant="primary">
              <t-icon icon="check" />
              <span>Save</span>
            </t-button>
            <t-button variant="danger">
              <t-icon icon="delete" />
              <span>Delete</span>
            </t-button>
            <t-button variant="info">
              <span>Download</span>
              <t-icon icon="download" />
            </t-button>
          </div>
        </div>

        <!-- Icon Only -->
        <h2 class="title is-3">
          Icon Only
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button variant="primary">
              <t-icon icon="heart" />
            </t-button>
            <t-button variant="info">
              <t-icon icon="share" />
            </t-button>
            <t-button variant="success">
              <t-icon icon="check" />
            </t-button>
            <t-button variant="warning">
              <t-icon icon="alert" />
            </t-button>
            <t-button variant="danger">
              <t-icon icon="close" />
            </t-button>
          </div>
        </div>

        <!-- States -->
        <h2 class="title is-3">
          States
        </h2>
        <div class="box">
          <div class="buttons">
            <t-button variant="primary" loading>
              Loading
            </t-button>
            <t-button variant="info" disabled>
              Disabled
            </t-button>
            <t-button variant="success" @click="handleClick">
              Click Me ({{ clickCount }})
            </t-button>
          </div>
        </div>

        <!-- Full Width -->
        <h2 class="title is-3">
          Full Width
        </h2>
        <div class="box">
          <t-button variant="primary" fullwidth>
            Full Width Button
          </t-button>
        </div>

        <!-- Grouped Buttons -->
        <h2 class="title is-3">
          Button Groups
        </h2>
        <div class="box">
          <div class="buttons has-addons">
            <t-button variant="primary">
              Left
            </t-button>
            <t-button variant="primary">
              Middle
            </t-button>
            <t-button variant="primary">
              Right
            </t-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clickCount = ref(0)

const handleClick = () => {
  clickCount.value++
}
</script>
