<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Checkbox Group Component
      </h1>
      <p class="subtitle">
        Checkbox group with "undefined means all" semantic for async-loaded options
      </p>

      <t-msg variant="info" class="mb-5">
        <p>
          This component solves the common problem of checkbox groups backed by async-loaded options,
          where <code>undefined</code> means "all selected" and <code>[]</code> means "none selected".
          See the component's JSDoc for detailed documentation.
        </p>
      </t-msg>

      <t-demo-box label="Basic Usage (undefined means all by default)">
        <p class="mb-3">
          This demonstrates the key feature: <code>undefined</code> means "all selected" until the user interacts.
          An empty array <code>[]</code> means "none selected".
        </p>
        <t-checkbox-group
          v-model="selectedFruits"
          :options="fruitOptions"
          label-field="name"
          value-field="id"
        />
        <div class="mt-4 p-3 has-background-light">
          <p><strong>Raw modelValue:</strong> <code>{{ JSON.stringify(selectedFruits) }}</code></p>
          <p class="mt-2">
            <span v-if="selectedFruits === undefined" class="tag is-info">undefined = All selected (uninitialized)</span>
            <span v-else-if="selectedFruits.length === 0" class="tag is-warning">[] = None selected</span>
            <span v-else class="tag is-success">Specific items: {{ selectedFruits.join(', ') }}</span>
          </p>
        </div>
        <div class="mt-3 buttons">
          <t-button size="small" @click="selectedFruits = undefined">
            Reset to undefined
          </t-button>
          <t-button size="small" @click="selectedFruits = []">
            Set to []
          </t-button>
          <t-button size="small" @click="selectedFruits = ['apple']">
            Set to ['apple']
          </t-button>
        </div>
      </t-demo-box>

      <t-demo-box label="Simulated Async Loading + Custom Option Rendering">
        <p class="mb-3">
          This simulates the common pattern: options load after a delay, but selection state
          is preserved correctly. <code>undefined</code> means "all agencies selected" before AND after load.
        </p>
        <p class="mb-3">
          <strong>Custom rendering:</strong> Uses the <code>#option</code> slot to display both the agency name
          and its ID as a tag. The slot receives the full option object, so you can display any property
          (like <code>option.name</code>) even though the model only stores the value field (<code>onestop_id</code>).
        </p>
        <div class="buttons mb-3">
          <t-button :loading="loadingAgencies" @click="loadAgencies">
            {{ agencies.length > 0 ? 'Reload' : 'Load' }} Agencies
          </t-button>
          <t-button variant="warning" @click="resetDemo">
            Reset Demo
          </t-button>
        </div>
        <t-checkbox-group
          v-model="selectedAgencies"
          :options="agencies"
          label-field="name"
          value-field="onestop_id"
          empty-label="Click 'Load Agencies' to fetch options..."
        >
          <!-- Custom option template: slot receives { option, selected } -->
          <template #option="{ option }">
            <span>{{ option.name }}</span>
            <span class="tag is-light ml-2">{{ option.onestop_id }}</span>
          </template>
        </t-checkbox-group>
        <div class="mt-4 p-3 has-background-light">
          <p><strong>selectedAgencies:</strong> <code>{{ JSON.stringify(selectedAgencies) }}</code></p>
          <p class="mt-2">
            <span v-if="selectedAgencies === undefined" class="tag is-info">
              undefined = All agencies (even those not loaded yet!)
            </span>
            <span v-else-if="selectedAgencies.length === 0" class="tag is-warning">
              [] = No agencies selected
            </span>
            <span v-else class="tag is-success">
              {{ selectedAgencies.length }} specific agencies selected
            </span>
          </p>
        </div>
      </t-demo-box>

      <t-demo-box label="Simple String Options">
        <p class="mb-3">
          Works with simple string arrays too.
        </p>
        <t-checkbox-group
          v-model="selectedRouteTypes"
          :options="routeTypeOptions"
        />
        <div class="mt-4 p-3 has-background-light">
          <p><strong>selectedRouteTypes:</strong> <code>{{ JSON.stringify(selectedRouteTypes) }}</code></p>
        </div>
      </t-demo-box>

      <t-demo-box label="Traditional mode: undefined-means-none">
        <p class="mb-3">
          When <code>undefined-means-none</code> is set, the component behaves traditionally:
          <code>undefined</code> is treated as empty selection.
        </p>
        <t-checkbox-group
          v-model="traditionalSelection"
          :options="['Option A', 'Option B', 'Option C']"
          undefined-means-none
        />
        <div class="mt-4 p-3 has-background-light">
          <p><strong>traditionalSelection:</strong> <code>{{ JSON.stringify(traditionalSelection) }}</code></p>
        </div>
      </t-demo-box>

      <t-demo-box label="Customization Options">
        <p class="mb-3">
          Various customization options: variants, sizes, hiding select-all, etc.
        </p>
        <div class="columns">
          <div class="column">
            <h4 class="title is-6">
              With Variant
            </h4>
            <t-checkbox-group
              v-model="customDemo1"
              :options="['Red', 'Green', 'Blue']"
              variant="success"
            />
          </div>
          <div class="column">
            <h4 class="title is-6">
              hide-select-all
            </h4>
            <t-checkbox-group
              v-model="customDemo2"
              :options="['Small', 'Medium', 'Large']"
              hide-select-all
            />
          </div>
          <div class="column">
            <h4 class="title is-6">
              Disabled
            </h4>
            <t-checkbox-group
              v-model="customDemo3"
              :options="['Locked', 'Options']"
              disabled
            />
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Edge Case: Deselect All One-by-One">
        <p class="mb-3">
          This demonstrates the fix for the bug where deselecting the last item would reset to "all selected".
          Try deselecting all items one by one - it should result in <code>[]</code>, not <code>undefined</code>.
        </p>
        <t-checkbox-group
          v-model="edgeCaseSelection"
          :options="['First', 'Second', 'Third']"
        />
        <div class="mt-4 p-3 has-background-light">
          <p><strong>edgeCaseSelection:</strong> <code>{{ JSON.stringify(edgeCaseSelection) }}</code></p>
          <p v-if="edgeCaseSelection !== undefined && edgeCaseSelection.length === 0" class="has-text-success mt-2">
            ✓ Correctly shows [] (empty array), not undefined!
          </p>
        </div>
        <t-button class="mt-2" size="small" @click="edgeCaseSelection = undefined">
          Reset to undefined
        </t-button>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TDemoBox from '../../components/t-demo-box.vue'
