<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Checkbox Component
      </h1>
      <p class="subtitle">
        Checkbox input control with various styles
      </p>

      <t-demo-box label="Basic Checkbox">
        <t-field>
          <t-checkbox v-model="basic">
            Checkbox label
          </t-checkbox>
        </t-field>
        <p class="has-text-grey">
          Checked: {{ basic }}
        </p>
      </t-demo-box>

      <t-demo-box label="Multiple Checkboxes">
        <t-field>
          <t-checkbox v-model="option1">
            Option 1
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="option2">
            Option 2
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="option3">
            Option 3
          </t-checkbox>
        </t-field>
        <p class="has-text-grey">
          Selected: {{ [option1 && 'Option 1', option2 && 'Option 2', option3 && 'Option 3'].filter(Boolean).join(', ') || 'None' }}
        </p>
      </t-demo-box>

      <t-demo-box label="Variants">
        <t-field v-for="variant in variants" :key="variant">
          <t-checkbox v-model="variantValues[variant]" :variant="variant">
            {{ capitalize(variant) }}
          </t-checkbox>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <t-field v-for="size in sizes" :key="size">
          <t-checkbox v-model="sizeValues[size]" :size="size">
            {{ capitalize(size) }} checkbox
          </t-checkbox>
        </t-field>
      </t-demo-box>

      <t-demo-box label="States">
        <t-field>
          <t-checkbox v-model="stateDisabled" disabled>
            Disabled checkbox
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="stateDisabledChecked" disabled>
            Disabled checked
          </t-checkbox>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Indeterminate State">
        <p class="mb-3">
          The indeterminate state is useful for "Select All" checkboxes when some but not all items are selected.
        </p>
        <t-field>
          <t-checkbox
            v-model="selectAll"
            :indeterminate="indeterminate"
            variant="primary"
            @update:model-value="handleSelectAll"
          >
            <strong>Select All</strong>
          </t-checkbox>
        </t-field>
        <div class="ml-5 mt-3">
          <t-field>
            <t-checkbox v-model="items.item1" @update:model-value="updateSelectAll">
              Item 1
            </t-checkbox>
          </t-field>
          <t-field>
            <t-checkbox v-model="items.item2" @update:model-value="updateSelectAll">
              Item 2
            </t-checkbox>
          </t-field>
          <t-field>
            <t-checkbox v-model="items.item3" @update:model-value="updateSelectAll">
              Item 3
            </t-checkbox>
          </t-field>
          <t-field>
            <t-checkbox v-model="items.item4" @update:model-value="updateSelectAll">
              Item 4
            </t-checkbox>
          </t-field>
        </div>
        <p class="has-text-grey mt-3">
          Selected: {{ selectedItemsCount }} of {{ totalItems }}
        </p>
      </t-demo-box>

      <t-demo-box label="Array Binding">
        <p class="mb-3">
          Select your favorite fruits:
        </p>
        <t-field>
          <t-checkbox v-model="fruits" native-value="apple">
            Apple
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="fruits" native-value="banana">
            Banana
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="fruits" native-value="orange">
            Orange
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="fruits" native-value="grape">
            Grape
          </t-checkbox>
        </t-field>
        <p class="has-text-grey mt-3">
          Selected: {{ Array.isArray(fruits) && fruits.length > 0 ? fruits.join(', ') : 'None' }}
        </p>
      </t-demo-box>

      <t-demo-box label="With Additional Content">
        <t-field>
          <t-checkbox v-model="option1Content">
            <div>
              <strong>Option 1</strong>
              <p class="help">
                Additional content for option 1
              </p>
            </div>
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="option2Content">
            <div>
              <strong>Option 2</strong>
              <p class="help">
                Additional content for option 2
              </p>
            </div>
          </t-checkbox>
        </t-field>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { CoreVariants, CheckboxSizes } from '../../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const variants = CoreVariants
const sizes = CheckboxSizes

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const basic = ref<boolean>(false)
const option1 = ref<boolean>(false)
const option2 = ref<boolean>(true)
const option3 = ref<boolean>(false)

const variantValues = reactive<Record<string, boolean>>({
  primary: true,
  link: true,
  info: true,
  success: true,
  warning: true,
  danger: true
})

const sizeValues = reactive<Record<string, boolean>>({
  small: true,
  normal: true,
  medium: true,
  large: true
})

const stateDisabled = ref<boolean>(false)
const stateDisabledChecked = ref<boolean>(true)

const fruits = ref<string[]>(['banana', 'orange'])
const option1Content = ref<boolean>(true)
const option2Content = ref<boolean>(false)

// Indeterminate state demo
const selectAll = ref<boolean>(false)
const indeterminate = ref(true)
const items = ref<Record<string, boolean>>({
  item1: true,
  item2: false,
  item3: true,
  item4: false
})

const selectedItemsCount = computed(() => {
  return Object.values(items.value).filter(Boolean).length
})

const totalItems = computed(() => {
  return Object.keys(items.value).length
})

function updateSelectAll () {
  const selected = selectedItemsCount.value
  const total = totalItems.value

  if (selected === 0) {
    selectAll.value = false
    indeterminate.value = false
  } else if (selected === total) {
    selectAll.value = true
    indeterminate.value = false
  } else {
    selectAll.value = false
    indeterminate.value = true
  }
}

function handleSelectAll () {
  const newValue = selectAll.value
  items.value.item1 = newValue
  items.value.item2 = newValue
  items.value.item3 = newValue
  items.value.item4 = newValue
  indeterminate.value = false
}
</script>
