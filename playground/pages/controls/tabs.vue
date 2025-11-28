<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Tabs Component
      </h1>
      <p class="subtitle">
        Tabbed navigation with multiple content panels
      </p>

      <div class="content">
        <!-- Basic Tabs -->
        <h2 class="title is-3">
          Basic Tabs
        </h2>
        <div class="box">
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
        </div>

        <!-- Boxed Style -->
        <h2 class="title is-3">
          Boxed Style
        </h2>
        <div class="box">
          <t-tabs v-model="boxedTab" type="boxed">
            <t-tab-item label="Pictures" value="pictures">
              <div class="content">
                <p>📷 Your photo gallery goes here</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Music" value="music">
              <div class="content">
                <p>🎵 Your music library goes here</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Videos" value="videos">
              <div class="content">
                <p>🎬 Your video collection goes here</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Documents" value="documents">
              <div class="content">
                <p>📄 Your documents folder goes here</p>
              </div>
            </t-tab-item>
          </t-tabs>
        </div>

        <!-- Toggle Style -->
        <h2 class="title is-3">
          Toggle Style
        </h2>
        <div class="box">
          <t-tabs v-model="toggleTab" type="toggle">
            <t-tab-item label="Left" value="left">
              <div class="content">
                <p>Content aligned to the left</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Center" value="center">
              <div class="content">
                <p>Content aligned to the center</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Right" value="right">
              <div class="content">
                <p>Content aligned to the right</p>
              </div>
            </t-tab-item>
          </t-tabs>
        </div>

        <!-- Toggle Rounded -->
        <h2 class="title is-3">
          Toggle Rounded
        </h2>
        <div class="box">
          <t-tabs v-model="roundedTab" type="toggle-rounded">
            <t-tab-item label="One" value="1">
              <p>First option selected</p>
            </t-tab-item>
            <t-tab-item label="Two" value="2">
              <p>Second option selected</p>
            </t-tab-item>
            <t-tab-item label="Three" value="3">
              <p>Third option selected</p>
            </t-tab-item>
          </t-tabs>
        </div>

        <!-- With Icons -->
        <h2 class="title is-3">
          With Icons
        </h2>
        <div class="box">
          <t-tabs v-model="iconTab">
            <t-tab-item label="Dashboard" value="dashboard" icon="view-dashboard">
              <div class="content">
                <h3>📊 Dashboard</h3>
                <p>Overview of your statistics and metrics</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Messages" value="messages" icon="email">
              <div class="content">
                <h3>📧 Messages</h3>
                <p>Your inbox and sent messages</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Notifications" value="notifications" icon="bell">
              <div class="content">
                <h3>🔔 Notifications</h3>
                <p>Recent activity and alerts</p>
              </div>
            </t-tab-item>
            <t-tab-item label="Settings" value="settings" icon="cog">
              <div class="content">
                <h3>⚙️ Settings</h3>
                <p>Configure your preferences</p>
              </div>
            </t-tab-item>
          </t-tabs>
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <h3 class="subtitle is-5">
            Small
          </h3>
          <t-tabs v-model="sizeSmall" size="small">
            <t-tab-item label="Tab 1" value="1">
              Small tabs content
            </t-tab-item>
            <t-tab-item label="Tab 2" value="2">
              Content for tab 2
            </t-tab-item>
          </t-tabs>

          <h3 class="subtitle is-5 mt-4">
            Medium
          </h3>
          <t-tabs v-model="sizeMedium" size="medium">
            <t-tab-item label="Tab 1" value="1">
              Medium tabs content
            </t-tab-item>
            <t-tab-item label="Tab 2" value="2">
              Content for tab 2
            </t-tab-item>
          </t-tabs>

          <h3 class="subtitle is-5 mt-4">
            Large
          </h3>
          <t-tabs v-model="sizeLarge" size="large">
            <t-tab-item label="Tab 1" value="1">
              Large tabs content
            </t-tab-item>
            <t-tab-item label="Tab 2" value="2">
              Content for tab 2
            </t-tab-item>
          </t-tabs>
        </div>

        <!-- Alignment -->
        <h2 class="title is-3">
          Alignment
        </h2>
        <div class="box">
          <h3 class="subtitle is-5">
            Centered
          </h3>
          <t-tabs v-model="alignCenter" position="centered">
            <t-tab-item label="One" value="1">
              Centered tabs - Option 1
            </t-tab-item>
            <t-tab-item label="Two" value="2">
              Centered tabs - Option 2
            </t-tab-item>
            <t-tab-item label="Three" value="3">
              Centered tabs - Option 3
            </t-tab-item>
          </t-tabs>

          <h3 class="subtitle is-5 mt-4">
            Right-aligned
          </h3>
          <t-tabs v-model="alignRight" position="right">
            <t-tab-item label="One" value="1">
              Right-aligned tabs - Option 1
            </t-tab-item>
            <t-tab-item label="Two" value="2">
              Right-aligned tabs - Option 2
            </t-tab-item>
            <t-tab-item label="Three" value="3">
              Right-aligned tabs - Option 3
            </t-tab-item>
          </t-tabs>
        </div>

        <!-- Full Width -->
        <h2 class="title is-3">
          Full Width
        </h2>
        <div class="box">
          <t-tabs v-model="fullWidth" expanded>
            <t-tab-item label="First" value="1">
              Full width tabs - First section
            </t-tab-item>
            <t-tab-item label="Second" value="2">
              Full width tabs - Second section
            </t-tab-item>
            <t-tab-item label="Third" value="3">
              Full width tabs - Third section
            </t-tab-item>
            <t-tab-item label="Fourth" value="4">
              Full width tabs - Fourth section
            </t-tab-item>
          </t-tabs>
        </div>

        <!-- Practical Example: Settings Panel -->
        <h2 class="title is-3">
          Settings Panel
        </h2>
        <div class="box">
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
        </div>

        <!-- Interactive Example -->
        <h2 class="title is-3">
          Product Details
        </h2>
        <div class="box">
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
                    <strong>⭐⭐⭐⭐⭐ Excellent product!</strong>
                    <p>Exactly what I was looking for. Great quality and fast shipping.</p>
                    <small class="has-text-grey">- John D.</small>
                  </div>
                </article>
                <article class="message is-info">
                  <div class="message-body">
                    <strong>⭐⭐⭐⭐ Very good</strong>
                    <p>Works as advertised. Would recommend to others.</p>
                    <small class="has-text-grey">- Sarah M.</small>
                  </div>
                </article>
              </div>
            </t-tab-item>
          </t-tabs>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const basicTab = ref('home')
const boxedTab = ref('pictures')
const toggleTab = ref('center')
const roundedTab = ref('2')
const iconTab = ref('dashboard')

const sizeSmall = ref('1')
const sizeMedium = ref('1')
const sizeLarge = ref('1')

const alignCenter = ref('2')
const alignRight = ref('2')
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
