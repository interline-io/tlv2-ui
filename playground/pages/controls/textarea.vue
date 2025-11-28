<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Textarea Component
      </h1>
      <p class="subtitle">
        Multi-line text input control
      </p>

      <div class="content">
        <!-- Basic Textarea -->
        <h2 class="title is-3">
          Basic Textarea
        </h2>
        <div class="box">
          <t-field label="Enter your message:">
            <t-textarea v-model="basic" placeholder="Type something..." />
          </t-field>
          <p class="has-text-grey">
            Length: {{ basic.length }} characters
          </p>
        </div>

        <!-- Variants -->
        <h2 class="title is-3">
          Variants
        </h2>
        <div class="box">
          <t-field label="Primary:">
            <t-textarea v-model="variantPrimary" variant="primary" placeholder="Primary textarea" />
          </t-field>
          <t-field label="Info:">
            <t-textarea v-model="variantInfo" variant="info" placeholder="Info textarea" />
          </t-field>
          <t-field label="Success:">
            <t-textarea v-model="variantSuccess" variant="success" placeholder="Success textarea" />
          </t-field>
          <t-field label="Warning:">
            <t-textarea v-model="variantWarning" variant="warning" placeholder="Warning textarea" />
          </t-field>
          <t-field label="Danger:">
            <t-textarea v-model="variantDanger" variant="danger" placeholder="Danger textarea" />
          </t-field>
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <t-field label="Small:">
            <t-textarea v-model="sizeSmall" size="small" placeholder="Small textarea" />
          </t-field>
          <t-field label="Normal:">
            <t-textarea v-model="sizeNormal" placeholder="Normal textarea" />
          </t-field>
          <t-field label="Medium:">
            <t-textarea v-model="sizeMedium" size="medium" placeholder="Medium textarea" />
          </t-field>
          <t-field label="Large:">
            <t-textarea v-model="sizeLarge" size="large" placeholder="Large textarea" />
          </t-field>
        </div>

        <!-- Rows -->
        <h2 class="title is-3">
          Custom Row Height
        </h2>
        <div class="box">
          <t-field label="3 rows:">
            <t-textarea v-model="rows3" :rows="3" placeholder="3 rows" />
          </t-field>
          <t-field label="5 rows:">
            <t-textarea v-model="rows5" :rows="5" placeholder="5 rows" />
          </t-field>
          <t-field label="10 rows:">
            <t-textarea v-model="rows10" :rows="10" placeholder="10 rows" />
          </t-field>
        </div>

        <!-- States -->
        <h2 class="title is-3">
          States
        </h2>
        <div class="box">
          <t-field label="Disabled:">
            <t-textarea v-model="stateDisabled" disabled placeholder="This is disabled" />
          </t-field>
          <t-field label="Readonly:">
            <t-textarea v-model="stateReadonly" readonly />
          </t-field>
          <t-field label="Loading:">
            <t-textarea v-model="stateLoading" loading placeholder="Loading..." />
          </t-field>
        </div>

        <!-- Maxlength -->
        <h2 class="title is-3">
          With Maxlength Counter
        </h2>
        <div class="box">
          <t-field label="Tweet (280 characters max):">
            <t-textarea v-model="tweet" :maxlength="280" placeholder="What's happening?" />
          </t-field>
          <p class="has-text-grey">
            {{ tweet.length }}/280 characters
          </p>
        </div>

        <!-- Fixed Size -->
        <h2 class="title is-3">
          Fixed Size (No Resize)
        </h2>
        <div class="box">
          <t-field label="Fixed size textarea:">
            <t-textarea
              v-model="fixed"
              has-fixed-size
              placeholder="This textarea cannot be resized"
            />
          </t-field>
        </div>

        <!-- Practical Examples -->
        <h2 class="title is-3">
          Feedback Form
        </h2>
        <div class="box">
          <t-field label="Your Feedback:" message="Help us improve our service">
            <t-textarea
              v-model="feedback"
              :rows="5"
              placeholder="Tell us what you think..."
              :maxlength="500"
            />
          </t-field>
          <p class="help">
            {{ feedback.length }}/500 characters
          </p>
          <t-button variant="primary" class="mt-3" @click="submitFeedback">
            Submit Feedback
          </t-button>
        </div>

        <!-- Code Editor -->
        <h2 class="title is-3">
          Code Snippet
        </h2>
        <div class="box">
          <t-field label="Enter your code:">
            <t-textarea
              v-model="code"
              :rows="8"
              placeholder="// Write your code here..."
              class="is-family-monospace"
            />
          </t-field>
        </div>

        <!-- Comment Section -->
        <h2 class="title is-3">
          Comment Section
        </h2>
        <div class="box">
          <t-field label="Add a comment:">
            <t-textarea
              v-model="comment"
              :rows="4"
              placeholder="Share your thoughts..."
              :maxlength="1000"
            />
          </t-field>
          <div class="is-flex is-justify-content-space-between is-align-items-center mt-2">
            <p class="help">
              {{ comment.length }}/1000
            </p>
            <t-button
              variant="primary"
              :disabled="comment.trim().length === 0"
              @click="postComment"
            >
              Post Comment
            </t-button>
          </div>
        </div>

        <!-- Description with Help -->
        <h2 class="title is-3">
          With Help Text
        </h2>
        <div class="box">
          <t-field
            label="Product Description:"
            message="Provide a detailed description of your product"
          >
            <t-textarea
              v-model="description"
              :rows="6"
              placeholder="Describe features, specifications, and benefits..."
            />
          </t-field>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const basic = ref('')

const variantPrimary = ref('Primary styled textarea')
const variantInfo = ref('Info styled textarea')
const variantSuccess = ref('Success styled textarea')
const variantWarning = ref('Warning styled textarea')
const variantDanger = ref('Danger styled textarea')

const sizeSmall = ref('')
const sizeNormal = ref('')
const sizeMedium = ref('')
const sizeLarge = ref('')

const rows3 = ref('')
const rows5 = ref('')
const rows10 = ref('')

const stateDisabled = ref('This content cannot be edited')
const stateReadonly = ref('This is readonly text. You can select and copy it, but cannot modify it.')
const stateLoading = ref('')

const tweet = ref('Building an awesome component library with Vue and TypeScript! 🚀 #Vue #TypeScript #WebDev')
const fixed = ref('')
const feedback = ref('')
const code = ref('function hello() {\n  console.log("Hello, world!");\n}')
const comment = ref('')
const description = ref('')

const submitFeedback = () => {
  alert(`Feedback submitted: ${feedback.value}`)
}

const postComment = () => {
  alert(`Comment posted: ${comment.value}`)
  comment.value = ''
}
</script>
