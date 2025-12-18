<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tabs Component
      </h1>
      <p class="subtitle">
        Tabbed navigation with multiple content panels
      </p>

      <!-- Basic Tabs -->
      <t-demo-box label="Basic Tabs">
        <t-tabs v-model="basicTab">
          <t-tab-item label="Home" value="home">
            <div class="content">
              <h3>Home Content</h3>
              <p>This is the content for the Home tab.</p>
            </div>
          </t-tab-item>
          <t-tab-item label="Profile" value="profile">
            <div class="content">
              <h3>Profile Content</h3>
              <p>This is the content for the Profile tab.</p>
            </div>
          </t-tab-item>
          <t-tab-item label="Settings" value="settings">
            <div class="content">
              <h3>Settings Content</h3>
              <p>This is the content for the Settings tab.</p>
            </div>
          </t-tab-item>
        </t-tabs>
        <p class="has-text-grey">
          Active tab: {{ basicTab }}
        </p>
      </t-demo-box>

      <!-- Types -->
      <t-demo-box label="Types">
        <div v-for="tabsType in tabsTypes" :key="tabsType" class="mb-4">
          <h3 class="subtitle is-5">
            {{ formatType(tabsType) }}
          </h3>
          <t-tabs v-model="typeValues[tabsType]" :type="tabsType">
            <t-tab-item label="Home" value="1" />
            <t-tab-item label="Profile" value="2" />
            <t-tab-item label="Settings" value="3" />
          </t-tabs>
        </div>
      </t-demo-box>

      <!-- With Icons -->
      <t-demo-box label="With Icons">
        <t-tabs v-model="iconTab">
          <t-tab-item label="Dashboard" value="dashboard" icon="view-dashboard" />
          <t-tab-item label="Messages" value="messages" icon="email" />
          <t-tab-item label="Notifications" value="notifications" icon="bell" />
          <t-tab-item label="Settings" value="settings" icon="cog" />
        </t-tabs>
      </t-demo-box>

      <!-- Sizes -->
      <t-demo-box label="Sizes">
        <div v-for="tabsSize in sizes" :key="tabsSize" class="mb-4">
          <h3 class="subtitle is-5">
            {{ capitalize(tabsSize) }}
          </h3>
          <t-tabs v-model="sizeValues[tabsSize]" :size="tabsSize">
            <t-tab-item label="Tab 1" value="1" />
            <t-tab-item label="Tab 2" value="2" />
          </t-tabs>
        </div>
      </t-demo-box>

      <!-- Alignment -->
      <t-demo-box label="Alignment">
        <div v-for="position in positions" :key="position" class="mb-4">
          <h3 class="subtitle is-5">
            {{ capitalize(position) }}{{ position === 'left' ? '-aligned' : position === 'right' ? '-aligned' : '' }}
          </h3>
          <t-tabs v-model="positionValues[position]" :position="position">
            <t-tab-item label="One" value="1" />
            <t-tab-item label="Two" value="2" />
            <t-tab-item label="Three" value="3" />
          </t-tabs>
        </div>
      </t-demo-box>

      <!-- Full Width -->
      <t-demo-box label="Full Width">
        <t-tabs v-model="fullWidth" expanded>
          <t-tab-item label="First" value="1" />
          <t-tab-item label="Second" value="2" />
          <t-tab-item label="Third" value="3" />
          <t-tab-item label="Fourth" value="4" />
        </t-tabs>
      </t-demo-box>

      <!-- Practical Example: Settings Panel -->
      <t-demo-box label="Example: Settings Panel" example>
        <t-tabs v-model="settingsTab" type="boxed">
          <t-tab-item label="Account" value="account" icon="account">
            <div class="content">
              <h3>Account Settings</h3>
              <t-field label="Username:">
                <t-input v-model="settings.username" />
              </t-field>
              <t-field label="Email:">
                <t-input v-model="settings.email" type="email" />
              </t-field>
              <t-button variant="primary">
                Save Changes
              </t-button>
            </div>
          </t-tab-item>
          <t-tab-item label="Privacy" value="privacy" icon="lock">
            <div class="content">
              <h3>Privacy Settings</h3>
              <t-field>
                <t-switch v-model="settings.profilePublic">
                  Public Profile
                </t-switch>
              </t-field>
              <t-field>
                <t-switch v-model="settings.showActivity">
                  Show Activity Status
                </t-switch>
              </t-field>
              <t-field>
                <t-switch v-model="settings.allowMessages">
                  Allow Messages
                </t-switch>
              </t-field>
            </div>
          </t-tab-item>
          <t-tab-item label="Notifications" value="notifications" icon="bell">
            <div class="content">
              <h3>Notification Preferences</h3>
              <t-field>
                <t-checkbox v-model="settings.emailNotifications">
                  Email Notifications
                </t-checkbox>
              </t-field>
              <t-field>
                <t-checkbox v-model="settings.pushNotifications">
                  Push Notifications
                </t-checkbox>
              </t-field>
              <t-field>
                <t-checkbox v-model="settings.smsNotifications">
                  SMS Notifications
                </t-checkbox>
              </t-field>
            </div>
          </t-tab-item>
          <t-tab-item label="Security" value="security" icon="shield">
            <div class="content">
              <h3>Security Settings</h3>
              <t-field label="Current Password:">
                <t-input type="password" />
              </t-field>
              <t-field label="New Password:">
                <t-input type="password" />
              </t-field>
              <t-field label="Confirm Password:">
                <t-input type="password" />
              </t-field>
              <t-button variant="primary">
                Update Password
              </t-button>
            </div>
          </t-tab-item>
        </t-tabs>
      </t-demo-box>

      <!-- Interactive Example -->
      <t-demo-box label="Example: Product Details" example>
        <t-tabs v-model="productTab">
          <t-tab-item label="Description" value="description">
            <div class="content">
              <h3>Product Description</h3>
              <p>
                This is a high-quality product with excellent features and outstanding performance.
                Perfect for both professional and personal use.
              </p>
              <ul>
                <li>Feature 1: Advanced technology</li>
                <li>Feature 2: Durable construction</li>
                <li>Feature 3: Easy to use</li>
                <li>Feature 4: Energy efficient</li>
              </ul>
            </div>
          </t-tab-item>
          <t-tab-item label="Specifications" value="specs">
            <div class="content">
              <h3>Technical Specifications</h3>
              <table class="table">
                <tbody>
                  <tr>
                    <td><strong>Dimensions</strong></td>
                    <td>10" x 8" x 2"</td>
                  </tr>
                  <tr>
                    <td><strong>Weight</strong></td>
                    <td>2.5 lbs</td>
                  </tr>
                  <tr>
                    <td><strong>Material</strong></td>
                    <td>Aluminum alloy</td>
                  </tr>
                  <tr>
                    <td><strong>Color</strong></td>
                    <td>Space Gray</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </t-tab-item>
          <t-tab-item label="Reviews" value="reviews">
            <div class="content">
              <h3>Customer Reviews</h3>
              <article class="message is-success">
                <div class="message-body">
                  <strong>5/5 - Excellent product!</strong>
                  <p>Exactly what I was looking for. Great quality and fast shipping.</p>
                  <small class="has-text-grey">- John D.</small>
                </div>
              </article>
              <article class="message is-info">
                <div class="message-body">
                  <strong>4/5 - Very good</strong>
                  <p>Works as advertised. Would recommend to others.</p>
                  <small class="has-text-grey">- Sarah M.</small>
                </div>
              </article>
            </div>
          </t-tab-item>
        </t-tabs>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TabsSizes, TabsPositions, TabsTypes } from '../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const sizes = TabsSizes
const positions = TabsPositions
const tabsTypes = TabsTypes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const formatType = (tabsType: string) => {
  if (tabsType === 'toggle-rounded') return 'Toggle Rounded'
  return capitalize(tabsType)
}

const basicTab = ref('home')
const iconTab = ref('dashboard')

const sizeValues = reactive<Record<string, string>>({})
for (const tabsSize of sizes) {
  sizeValues[tabsSize] = '1'
}

const positionValues = reactive<Record<string, string>>({})
for (const position of positions) {
  positionValues[position] = '2'
}

const typeValues = reactive<Record<string, string>>({})
for (const tabsType of tabsTypes) {
  typeValues[tabsType] = '1'
}

const fullWidth = ref('2')

const settingsTab = ref('account')
const settings = ref({
  username: 'johndoe',
  email: 'john@example.com',
  profilePublic: true,
  showActivity: true,
  allowMessages: false,
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false
})

const productTab = ref('description')
</script>
