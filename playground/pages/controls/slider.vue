<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Slider Component
      </h1>
      <p class="subtitle">
        Range slider with clickable tick marks
      </p>

      <div class="content">
        <!-- Basic Slider -->
        <h2 class="title is-3">
          Basic Slider
        </h2>
        <div class="box">
          <t-field label="Volume">
            <t-slider v-model="volume" :min="0" :max="100" />
          </t-field>
          <p class="has-text-grey">
            Value: {{ volume }}
          </p>
        </div>

        <!-- Slider with Step -->
        <h2 class="title is-3">
          Slider with Step
        </h2>
        <div class="box">
          <t-field label="Rating (step of 0.5)">
            <t-slider v-model="rating" :min="0" :max="5" :step="0.5" />
          </t-field>
          <p class="has-text-grey">
            Value: {{ rating }}
          </p>
        </div>

        <!-- Slider with Ticks -->
        <h2 class="title is-3">
          Slider with Clickable Ticks
        </h2>
        <div class="box">
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
        </div>

        <!-- Slider Sizes -->
        <h2 class="title is-3">
          Slider Sizes
        </h2>
        <div class="box">
          <t-field label="Small">
            <t-slider v-model="small" :min="0" :max="100" size="small" />
          </t-field>
          <t-field label="Normal">
            <t-slider v-model="normal" :min="0" :max="100" />
          </t-field>
          <t-field label="Medium">
            <t-slider v-model="medium" :min="0" :max="100" size="medium" />
          </t-field>
          <t-field label="Large">
            <t-slider v-model="large" :min="0" :max="100" size="large" />
          </t-field>
        </div>

        <!-- Disabled Slider -->
        <h2 class="title is-3">
          Disabled Slider
        </h2>
        <div class="box">
          <t-field label="Locked Setting">
            <t-slider v-model="disabled" :min="0" :max="100" disabled />
          </t-field>
          <p class="has-text-grey">
            Value: {{ disabled }} (cannot be changed)
          </p>
        </div>

        <!-- Slider with Tooltip -->
        <h2 class="title is-3">
          Slider with Tooltip
        </h2>
        <div class="box">
          <t-field label="Brightness">
            <t-slider v-model="brightness" :min="0" :max="100" tooltip />
          </t-field>
          <p class="has-text-grey">
            Value: {{ brightness }}%
          </p>
        </div>

        <!-- Multiple Sliders -->
        <h2 class="title is-3">
          Color Mixer Example
        </h2>
        <div class="box">
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
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const volume = ref(50)
const rating = ref(3.5)
const time = ref(30)
const small = ref(25)
const normal = ref(50)
const medium = ref(75)
const large = ref(100)
const disabled = ref(60)
const brightness = ref(80)

const red = ref(128)
const green = ref(64)
const blue = ref(192)
</script>
