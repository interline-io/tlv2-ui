<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Notification Component
      </h1>
      <p class="subtitle">
        Alert messages with variants and actions
      </p>

      <div class="content">
        <!-- Basic Notification -->
        <h2 class="title is-3">
          Basic Notification
        </h2>
        <t-notification>
          This is a basic notification message.
        </t-notification>

        <!-- Variants -->
        <h2 class="title is-3 mt-5">
          Variants
        </h2>
        <t-notification variant="primary">
          <strong>Primary</strong> notification message.
        </t-notification>
        <t-notification variant="link">
          <strong>Link</strong> notification message.
        </t-notification>
        <t-notification variant="info">
          <strong>Info</strong> notification message with helpful information.
        </t-notification>
        <t-notification variant="success">
          <strong>Success!</strong> Your changes have been saved.
        </t-notification>
        <t-notification variant="warning">
          <strong>Warning:</strong> Please review before proceeding.
        </t-notification>
        <t-notification variant="danger">
          <strong>Error:</strong> Something went wrong. Please try again.
        </t-notification>

        <!-- Light Variants -->
        <h2 class="title is-3 mt-5">
          Light Variants
        </h2>
        <t-notification variant="primary" light>
          <strong>Primary</strong> light notification.
        </t-notification>
        <t-notification variant="info" light>
          <strong>Info</strong> light notification with helpful information.
        </t-notification>
        <t-notification variant="success" light>
          <strong>Success!</strong> Your changes have been saved.
        </t-notification>
        <t-notification variant="warning" light>
          <strong>Warning:</strong> Please review before proceeding.
        </t-notification>
        <t-notification variant="danger" light>
          <strong>Error:</strong> Something went wrong.
        </t-notification>

        <!-- Closable Notifications -->
        <h2 class="title is-3 mt-5">
          Closable Notifications
        </h2>
        <div class="box">
          <t-notification v-if="notifications.welcome" variant="info" closable @close="notifications.welcome = false">
            <strong>Welcome!</strong> Thanks for joining our platform.
          </t-notification>
          <t-notification v-if="notifications.update" variant="success" closable @close="notifications.update = false">
            <strong>Updated!</strong> Your profile has been updated successfully.
          </t-notification>
          <t-notification v-if="notifications.warning" variant="warning" closable @close="notifications.warning = false">
            <strong>Attention:</strong> Your trial period expires in 3 days.
          </t-notification>
          <t-button v-if="!allNotificationsVisible" @click="resetNotifications">
            Show Notifications Again
          </t-button>
        </div>

        <!-- With Icons -->
        <h2 class="title is-3 mt-5">
          With Icons
        </h2>
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

        <!-- Rich Content -->
        <h2 class="title is-3 mt-5">
          Rich Content Notifications
        </h2>
        <t-notification variant="info">
          <div class="content">
            <p class="has-text-weight-bold">
              System Maintenance Scheduled
            </p>
            <p>
              Our system will undergo maintenance on <strong>Saturday, January 15th</strong> from
              <strong>2:00 AM to 6:00 AM EST</strong>.
            </p>
            <p>
              During this time, the following services will be unavailable:
            </p>
            <ul>
              <li>User authentication</li>
              <li>API access</li>
              <li>Dashboard features</li>
            </ul>
            <p>
              We apologize for any inconvenience.
            </p>
          </div>
        </t-notification>

        <!-- With Actions -->
        <h2 class="title is-3 mt-5">
          With Action Buttons
        </h2>
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

        <!-- Status Messages -->
        <h2 class="title is-3 mt-5">
          Form Submission Status
        </h2>
        <div class="box">
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
        </div>

        <!-- Loading State -->
        <h2 class="title is-3 mt-5">
          Loading State
        </h2>
        <t-notification variant="info">
          <div class="is-flex is-align-items-center">
            <t-loading inline />
            <span class="ml-3">Processing your request...</span>
          </div>
        </t-notification>

        <!-- Practical Examples -->
        <h2 class="title is-3 mt-5">
          Promotional Banner
        </h2>
        <t-notification variant="primary">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <strong>🎉 Special Offer!</strong>
              <span class="ml-2">Get 20% off your first purchase. Use code: <code>WELCOME20</code></span>
            </div>
            <t-button variant="light">
              Shop Now
            </t-button>
          </div>
        </t-notification>

        <h2 class="title is-3 mt-5">
          Multi-line Notification
        </h2>
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
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
