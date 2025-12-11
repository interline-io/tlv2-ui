<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Slider Component
      </h1>
      <p class="subtitle">
        Range slider with clickable tick marks
      </p>

      <!-- Basic Slider -->
      <t-demo-box label="Basic Slider">
        <t-field label="Volume">
          <t-slider v-model="volume" :min="0" :max="100" />
        </t-field>
        <p class="has-text-grey">
          Value: {{ volume }}
        </p>
      </t-demo-box>

      <!-- Variants -->
      <t-demo-box label="Variants">
        <t-field v-for="variant in variants" :key="variant" :label="capitalize(variant)">
          <t-slider v-model="variantValues[variant]" :min="0" :max="100" :variant="variant" />
        </t-field>
      </t-demo-box>

      <!-- Slider with Step -->
      <t-demo-box label="Slider with Step">
        <t-field label="Rating (step of 0.5)">
          <t-slider v-model="rating" :min="0" :max="5" :step="0.5" />
        </t-field>
        <p class="has-text-grey">
          Value: {{ rating }}
        </p>
      </t-demo-box>

      <!-- Slider with Ticks -->
      <t-demo-box label="Slider with Clickable Ticks">
        <t-field label="Time (minutes)">
          <t-slider v-model="time" :min="0" :max="60" :step="10">
            <t-slider-tick :value="0">
              0
            </t-slider-tick>
            <t-slider-tick :value="10">
              10
            </t-slider-tick>
            <t-slider-tick :value="20">
              20
            </t-slider-tick>
            <t-slider-tick :value="30">
              30
            </t-slider-tick>
            <t-slider-tick :value="40">
              40
            </t-slider-tick>
            <t-slider-tick :value="50">
              50
            </t-slider-tick>
            <t-slider-tick :value="60">
              60
            </t-slider-tick>
          </t-slider>
        </t-field>
        <p class="has-text-grey">
          Value: {{ time }} minutes
        </p>
      </t-demo-box>

      <!-- Slider Sizes -->
      <t-demo-box label="Slider Sizes">
        <t-field v-for="sliderSize in sizes" :key="sliderSize" :label="capitalize(sliderSize)">
          <t-slider v-model="sizeValues[sliderSize]" :min="0" :max="100" :size="sliderSize" />
        </t-field>
      </t-demo-box>

      <!-- Disabled Slider -->
      <t-demo-box label="Disabled Slider">
        <t-field label="Locked Setting">
          <t-slider v-model="disabled" :min="0" :max="100" disabled />
        </t-field>
        <p class="has-text-grey">
          Value: {{ disabled }} (cannot be changed)
        </p>
      </t-demo-box>

      <!-- Slider with Tooltip -->
      <t-demo-box label="Slider with Tooltip">
        <t-field label="Brightness">
          <t-slider v-model="brightness" :min="0" :max="100" tooltip />
        </t-field>
        <p class="has-text-grey">
          Value: {{ brightness }}%
        </p>
      </t-demo-box>

      <!-- Multiple Sliders -->
      <t-demo-box label="Example: Color Mixer" example>
        <t-field label="Red">
          <t-slider v-model="red" :min="0" :max="255" />
        </t-field>
        <t-field label="Green">
          <t-slider v-model="green" :min="0" :max="255" />
        </t-field>
        <t-field label="Blue">
          <t-slider v-model="blue" :min="0" :max="255" />
        </t-field>
        <div
          class="box has-text-centered"
          :style="{ backgroundColor: `rgb(${red}, ${green}, ${blue})`, minHeight: '100px', color: brightness > 128 ? '#000' : '#fff' }"
        >
          <strong>RGB({{ red }}, {{ green }}, {{ blue }})</strong>
        </div>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { SliderSizes, SliderVariants } from '../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const sizes = SliderSizes
const variants = SliderVariants

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const volume = ref(50)
const rating = ref(3.5)
const time = ref(30)

const sizeValues = reactive<Record<string, number>>({})
for (const sliderSize of sizes) {
  sizeValues[sliderSize] = sliderSize === 'small' ? 25 : sliderSize === 'normal' ? 50 : sliderSize === 'medium' ? 75 : 100
}

const variantValues = reactive<Record<string, number>>({})
for (const variant of variants) {
  variantValues[variant] = 50
}

const disabled = ref(60)
const brightness = ref(80)

const red = ref(128)
const green = ref(64)
const blue = ref(192)
</script>
