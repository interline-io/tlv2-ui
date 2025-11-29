<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Switch Component
      </h1>
      <p class="subtitle">
        Toggle switch for boolean settings
      </p>

      <t-demo-box label="Basic Switch">
        <t-field>
          <t-switch v-model="basic">
            Enable notifications
          </t-switch>
        </t-field>
        <p class="has-text-grey">
          Value: {{ basic }}
        </p>
      </t-demo-box>

      <t-demo-box label="Variants">
        <t-field>
          <t-switch v-model="variantPrimary" variant="primary">
            Primary
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="variantInfo" variant="info">
            Info
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="variantSuccess" variant="success">
            Success
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="variantWarning" variant="warning">
            Warning
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="variantDanger" variant="danger">
            Danger
          </t-switch>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <t-field>
          <t-switch v-model="sizeSmall" size="small">
            Small switch
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="sizeNormal">
            Normal switch
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="sizeMedium" size="medium">
            Medium switch
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="sizeLarge" size="large">
            Large switch
          </t-switch>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Disabled State">
        <t-field>
          <t-switch v-model="disabledOff" disabled>
            Disabled (off)
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="disabledOn" disabled>
            Disabled (on)
          </t-switch>
        </t-field>
      </t-demo-box>

      <t-demo-box label="With Additional Content">
        <t-field>
          <t-switch v-model="content1" variant="primary">
            <div>
              <strong>Option 1</strong>
              <p class="help">
                Additional content for option 1
              </p>
            </div>
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="content2" variant="info">
            <div>
              <strong>Option 2</strong>
              <p class="help">
                Additional content for option 2
              </p>
            </div>
          </t-switch>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Rounded Style">
        <t-field>
          <t-switch v-model="rounded" rounded variant="success">
            Rounded switch
          </t-switch>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Example: Settings Panel" example>
        <h3 class="subtitle is-5">
          Notification Settings
        </h3>
        <t-field>
          <t-switch v-model="settings.emailNotifications" variant="primary">
            <strong>Email Notifications</strong>
            <p class="help">
              Receive updates via email
            </p>
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="settings.pushNotifications" variant="primary">
            <strong>Push Notifications</strong>
            <p class="help">
              Get notifications on your device
            </p>
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="settings.smsNotifications" variant="primary">
            <strong>SMS Notifications</strong>
            <p class="help">
              Receive text messages
            </p>
          </t-switch>
        </t-field>

        <hr>

        <h3 class="subtitle is-5 mt-4">
          Privacy Settings
        </h3>
        <t-field>
          <t-switch v-model="settings.profilePublic" variant="success">
            <strong>Public Profile</strong>
            <p class="help">
              Make your profile visible to everyone
            </p>
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="settings.showEmail" variant="success">
            <strong>Show Email Address</strong>
            <p class="help">
              Display your email on your profile
            </p>
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="settings.allowMessages" variant="success">
            <strong>Allow Direct Messages</strong>
            <p class="help">
              Let other users message you
            </p>
          </t-switch>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Example: Feature Toggles" example>
        <t-field>
          <t-switch v-model="features.darkMode" variant="dark">
            <t-icon icon="weather-night" />
            <span>Dark Mode</span>
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="features.autoSave" variant="info">
            <t-icon icon="content-save-auto" />
            <span>Auto-save</span>
          </t-switch>
        </t-field>
        <t-field>
          <t-switch v-model="features.experimental" variant="warning">
            <t-icon icon="flask" />
            <span>Experimental Features</span>
          </t-switch>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Example: Interactive Demo" example>
        <t-field>
          <t-switch v-model="demo.enabled" variant="success" size="large">
            <strong>Feature Enabled</strong>
          </t-switch>
        </t-field>
        <div v-if="demo.enabled" class="notification is-success is-light mt-3">
          <p>
            <t-icon icon="check-circle" />
            Feature is now enabled! You can configure additional options below.
          </p>
          <t-field class="mt-3">
            <t-switch v-model="demo.autoUpdate" variant="info">
              Auto-update enabled
            </t-switch>
          </t-field>
          <t-field>
            <t-switch v-model="demo.notifications" variant="info">
              Show notifications
            </t-switch>
          </t-field>
        </div>
        <div v-else class="notification is-light mt-3">
          <p>
            Feature is disabled. Enable it to see more options.
          </p>
        </div>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const basic = ref(true)

const variantPrimary = ref(true)
const variantInfo = ref(true)
const variantSuccess = ref(true)
const variantWarning = ref(true)
const variantDanger = ref(true)

const sizeSmall = ref(true)
const sizeNormal = ref(true)
const sizeMedium = ref(true)
const sizeLarge = ref(true)

const disabledOff = ref(false)
const disabledOn = ref(true)

const content1 = ref(true)
const content2 = ref(false)

const rounded = ref(true)

const settings = ref({
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  profilePublic: true,
  showEmail: false,
  allowMessages: true
})

const features = ref({
  darkMode: false,
  autoSave: true,
  experimental: false
})

const demo = ref({
  enabled: true,
  autoUpdate: false,
  notifications: true
})
</script>
