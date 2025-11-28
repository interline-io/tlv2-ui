<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Input Component
      </h1>
      <p class="subtitle">
        Text input control with validation and variants
      </p>

      <div class="content">
        <!-- Basic Input -->
        <h2 class="title is-3">
          Basic Input
        </h2>
        <div class="box">
          <t-field label="Name">
            <t-input v-model="name" placeholder="Enter your name" />
          </t-field>
          <p class="has-text-grey">
            Value: {{ name }}
          </p>
        </div>

        <!-- Input Types -->
        <h2 class="title is-3">
          Input Types
        </h2>
        <div class="box">
          <t-field label="Text">
            <t-input v-model="text" type="text" placeholder="Text input" />
          </t-field>
          <t-field label="Email">
            <t-input v-model="email" type="email" placeholder="email@example.com" />
          </t-field>
          <t-field label="Password">
            <t-input v-model="password" type="password" placeholder="Enter password" />
          </t-field>
          <t-field label="Number">
            <t-input v-model="number" type="number" placeholder="123" />
          </t-field>
          <t-field label="URL">
            <t-input v-model="url" type="url" placeholder="https://example.com" />
          </t-field>
          <t-field label="Date">
            <t-input v-model="date" type="date" />
          </t-field>
        </div>

        <!-- Variants -->
        <h2 class="title is-3">
          Variants
        </h2>
        <div class="box">
          <t-field label="Primary">
            <t-input v-model="primary" variant="primary" placeholder="Primary" />
          </t-field>
          <t-field label="Info">
            <t-input v-model="info" variant="info" placeholder="Info" />
          </t-field>
          <t-field label="Success">
            <t-input v-model="success" variant="success" placeholder="Success" />
          </t-field>
          <t-field label="Warning">
            <t-input v-model="warning" variant="warning" placeholder="Warning" />
          </t-field>
          <t-field label="Danger">
            <t-input v-model="danger" variant="danger" placeholder="Danger" />
          </t-field>
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <t-field label="Small">
            <t-input v-model="small" size="small" placeholder="Small input" />
          </t-field>
          <t-field label="Normal">
            <t-input v-model="normal" placeholder="Normal input" />
          </t-field>
          <t-field label="Medium">
            <t-input v-model="medium" size="medium" placeholder="Medium input" />
          </t-field>
          <t-field label="Large">
            <t-input v-model="large" size="large" placeholder="Large input" />
          </t-field>
        </div>

        <!-- States -->
        <h2 class="title is-3">
          States
        </h2>
        <div class="box">
          <t-field label="Disabled">
            <t-input v-model="disabled" disabled placeholder="Disabled input" />
          </t-field>
          <t-field label="Readonly">
            <t-input v-model="readonly" readonly placeholder="Readonly input" />
          </t-field>
          <t-field label="Loading">
            <t-input v-model="loadingValue" loading placeholder="Loading input" />
          </t-field>
        </div>

        <!-- Static -->
        <h2 class="title is-3">
          Static
        </h2>
        <div class="box">
          <p class="mb-3">
            Static inputs display like plain text, useful for read-only values in forms.
          </p>
          <t-field label="Username" horizontal>
            <t-input v-model="staticUsername" static />
          </t-field>
          <t-field label="Email" horizontal>
            <t-input v-model="staticEmail" type="email" static />
          </t-field>
        </div>

        <!-- Rounded -->
        <h2 class="title is-3">
          Rounded
        </h2>
        <div class="box">
          <t-field label="Rounded Input">
            <t-input v-model="rounded" rounded placeholder="Rounded corners" />
          </t-field>
        </div>

        <!-- With Icons -->
        <h2 class="title is-3">
          With Icons
        </h2>
        <div class="box">
          <t-field label="Search">
            <t-input v-model="search" icon="magnify" placeholder="Search..." />
          </t-field>
          <t-field label="Email with Icon">
            <t-input v-model="emailIcon" type="email" icon="email" placeholder="email@example.com" />
          </t-field>
          <t-field label="With Right Icon">
            <t-input v-model="clearable" icon="magnify" icon-right="close-circle" icon-right-clickable placeholder="Clearable search" @icon-right-click="clearable = ''" />
          </t-field>
        </div>

        <!-- Maxlength -->
        <h2 class="title is-3">
          Maxlength
        </h2>
        <div class="box">
          <t-field label="Username (max 20 chars)">
            <t-input v-model="username" maxlength="20" placeholder="Enter username" />
          </t-field>
          <p class="has-text-grey">
            {{ username.length }} / 20 characters
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const text = ref('')
const email = ref('')
const password = ref('')
const number = ref('')
const url = ref('')
const date = ref('')
const primary = ref('')
const info = ref('')
const success = ref('')
const warning = ref('')
const danger = ref('')
const small = ref('')
const normal = ref('')
const medium = ref('')
const large = ref('')
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