import TCheckboxGroup from '../../../../src/runtime/controls/checkbox-group.vue'
import TButton from '../../../../src/runtime/controls/button.vue'

// Basic demo
const fruitOptions = [
  { id: 'apple', name: 'Apple' },
  { id: 'banana', name: 'Banana' },
  { id: 'orange', name: 'Orange' },
  { id: 'grape', name: 'Grape' }
]
const selectedFruits = ref<string[] | undefined>(undefined)

// Async loading demo
interface Agency {
  onestop_id: string
  name: string
}
const agencies = ref<Agency[]>([])
const selectedAgencies = ref<string[] | undefined>(undefined)
const loadingAgencies = ref(false)

async function loadAgencies () {
  loadingAgencies.value = true
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  agencies.value = [
    { onestop_id: 'o-9q9-bart', name: 'Bay Area Rapid Transit' },
    { onestop_id: 'o-9q9-caltrain', name: 'Caltrain' },
    { onestop_id: 'o-9q9-sfmta', name: 'SF Municipal Transportation' },
    { onestop_id: 'o-9q9-actransit', name: 'AC Transit' },
    { onestop_id: 'o-9q9-vta', name: 'VTA' }
  ]
  loadingAgencies.value = false
}

function resetDemo () {
  agencies.value = []
  selectedAgencies.value = undefined
}

// Simple string options
const routeTypeOptions = ['metro', 'bus', 'rail', 'ferry', 'cable_car']
const selectedRouteTypes = ref<string[] | undefined>(undefined)

// Traditional mode (undefinedMeansNone: true)
const traditionalSelection = ref<string[] | undefined>(undefined)

// Customization demos
const customDemo1 = ref<string[] | undefined>(undefined)
const customDemo2 = ref<string[] | undefined>(undefined)
const customDemo3 = ref<string[] | undefined>(['Locked'])

// Edge case demo
const edgeCaseSelection = ref<string[] | undefined>(undefined)
</script>
