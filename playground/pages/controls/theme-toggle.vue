<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Theme Toggle Component
      </h1>
      <p class="subtitle">
        Switch between light and dark themes
      </p>

      <div class="content">
        <!-- Basic Usage -->
        <h2 class="title is-3">
          Basic Usage
        </h2>
        <div class="box">
          <p class="mb-3">
            Click the button below to toggle between light and dark themes. The preference is saved to localStorage.
          </p>
          <t-theme-toggle />
        </div>

        <!-- Demo Content -->
        <h2 class="title is-3">
          Theme Preview
        </h2>
        <div class="box">
          <h3 class="subtitle is-5">
            Sample Content
          </h3>
          <p>
            This is regular paragraph text that adapts to the current theme.
          </p>
          <p class="has-text-grey">
            This is muted text using the <code>has-text-grey</code> class.
          </p>

          <div class="mt-4">
            <t-field label="Sample Input">
              <t-input v-model="sampleText" placeholder="Type something..." />
            </t-field>
          </div>

          <div class="mt-4">
            <t-field label="Sample Textarea">
              <t-textarea v-model="sampleTextarea" placeholder="Enter multiple lines..." />
            </t-field>
          </div>

          <div class="mt-4">
            <t-field label="Sample Select">
              <t-select v-model="sampleSelect">
                <option value="option1">
                  Option 1
                </option>
                <option value="option2">
                  Option 2
                </option>
                <option value="option3">
                  Option 3
                </option>
              </t-select>
            </t-field>
          </div>

          <div class="mt-4">
            <t-field>
              <t-checkbox v-model="sampleCheckbox">
                Sample checkbox
              </t-checkbox>
            </t-field>
          </div>

          <div class="mt-4 buttons">
            <t-button variant="primary">
              Primary Button
            </t-button>
            <t-button variant="info">
              Info Button
            </t-button>
            <t-button variant="success">
              Success Button
            </t-button>
            <t-button variant="warning">
              Warning Button
            </t-button>
            <t-button variant="danger">
              Danger Button
            </t-button>
          </div>
        </div>

        <!-- Cards -->
        <h2 class="title is-3">
          Card Examples
        </h2>
        <div class="columns">
          <div class="column">
            <t-card>
              <template #header>
                <p class="card-header-title">
                  Sample Card 1
                </p>
              </template>
              <div class="content">
                <p>Card content adapts to the theme automatically.</p>
              </div>
            </t-card>
          </div>
          <div class="column">
            <t-card>
              <template #header>
                <p class="card-header-title">
                  Sample Card 2
                </p>
              </template>
              <div class="content">
                <p>All components work seamlessly in both light and dark modes.</p>
              </div>
            </t-card>
          </div>
        </div>

        <!-- Notifications -->
        <h2 class="title is-3">
          Notifications
        </h2>
        <div class="box">
          <t-notification variant="info" class="mb-3">
            <strong>Info:</strong> This is an info notification.
          </t-notification>
          <t-notification variant="success" class="mb-3">
            <strong>Success:</strong> This is a success notification.
          </t-notification>
          <t-notification variant="warning" class="mb-3">
            <strong>Warning:</strong> This is a warning notification.
          </t-notification>
          <t-notification variant="danger">
            <strong>Error:</strong> This is an error notification.
          </t-notification>
        </div>

        <!-- Table -->
        <h2 class="title is-3">
          Table Example
        </h2>
        <div class="box">
          <t-table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td>Developer</td>
              </tr>
              <tr>
                <td>Jane Smith</td>
                <td>jane@example.com</td>
                <td>Designer</td>
              </tr>
              <tr>
                <td>Bob Johnson</td>
                <td>bob@example.com</td>
                <td>Manager</td>
              </tr>
            </tbody>
          </t-table>
        </div>

        <!-- Implementation -->
        <h2 class="title is-3">
          Implementation
        </h2>
        <div class="box">
          <h3 class="subtitle is-5">
            How It Works
          </h3>
          <p class="mb-3">
            The theme toggle component:
          </p>
          <ul>
            <li>Adds/removes the <code>theme-dark</code> class to the document root</li>
            <li>Saves the preference to localStorage</li>
            <li>Respects the system's <code>prefers-color-scheme</code> on first load</li>
            <li>Provides comprehensive dark theme styles for all Bulma components</li>
          </ul>

          <h3 class="subtitle is-5 mt-5">
            Usage
          </h3>
          <pre class="content"><code>&lt;t-theme-toggle /&gt;</code></pre>

          <p class="help">
            Place this component anywhere in your layout, typically in the header or navigation bar.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sampleText = ref('')
const sampleTextarea = ref('')
const sampleSelect = ref('option1')
const sampleCheckbox = ref(false)
</script>
