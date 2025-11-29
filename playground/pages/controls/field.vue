<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Field Component
      </h1>
      <p class="subtitle">
        Form field wrapper with label, message, and validation
      </p>

      <div class="content">
        <!-- Basic Field with Label -->
        <t-demo-box label="Basic Field with Label">
          <t-field label="Username:">
            <t-input v-model="username" placeholder="Enter username" />
          </t-field>
          <t-field label="Email:">
            <t-input v-model="email" type="email" placeholder="you@example.com" />
          </t-field>
        </t-demo-box>

        <!-- With Help Message -->
        <t-demo-box label="With Help Message">
          <t-field label="Password:" message="Must be at least 8 characters">
            <t-input v-model="password" type="password" placeholder="Enter password" />
          </t-field>
          <t-field label="Website:" message="Include http:// or https://">
            <t-input v-model="website" type="url" placeholder="https://example.com" />
          </t-field>
        </t-demo-box>

        <!-- Validation States -->
        <t-demo-box label="Validation States">
          <t-field label="Valid Email:" variant="success" message="Email format is correct">
            <t-input v-model="validEmail" type="email" variant="success" />
          </t-field>
          <t-field label="Invalid Email:" variant="danger" message="Please enter a valid email address">
            <t-input v-model="invalidEmail" type="email" variant="danger" />
          </t-field>
          <t-field label="Warning:" variant="warning" message="This username might be taken">
            <t-input v-model="warningUsername" variant="warning" />
          </t-field>
          <t-field label="Info:" variant="info" message="This field is optional">
            <t-input v-model="infoField" variant="info" />
          </t-field>
        </t-demo-box>

        <!-- Required Field -->
        <t-demo-box label="Required Field">
          <t-field label="Full Name:" required>
            <t-input v-model="fullName" placeholder="John Doe" />
          </t-field>
          <t-field label="Company:" required message="This information is required">
            <t-input v-model="company" placeholder="Acme Corp" />
          </t-field>
        </t-demo-box>

        <!-- Horizontal Field -->
        <t-demo-box label="Horizontal Layout">
          <t-field label="Name:" horizontal>
            <t-input v-model="horizontalName" placeholder="First and last name" />
          </t-field>
          <t-field label="Email:" horizontal>
            <t-input v-model="horizontalEmail" type="email" placeholder="Email address" />
          </t-field>
          <t-field label="Phone:" horizontal message="Include country code">
            <t-input v-model="horizontalPhone" type="tel" placeholder="+1 (555) 123-4567" />
          </t-field>
        </t-demo-box>

        <!-- Addons (Attached Controls) -->
        <t-demo-box label="Addons (Attached Controls)">
          <t-field label="URL:" addons horizontal>
            <t-input v-model="urlPath" expanded placeholder="username" />
            <t-button variant="primary">
              Check
            </t-button>
          </t-field>

          <t-field label="Amount:" addons horizontal>
            <t-button>
              $
            </t-button>
            <t-input v-model="amount" type="number" expanded placeholder="0.00" />
            <t-button variant="success">
              Submit
            </t-button>
          </t-field>

          <t-field label="Search:" addons>
            <t-input v-model="searchQuery" expanded placeholder="Search products..." />
            <t-button variant="info">
              <t-icon icon="magnify" />
            </t-button>
          </t-field>
        </t-demo-box>

        <!-- Grouped Fields (Side by Side) -->
        <t-demo-box label="Grouped Fields (Side by Side)">
          <t-field label="Actions:" grouped>
            <t-button variant="primary">
              Save
            </t-button>
            <t-button variant="light">
              Cancel
            </t-button>
            <t-button variant="danger">
              Delete
            </t-button>
          </t-field>

          <t-field label="Search with button:" grouped>
            <t-input v-model="searchQuery" expanded placeholder="Find a repository..." />
            <t-button variant="info">
              Search
            </t-button>
          </t-field>
        </t-demo-box>

        <!-- Multiple Inputs with Addons -->
        <t-demo-box label="Multiple Inputs with Addons">
          <t-field label="Full Name:" addons>
            <t-input v-model="firstName" placeholder="First name" expanded />
            <t-input v-model="lastName" placeholder="Last name" expanded />
          </t-field>

          <t-field label="Date Range:" addons>
            <t-input v-model="startDate" type="date" expanded />
            <div class="control">
              <span class="button is-static">to</span>
            </div>
            <t-input v-model="endDate" type="date" expanded />
          </t-field>
        </t-demo-box>

        <!-- Practical Form Example -->
        <t-demo-box label="Example: Registration Form" example>
          <t-field label="Username:" required message="Choose a unique username">
            <t-input v-model="regUsername" placeholder="username" />
          </t-field>

          <t-field label="Email Address:" required>
            <t-input v-model="regEmail" type="email" placeholder="you@example.com" />
          </t-field>

          <t-field label="Password:" required message="Minimum 8 characters">
            <t-input v-model="regPassword" type="password" placeholder="••••••••" />
          </t-field>

          <t-field label="Confirm Password:" required>
            <t-input
              v-model="regPasswordConfirm"
              type="password"
              placeholder="••••••••"
              :variant="regPassword && regPasswordConfirm && regPassword !== regPasswordConfirm ? 'danger' : undefined"
            />
            <template v-if="regPassword && regPasswordConfirm && regPassword !== regPasswordConfirm">
              <p class="help is-danger">
                Passwords do not match
              </p>
            </template>
          </t-field>

          <t-field label="Country:">
            <t-select v-model="regCountry" expanded>
              <option value="">
                Select a country
              </option>
              <option value="us">
                United States
              </option>
              <option value="uk">
                United Kingdom
              </option>
              <option value="ca">
                Canada
              </option>
              <option value="au">
                Australia
              </option>
            </t-select>
          </t-field>

          <t-field>
            <t-checkbox v-model="regTerms">
              I agree to the terms and conditions
            </t-checkbox>
          </t-field>

          <t-field grouped>
            <t-button
              variant="primary"
              :disabled="!canRegister"
              @click="handleRegister"
            >
              Register
            </t-button>
            <t-button @click="resetForm">
              Reset
            </t-button>
          </t-field>
        </t-demo-box>

        <!-- Stacked Fields -->
        <t-demo-box label="Example: Address Form" example>
          <t-field label="Street Address:" required>
            <t-input v-model="address.street" placeholder="123 Main St" />
          </t-field>

          <t-field label="Apartment, suite, etc.">
            <t-input v-model="address.apt" placeholder="Apt 4B" />
          </t-field>

          <div class="columns">
            <div class="column">
              <t-field label="City:" required>
                <t-input v-model="address.city" placeholder="New York" />
              </t-field>
            </div>
            <div class="column">
              <t-field label="State:" required>
                <t-input v-model="address.state" placeholder="NY" />
              </t-field>
            </div>
            <div class="column">
              <t-field label="ZIP Code:" required>
                <t-input v-model="address.zip" placeholder="10001" />
              </t-field>
            </div>
          </div>
        </t-demo-box>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')
const website = ref('')

const validEmail = ref('user@example.com')
const invalidEmail = ref('not-an-email')
const warningUsername = ref('john')
const infoField = ref('')

const fullName = ref('')
const company = ref('')

const horizontalName = ref('')
const horizontalEmail = ref('')
const horizontalPhone = ref('')

const urlPath = ref('')
const amount = ref('')
const searchQuery = ref('')

const firstName = ref('')
const lastName = ref('')
const startDate = ref('')
const endDate = ref('')

const regUsername = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regPasswordConfirm = ref('')
const regCountry = ref('')
const regTerms = ref(false)

const address = ref({
  street: '',
  apt: '',
  city: '',
  state: '',
  zip: ''
})

const canRegister = computed(() => {
  return regUsername.value
    && regEmail.value
    && regPassword.value
    && regPassword.value === regPasswordConfirm.value
    && regTerms.value
})

const handleRegister = () => {
  alert('Registration submitted!')
}

const resetForm = () => {
  regUsername.value = ''
  regEmail.value = ''
  regPassword.value = ''
  regPasswordConfirm.value = ''
  regCountry.value = ''
  regTerms.value = false
}
</script>
