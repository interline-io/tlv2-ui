<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Input Component
      </h1>
      <p class="subtitle">
        Text input control with validation and variants
      </p>

      <t-demo-box label="Basic Input">
        <t-field label="Name">
          <t-input v-model="name" placeholder="Enter your name" />
        </t-field>
        <p class="has-text-grey">
          Value: {{ name }}
        </p>
      </t-demo-box>

      <t-demo-box label="Input Types">
        <t-field v-for="inputType in inputTypes" :key="inputType" :label="capitalize(inputType) + ':'">
          <t-input v-model="typeValues[inputType]" :type="inputType" :placeholder="getPlaceholder(inputType)" />
        </t-field>
      </t-demo-box>

      <t-demo-box label="Variants">
        <t-field v-for="variant in variants" :key="variant" :label="capitalize(variant) + ':'">
          <t-input v-model="variantValues[variant]" :variant="variant" :placeholder="capitalize(variant)" />
        </t-field>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <t-field v-for="size in sizes" :key="size" :label="capitalize(size) + ':'">
          <t-input v-model="sizeValues[size]" :size="size" :placeholder="capitalize(size) + ' input'" />
        </t-field>
      </t-demo-box>

      <t-demo-box label="States">
        <t-field label="Disabled">
          <t-input v-model="disabled" disabled placeholder="Disabled input" />
        </t-field>
        <t-field label="Readonly">
          <t-input v-model="readonly" readonly placeholder="Readonly input" />
        </t-field>
        <t-field label="Loading">
          <t-input v-model="loadingValue" loading placeholder="Loading input" />
        </t-field>
      </t-demo-box>

      <t-demo-box label="Static">
        <p class="mb-3">
          Static inputs display like plain text, useful for read-only values in forms.
        </p>
        <t-field label="Username" horizontal>
          <t-input v-model="staticUsername" static />
        </t-field>
        <t-field label="Email" horizontal>
          <t-input v-model="staticEmail" type="email" static />
        </t-field>
      </t-demo-box>

      <t-demo-box label="Rounded">
        <t-field label="Rounded Input">
          <t-input v-model="rounded" rounded placeholder="Rounded corners" />
        </t-field>
      </t-demo-box>

      <t-demo-box label="With Icons">
        <t-field label="Search">
          <t-input v-model="search" icon="magnify" placeholder="Search..." />
        </t-field>
        <t-field label="Email with Icon">
          <t-input v-model="emailIcon" type="email" icon="email" placeholder="email@example.com" />
        </t-field>
        <t-field label="With Right Icon">
          <t-input v-model="clearable" icon="magnify" icon-right="close-circle" icon-right-clickable placeholder="Clearable search" @icon-right-click="clearable = ''" />
        </t-field>
      </t-demo-box>

      <t-demo-box label="Example: Maxlength" example>
        <t-field label="Username (max 20 chars)">
          <t-input v-model="username" maxlength="20" placeholder="Enter username" />
        </t-field>
        <p class="has-text-grey">
          {{ username.length }} / 20 characters
        </p>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InputVariants, InputSizes, InputTypes } from '../../../src/runtime/controls/types'

const variants = InputVariants
const sizes = InputSizes
const inputTypes = InputTypes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const getPlaceholder = (inputType: string) => {
  const placeholders: Record<string, string> = {
    'text': 'Text input',
    'email': 'email@example.com',
    'tel': '555-1234',
    'password': 'Enter password',
    'url': 'https://example.com',
    'search': 'Search...',
    'number': '123',
    'date': '',
    'time': '',
    'datetime-local': '',
    'month': '',
    'week': ''
  }
  return placeholders[inputType] || ''
}

const name = ref('')

const variantValues = reactive<Record<string, string>>({})
for (const variant of variants) {
  variantValues[variant] = ''
}

const sizeValues = reactive<Record<string, string>>({})
for (const size of sizes) {
  sizeValues[size] = ''
}

const typeValues = reactive<Record<string, string>>({})
for (const inputType of inputTypes) {
  typeValues[inputType] = ''
}

const disabled = ref('This is disabled')
const readonly = ref('This is readonly')
const loadingValue = ref('')
const staticUsername = ref('john_doe')
const staticEmail = ref('john@example.com')
const rounded = ref('')
const search = ref('')
const emailIcon = ref('')
const clearable = ref('Type to test')
const username = ref('')
</script>
