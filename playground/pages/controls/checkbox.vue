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
        <t-field>
          <t-checkbox v-model="variantPrimary" variant="primary">
            Primary
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="variantInfo" variant="info">
            Info
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="variantSuccess" variant="success">
            Success
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="variantWarning" variant="warning">
            Warning
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="variantDanger" variant="danger">
            Danger
          </t-checkbox>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <t-field>
          <t-checkbox v-model="sizeSmall" size="small">
            Small checkbox
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="sizeNormal">
            Normal checkbox
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="sizeMedium" size="medium">
            Medium checkbox
          </t-checkbox>
        </t-field>
        <t-field>
          <t-checkbox v-model="sizeLarge" size="large">
            Large checkbox
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
            @change="handleSelectAll"
          >
            <strong>Select All</strong>
          </t-checkbox>
        </t-field>
        <div class="ml-5 mt-3">
          <t-field>
            <t-checkbox v-model="items.item1" @change="updateSelectAll">
              Item 1
            </t-checkbox>
          </t-field>
          <t-field>
            <t-checkbox v-model="items.item2" @change="updateSelectAll">
              Item 2
            </t-checkbox>
          </t-field>
          <t-field>
            <t-checkbox v-model="items.item3" @change="updateSelectAll">
              Item 3
            </t-checkbox>
          </t-field>
          <t-field>
            <t-checkbox v-model="items.item4" @change="updateSelectAll">
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
          Selected: {{ fruits.length > 0 ? fruits.join(', ') : 'None' }}
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
import { ref, computed } from 'vue'

const basic = ref(false)
const option1 = ref(false)
const option2 = ref(true)
const option3 = ref(false)

const variantPrimary = ref(true)
const variantInfo = ref(true)
const variantSuccess = ref(true)
const variantWarning = ref(true)
const variantDanger = ref(true)

const sizeSmall = ref(true)
const sizeNormal = ref(true)
const sizeMedium = ref(true)
const sizeLarge = ref(true)

const stateDisabled = ref(false)
const stateDisabledChecked = ref(true)

const fruits = ref(['banana', 'orange'])
const option1Content = ref(true)
const option2Content = ref(false)

// Indeterminate state demo
const selectAll = ref(false)
const indeterminate = ref(true)
const items = ref({
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
