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
          <t-button v-for="variant in coreVariants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </t-button>
        </div>
        <div class="buttons">
          <t-button v-for="variant in additionalVariants" :key="variant" :variant="variant">
            {{ capitalize(variant) }}
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <div class="buttons">
          <t-button v-for="size in sizes" :key="size" :size="size">
            {{ capitalize(size) }}
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Outlined">
        <div class="buttons">
          <t-button v-for="variant in coreVariants" :key="variant" :variant="variant" outlined>
            {{ capitalize(variant) }}
          </t-button>
        </div>
        <div class="buttons">
          <t-button v-for="variant in additionalVariants" :key="variant" :variant="variant" outlined>
            {{ capitalize(variant) }}
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

      <t-demo-box label="Icon Props (icon-left / icon-right)">
        <div class="buttons">
          <t-button variant="primary" icon-left="check">
            Save
          </t-button>
          <t-button variant="danger" icon-left="delete">
            Delete
          </t-button>
          <t-button variant="info" icon-right="download">
            Download
          </t-button>
          <t-button variant="success" icon-left="upload" icon-right="check">
            Upload & Verify
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
import { CoreVariants, ButtonVariants, ButtonSizes } from '../../../src/runtime/controls/types'

const coreVariants = CoreVariants
const additionalVariants = ButtonVariants.filter(v => !CoreVariants.includes(v as any))
const sizes = ButtonSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const clickCount = ref(0)

const handleClick = () => {
  clickCount.value++
}
</script>
