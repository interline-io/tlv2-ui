<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Modal Component
      </h1>
      <p class="subtitle">
        Modal dialog with various configurations
      </p>

      <t-demo-box label="Basic Modal">
        <t-button variant="primary" @click="showBasic = true">
          Open Basic Modal
        </t-button>
        <t-modal v-model="showBasic" title="Basic Modal">
          <p>This is a basic modal with a title and content.</p>
          <p>You can close it by clicking the X button or outside the modal.</p>
        </t-modal>
      </t-demo-box>

      <t-demo-box label="Modal Sizes">
        <div class="buttons">
          <t-button variant="info" @click="showSmall = true">
            Small Modal
          </t-button>
          <t-button variant="info" @click="showMedium = true">
            Medium Modal
          </t-button>
          <t-button variant="info" @click="showLarge = true">
            Large Modal
          </t-button>
        </div>
        <t-modal v-model="showSmall" title="Small Modal" size="small">
          <p>This is a small modal.</p>
        </t-modal>
        <t-modal v-model="showMedium" title="Medium Modal" size="medium">
          <p>This is a medium modal with more space for content.</p>
          <p>It can hold more information than a small modal.</p>
        </t-modal>
        <t-modal v-model="showLarge" title="Large Modal" size="large">
          <p>This is a large modal with plenty of space for extensive content.</p>
          <p>Perfect for forms or detailed information.</p>
          <p>You can add as much content as needed here.</p>
        </t-modal>
      </t-demo-box>

      <t-demo-box label="Fullscreen Modal">
        <t-button variant="success" @click="showFullscreen = true">
          Open Fullscreen Modal
        </t-button>
        <t-modal v-model="showFullscreen" title="Fullscreen Modal" full-screen>
          <div class="content">
            <h3>This modal takes up almost the entire viewport</h3>
            <p>Perfect for complex forms or detailed views.</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque risus mi, tempus quis placerat ut, porta nec nulla.
            </p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>
        </t-modal>
      </t-demo-box>

      <t-demo-box label="Modal with Footer">
        <t-button variant="warning" @click="showFooter = true">
          Open Modal with Footer
        </t-button>
        <t-modal v-model="showFooter" title="Confirm Action">
          <p>Are you sure you want to proceed with this action?</p>
          <p>This operation cannot be undone.</p>
          <template #footer>
            <div class="buttons">
              <t-button variant="danger" @click="handleConfirm">
                Confirm
              </t-button>
              <t-button @click="showFooter = false">
                Cancel
              </t-button>
            </div>
          </template>
        </t-modal>
      </t-demo-box>

      <t-demo-box label="Modal without Close Button">
        <t-button variant="danger" @click="showNoClose = true">
          Open Modal (No Close Button)
        </t-button>
        <t-modal v-model="showNoClose" title="Important Message" :closable="false">
          <p>This modal doesn't have a close button.</p>
          <p>You must use the button below to close it.</p>
          <t-button variant="primary" @click="showNoClose = false">
            I Understand
          </t-button>
        </t-modal>
      </t-demo-box>

      <t-demo-box label="Example: Form in Modal" example>
        <t-button variant="primary" @click="showForm = true">
          Open Form Modal
        </t-button>
        <t-modal v-model="showForm" title="User Registration">
          <t-field label="Full Name">
            <t-input v-model="formData.name" placeholder="Enter your name" />
          </t-field>
          <t-field label="Email">
            <t-input v-model="formData.email" type="email" placeholder="email@example.com" />
          </t-field>
          <t-field label="Password">
            <t-input v-model="formData.password" type="password" placeholder="Enter password" />
          </t-field>
          <t-field label="Bio">
            <t-textarea v-model="formData.bio" placeholder="Tell us about yourself" :rows="4" />
          </t-field>
          <template #footer>
            <div class="buttons">
              <t-button variant="primary" @click="handleSubmit">
                Submit
              </t-button>
              <t-button @click="showForm = false">
                Cancel
              </t-button>
            </div>
          </template>
        </t-modal>
        <t-notification v-if="resultMessage" variant="success" class="mt-4">
          {{ resultMessage }}
        </t-notification>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToastNotification } from '../../../src/runtime/composables/useToastNotification'
import TDemoBox from '../../components/t-demo-box.vue'

const { showToast } = useToastNotification()

const showBasic = ref(false)
const showSmall = ref(false)
const showMedium = ref(false)
const showLarge = ref(false)
const showFullscreen = ref(false)
const showFooter = ref(false)
const showNoClose = ref(false)
const showForm = ref(false)
const resultMessage = ref('')

const formData = ref({
  name: '',
  email: '',
  password: '',
  bio: ''
})

const handleConfirm = () => {
  showFooter.value = false
  showToast('Action confirmed!', 'success')
}

const handleSubmit = () => {
  showForm.value = false
  resultMessage.value = `Form submitted for ${formData.value.name}`
  showToast('Registration successful!', 'success')

  // Reset form
  setTimeout(() => {
    formData.value = { name: '', email: '', password: '', bio: '' }
    resultMessage.value = ''
  }, 3000)
}
</script>
