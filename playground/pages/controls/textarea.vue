<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Textarea Component
      </h1>
      <p class="subtitle">
        Multi-line text input control
      </p>

      <!-- Basic Textarea -->
      <t-demo-box label="Basic Textarea">
        <t-field label="Enter your message:">
          <t-textarea v-model="basic" placeholder="Type something..." />
        </t-field>
        <p class="has-text-grey">
          Length: {{ basic.length }} characters
        </p>
      </t-demo-box>

      <!-- Variants -->
      <t-demo-box label="Variants">
        <t-field v-for="variant in variants" :key="variant" :label="capitalize(variant) + ':'">
          <t-textarea v-model="variantValues[variant]" :variant="variant" :placeholder="capitalize(variant) + ' textarea'" />
        </t-field>
      </t-demo-box>

      <!-- Sizes -->
      <t-demo-box label="Sizes">
        <t-field v-for="textareaSize in sizes" :key="textareaSize" :label="capitalize(textareaSize) + ':'">
          <t-textarea v-model="sizeValues[textareaSize]" :size="textareaSize" :placeholder="capitalize(textareaSize) + ' textarea'" />
        </t-field>
      </t-demo-box>

      <!-- Rows -->
      <t-demo-box label="Custom Row Height">
        <t-field label="3 rows:">
          <t-textarea v-model="rows3" :rows="3" placeholder="3 rows" />
        </t-field>
        <t-field label="5 rows:">
          <t-textarea v-model="rows5" :rows="5" placeholder="5 rows" />
        </t-field>
        <t-field label="10 rows:">
          <t-textarea v-model="rows10" :rows="10" placeholder="10 rows" />
        </t-field>
      </t-demo-box>

      <!-- States -->
      <t-demo-box label="States">
        <t-field label="Disabled:">
          <t-textarea v-model="stateDisabled" disabled placeholder="This is disabled" />
        </t-field>
        <t-field label="Readonly:">
          <t-textarea v-model="stateReadonly" readonly />
        </t-field>
        <t-field label="Loading:">
          <t-textarea v-model="stateLoading" loading placeholder="Loading..." />
        </t-field>
      </t-demo-box>

      <!-- Maxlength -->
      <t-demo-box label="With Maxlength Counter">
        <t-field label="Tweet (280 characters max):">
          <t-textarea v-model="tweet" :maxlength="280" placeholder="What's happening?" />
        </t-field>
        <p class="has-text-grey">
          {{ tweet.length }} / 280 characters
        </p>
      </t-demo-box>

      <!-- Fixed Size -->
      <t-demo-box label="Fixed Size (No Resize)">
        <t-field label="Fixed size textarea:">
          <t-textarea
            v-model="fixed"
            has-fixed-size
            placeholder="This textarea cannot be resized"
          />
        </t-field>
      </t-demo-box>

      <!-- Practical Examples -->
      <t-demo-box label="Example: Feedback Form" example>
        <t-field label="Your Feedback:" message="Help us improve our service">
          <t-textarea
            v-model="feedback"
            :rows="5"
            placeholder="Tell us what you think..."
            :maxlength="500"
          />
        </t-field>
        <p class="help">
          {{ feedback.length }} / 500 characters
        </p>
        <t-button variant="primary" class="mt-3" @click="submitFeedback">
          Submit Feedback
        </t-button>
      </t-demo-box>

      <!-- Code Editor -->
      <t-demo-box label="Example: Code Snippet" example>
        <t-field label="Enter your code:">
          <t-textarea
            v-model="code"
            :rows="8"
            placeholder="// Write your code here..."
            class="is-family-monospace"
          />
        </t-field>
      </t-demo-box>

      <!-- Comment Section -->
      <t-demo-box label="Example: Comment Section" example>
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
      </t-demo-box>

      <!-- Description with Help -->
      <t-demo-box label="Example: With Help Text" example>
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
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { TextareaVariants, TextareaSizes } from '../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const variants = TextareaVariants
const sizes = TextareaSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const basic = ref('')

const variantValues = reactive<Record<string, string>>({})
for (const variant of variants) {
  variantValues[variant] = ''
}

const sizeValues = reactive<Record<string, string>>({})
for (const textareaSize of sizes) {
  sizeValues[textareaSize] = ''
}

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
