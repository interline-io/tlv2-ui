<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Button Component
      </h1>
      <p class="subtitle">
        Interactive button control with various styles and states
      </p>

      <t-demo-box label="Variants">
        <div class="buttons">
          <t-button>
            Default
          </t-button>
          <t-button variant="primary">
            Primary
          </t-button>
          <t-button variant="info">
            Info
          </t-button>
          <t-button variant="success">
            Success
          </t-button>
          <t-button variant="warning">
            Warning
          </t-button>
          <t-button variant="danger">
            Danger
          </t-button>
          <t-button variant="light">
            Light
          </t-button>
          <t-button variant="dark">
            Dark
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <div class="buttons">
          <t-button size="small">
            Small
          </t-button>
          <t-button>
            Normal
          </t-button>
          <t-button size="medium">
            Medium
          </t-button>
          <t-button size="large">
            Large
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Outlined">
        <div class="buttons">
          <t-button variant="primary" outlined>
            Primary
          </t-button>
          <t-button variant="info" outlined>
            Info
          </t-button>
          <t-button variant="success" outlined>
            Success
          </t-button>
          <t-button variant="warning" outlined>
            Warning
          </t-button>
          <t-button variant="danger" outlined>
            Danger
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Rounded">
        <div class="buttons">
          <t-button variant="primary" rounded>
            Rounded
          </t-button>
          <t-button variant="info" rounded outlined>
            Rounded Outlined
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="With Icons">
        <div class="buttons">
          <t-button variant="primary">
            <t-icon icon="check" />
            <span>Save</span>
          </t-button>
          <t-button variant="danger">
            <t-icon icon="delete" />
            <span>Delete</span>
          </t-button>
          <t-button variant="info">
            <span>Download</span>
            <t-icon icon="download" />
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Icon Only">
        <div class="buttons">
          <t-button variant="primary">
            <t-icon icon="heart" />
          </t-button>
          <t-button variant="info">
            <t-icon icon="share" />
          </t-button>
          <t-button variant="success">
            <t-icon icon="check" />
          </t-button>
          <t-button variant="warning">
            <t-icon icon="alert" />
          </t-button>
          <t-button variant="danger">
            <t-icon icon="close" />
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="States">
        <div class="buttons">
          <t-button variant="primary" loading>
            Loading
          </t-button>
          <t-button variant="info" disabled>
            Disabled
          </t-button>
          <t-button variant="success" @click="handleClick">
            Click Me ({{ clickCount }})
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Full Width">
        <t-button variant="primary" fullwidth>
          Full Width Button
        </t-button>
      </t-demo-box>

      <t-demo-box label="Button Groups">
        <t-field addons>
          <t-button variant="primary">
            Left
          </t-button>
          <t-button variant="primary">
            Middle
          </t-button>
          <t-button variant="primary">
            Right
          </t-button>
        </t-field>

        <t-field addons>
          <t-button>
            Yes
          </t-button>
          <t-button variant="info">
            Maybe
          </t-button>
          <t-button variant="danger">
            No
          </t-button>
        </t-field>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clickCount = ref(0)

const handleClick = () => {
  clickCount.value++
}
</script>
