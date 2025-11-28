<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Radio Component
      </h1>
      <p class="subtitle">
        Radio button input for single selection
      </p>

      <div class="content">
        <t-demo-box label="Basic Radio Group">
          <t-field>
            <t-radio v-model="basic" native-value="option1">
              Option 1
            </t-radio>
            <t-radio v-model="basic" native-value="option2">
              Option 2
            </t-radio>
            <t-radio v-model="basic" native-value="option3">
              Option 3
            </t-radio>
          </t-field>
          <p class="has-text-grey">
            Selected: {{ basic }}
          </p>
        </t-demo-box>

        <t-demo-box label="Variants">
          <t-field>
            <t-radio v-model="variantDemo" native-value="primary" variant="primary">
              Primary
            </t-radio>
            <t-radio v-model="variantDemo" native-value="info" variant="info">
              Info
            </t-radio>
            <t-radio v-model="variantDemo" native-value="success" variant="success">
              Success
            </t-radio>
            <t-radio v-model="variantDemo" native-value="warning" variant="warning">
              Warning
            </t-radio>
            <t-radio v-model="variantDemo" native-value="danger" variant="danger">
              Danger
            </t-radio>
          </t-field>
        </t-demo-box>

        <t-demo-box label="Sizes">
          <t-field>
            <t-radio v-model="sizeDemo" native-value="small" size="small">
              Small radio
            </t-radio>
            <t-radio v-model="sizeDemo" native-value="normal">
              Normal radio
            </t-radio>
            <t-radio v-model="sizeDemo" native-value="medium" size="medium">
              Medium radio
            </t-radio>
            <t-radio v-model="sizeDemo" native-value="large" size="large">
              Large radio
            </t-radio>
          </t-field>
        </t-demo-box>

        <t-demo-box label="Disabled State">
          <t-field>
            <t-radio v-model="disabledDemo" native-value="enabled">
              Enabled option
            </t-radio>
            <t-radio v-model="disabledDemo" native-value="disabled" disabled>
              Disabled option
            </t-radio>
            <t-radio v-model="disabledDemo" native-value="another">
              Another enabled option
            </t-radio>
          </t-field>
        </t-demo-box>

        <t-demo-box label="With Additional Content">
          <t-field>
            <t-radio v-model="contentDemo" native-value="option1">
              <div>
                <strong>Option 1</strong>
                <p class="help">
                  Additional content for option 1
                </p>
              </div>
            </t-radio>
            <t-radio v-model="contentDemo" native-value="option2">
              <div>
                <strong>Option 2</strong>
                <p class="help">
                  Additional content for option 2
                </p>
              </div>
            </t-radio>
            <t-radio v-model="contentDemo" native-value="option3">
              <div>
                <strong>Option 3</strong>
                <p class="help">
                  Additional content for option 3
                </p>
              </div>
            </t-radio>
          </t-field>
        </t-demo-box>

        <t-demo-box label="Example: Payment Method Selection">
          <t-field label="Choose payment method:">
            <t-radio v-model="payment" native-value="credit">
              <div>
                <strong>Credit Card</strong>
                <p class="help">
                  Pay with Visa, Mastercard, or Amex
                </p>
              </div>
            </t-radio>
            <t-radio v-model="payment" native-value="paypal">
              <div>
                <strong>PayPal</strong>
                <p class="help">
                  Fast and secure payment
                </p>
              </div>
            </t-radio>
            <t-radio v-model="payment" native-value="bank">
              <div>
                <strong>Bank Transfer</strong>
                <p class="help">
                  Direct transfer from your bank
                </p>
              </div>
            </t-radio>
          </t-field>
          <p class="has-text-grey mt-3">
            Selected method: {{ payment }}
          </p>
        </t-demo-box>

        <t-demo-box label="Example: Shipping Options">
          <t-field label="Select shipping speed:">
            <t-radio v-model="shipping" native-value="standard">
              <span><strong>Standard Shipping</strong> - FREE (5-7 days)</span>
            </t-radio>
            <t-radio v-model="shipping" native-value="express">
              <span><strong>Express Shipping</strong> - $9.99 (2-3 days)</span>
            </t-radio>
            <t-radio v-model="shipping" native-value="overnight">
              <span><strong>Overnight Shipping</strong> - $24.99 (next day)</span>
            </t-radio>
          </t-field>
        </t-demo-box>

        <t-demo-box label="Example: Survey Question">
          <p class="mb-3">
            <strong>How satisfied are you with our service?</strong>
          </p>
          <t-field>
            <t-radio v-model="satisfaction" native-value="very-satisfied" variant="success">
              Very Satisfied
            </t-radio>
            <t-radio v-model="satisfaction" native-value="satisfied" variant="success">
              Satisfied
            </t-radio>
            <t-radio v-model="satisfaction" native-value="neutral" variant="warning">
              Neutral
            </t-radio>
            <t-radio v-model="satisfaction" native-value="dissatisfied" variant="danger">
              Dissatisfied
            </t-radio>
            <t-radio v-model="satisfaction" native-value="very-dissatisfied" variant="danger">
              Very Dissatisfied
            </t-radio>
          </t-field>
        </t-demo-box>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const basic = ref('option2')
const variantDemo = ref('success')
const sizeDemo = ref('normal')
const disabledDemo = ref('enabled')
const contentDemo = ref('option1')
const payment = ref('credit')
const shipping = ref('standard')
const satisfaction = ref('satisfied')
</script>
