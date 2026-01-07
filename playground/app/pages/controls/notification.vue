<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Notification Component
      </h1>
      <p class="subtitle">
        Alert messages with variants and actions
      </p>

      <t-demo-box label="Basic Notification">
        <t-notification>
          This is a basic notification message.
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Variants">
        <t-notification v-for="variant in variants" :key="variant" :variant="variant">
          <strong>{{ capitalize(variant) }}</strong> notification message.
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Light Variants">
        <t-notification v-for="variant in variants" :key="variant" :variant="variant" light>
          <strong>{{ capitalize(variant) }}</strong> light notification.
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Closable">
        <t-notification variant="info" closeable>
          <strong>Closable notification.</strong> Click the X to dismiss.
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Example: Closable Notifications" example>
        <t-notification v-if="notifications.welcome" variant="info" closeable @close="notifications.welcome = false">
          <strong>Welcome!</strong> Thanks for joining our platform.
        </t-notification>
        <t-notification v-if="notifications.update" variant="success" closeable @close="notifications.update = false">
          <strong>Updated!</strong> Your profile has been updated successfully.
        </t-notification>
        <t-notification v-if="notifications.warning" variant="warning" closeable @close="notifications.warning = false">
          <strong>Attention:</strong> Your trial period expires in 3 days.
        </t-notification>
        <t-button v-if="!allNotificationsVisible" @click="resetNotifications">
          Show Notifications Again
        </t-button>
      </t-demo-box>

      <t-demo-box label="Example: With Icons" example>
        <t-notification variant="success">
          <div class="is-flex is-align-items-center">
            <t-icon icon="check-circle" class="mr-2" />
            <span><strong>Success:</strong> Your file has been uploaded.</span>
          </div>
        </t-notification>
        <t-notification variant="info">
          <div class="is-flex is-align-items-center">
            <t-icon icon="information" class="mr-2" />
            <span><strong>Info:</strong> New features are now available.</span>
          </div>
        </t-notification>
        <t-notification variant="warning">
          <div class="is-flex is-align-items-center">
            <t-icon icon="alert" class="mr-2" />
            <span><strong>Warning:</strong> Scheduled maintenance at midnight.</span>
          </div>
        </t-notification>
        <t-notification variant="danger">
          <div class="is-flex is-align-items-center">
            <t-icon icon="alert-circle" class="mr-2" />
            <span><strong>Error:</strong> Failed to connect to server.</span>
          </div>
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Example: With Action Buttons" example>
        <t-notification variant="primary">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <strong>New version available!</strong>
              <p>Version 2.0.0 is ready to install.</p>
            </div>
            <div class="buttons">
              <t-button size="small">
                Update Now
              </t-button>
              <t-button size="small" variant="light">
                Later
              </t-button>
            </div>
          </div>
        </t-notification>

        <t-notification variant="warning" light>
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <strong>Cookies Policy</strong>
              <p>We use cookies to improve your experience.</p>
            </div>
            <div class="buttons">
              <t-button size="small" variant="warning">
                Accept
              </t-button>
              <t-button size="small">
                Learn More
              </t-button>
            </div>
          </div>
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Example: Form Submission Status" example>
        <t-field label="Email:">
          <t-input v-model="email" type="email" placeholder="your@email.com" />
        </t-field>
        <t-button variant="primary" @click="submitForm">
          Submit
        </t-button>
        <t-notification v-if="formStatus === 'success'" variant="success" light class="mt-3">
          <t-icon icon="check-circle" />
          Form submitted successfully! Check your email for confirmation.
        </t-notification>
        <t-notification v-if="formStatus === 'error'" variant="danger" light class="mt-3">
          <t-icon icon="alert-circle" />
          Failed to submit form. Please try again.
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Example: Loading State" example>
        <t-notification variant="info">
          <div class="is-flex is-align-items-center">
            <t-loading />
            <span class="ml-3">Processing your request...</span>
          </div>
        </t-notification>
      </t-demo-box>

      <t-demo-box label="Example: Multi-line Content" example>
        <t-notification variant="info" light>
          <p class="has-text-weight-bold">
            <t-icon icon="lightbulb" />
            Pro Tip
          </p>
          <p>
            You can use keyboard shortcuts to navigate faster:
          </p>
          <ul class="mt-2">
            <li><kbd>Ctrl</kbd> + <kbd>S</kbd> to save</li>
            <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo</li>
            <li><kbd>Ctrl</kbd> + <kbd>F</kbd> to search</li>
          </ul>
        </t-notification>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NotificationVariants } from '../../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const variants = NotificationVariants

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const notifications = ref({
  welcome: true,
  update: true,
  warning: true
})

const allNotificationsVisible = computed(() => {
  return notifications.value.welcome || notifications.value.update || notifications.value.warning
})

const resetNotifications = () => {
  notifications.value = {
    welcome: true,
    update: true,
    warning: true
  }
}

const email = ref('')
const formStatus = ref<'success' | 'error' | null>(null)

const submitForm = () => {
  if (email.value.includes('@')) {
    formStatus.value = 'success'
  } else {
    formStatus.value = 'error'
  }
  setTimeout(() => {
    formStatus.value = null
  }, 5000)
}
</script>
