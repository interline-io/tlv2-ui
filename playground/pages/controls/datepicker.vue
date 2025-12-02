<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Datepicker Component
      </h1>
      <p class="subtitle">
        Calendar-based date selection component with customizable options.
      </p>

      <t-demo-box label="Basic Usage">
        <t-datepicker
          v-model:model-value="singleDate"
          placeholder="Select a date"
        />
        <p class="mt-3">
          Selected: {{ singleDate ? formatDateDisplay(singleDate) : 'None' }}
        </p>
      </t-demo-box>

      <t-demo-box label="Multiple Date Selection">
        <t-datepicker
          v-model:model-value="multipleDates as any"
          placeholder="Select dates"
          multiple
          :close-on-select="false"
        />
        <p class="mt-3">
          Selected dates: {{ multipleDates.length }}
        </p>
        <ul v-if="multipleDates.length">
          <li v-for="(date, i) in multipleDates" :key="i">
            {{ formatDateDisplay(date) }}
          </li>
        </ul>
      </t-demo-box>

      <t-demo-box label="Date Range Constraints">
        <t-datepicker
          v-model:model-value="constrainedDate"
          placeholder="Select date (next 30 days)"
          :min-date="minDate"
          :max-date="maxDate"
        />
        <p class="mt-3">
          Selected: {{ constrainedDate ? formatDateDisplay(constrainedDate) : 'None' }}
        </p>
        <p class="is-size-7 has-text-grey">
          Min: {{ formatDateDisplay(minDate) }}, Max: {{ formatDateDisplay(maxDate) }}
        </p>
      </t-demo-box>

      <t-demo-box label="Unselectable Days of Week">
        <t-datepicker
          v-model:model-value="weekdayDate"
          placeholder="Weekdays only"
          :unselectable-days-of-week="[0, 6]"
        />
        <p class="mt-3">
          Selected: {{ weekdayDate ? formatDateDisplay(weekdayDate) : 'None' }}
        </p>
        <p class="is-size-7 has-text-grey">
          Weekends (Saturday & Sunday) are disabled
        </p>
      </t-demo-box>

      <t-demo-box label="Custom Date Restrictions">
        <t-datepicker
          v-model:model-value="customDate"
          placeholder="Select date"
          :unselectable-dates="blackoutDates"
        />
        <p class="mt-3">
          Selected: {{ customDate ? formatDateDisplay(customDate) : 'None' }}
        </p>
        <p class="is-size-7 has-text-grey">
          Some dates are blacked out
        </p>
      </t-demo-box>

      <t-demo-box label="Sizes">
        <div class="columns">
          <div class="column">
            <t-datepicker
              v-model:model-value="sizeDate1"
              placeholder="Small"
              size="small"
            />
          </div>
          <div class="column">
            <t-datepicker
              v-model:model-value="sizeDate2"
              placeholder="Normal"
            />
          </div>
          <div class="column">
            <t-datepicker
              v-model:model-value="sizeDate3"
              placeholder="Large"
              size="large"
            />
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Variants">
        <div class="columns">
          <div class="column">
            <t-datepicker
              v-model:model-value="variantDate1"
              placeholder="Primary"
              variant="primary"
            />
          </div>
          <div class="column">
            <t-datepicker
              v-model:model-value="variantDate2"
              placeholder="Success"
              variant="success"
            />
          </div>
          <div class="column">
            <t-datepicker
              v-model:model-value="variantDate3"
              placeholder="Danger"
              variant="danger"
            />
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Rounded">
        <t-datepicker
          v-model:model-value="roundedDate"
          placeholder="Rounded input"
          rounded
        />
      </t-demo-box>

      <t-demo-box label="Disabled & Readonly">
        <div class="columns">
          <div class="column">
            <t-datepicker
              v-model:model-value="disabledDate"
              placeholder="Disabled"
              disabled
            />
          </div>
          <div class="column">
            <t-datepicker
              v-model:model-value="readonlyDate"
              placeholder="Readonly"
              readonly
            />
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Custom Icons">
        <t-datepicker
          v-model:model-value="iconDate"
          placeholder="Custom icons"
          icon="calendar-star"
          icon-right="close"
          :icon-right-clickable="true"
          icon-prev="arrow-left-circle"
          icon-next="arrow-right-circle"
          @icon-right-click="iconDate = undefined"
        />
        <p class="mt-3">
          Click the right icon to clear
        </p>
      </t-demo-box>

      <t-demo-box label="Dropdown Position">
        <div class="columns">
          <div class="column">
            <t-datepicker
              v-model:model-value="positionDate1"
              placeholder="Bottom Left"
              position="bottom-left"
            />
          </div>
          <div class="column">
            <t-datepicker
              v-model:model-value="positionDate2"
              placeholder="Bottom Right"
              position="bottom-right"
            />
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="With Footer Slot">
        <t-datepicker
          v-model:model-value="footerDate"
          placeholder="Select date"
          :close-on-select="false"
        >
          <template #footer="{ close }">
            <div class="buttons">
              <t-button size="small" @click="footerDate = new Date()">
                Today
              </t-button>
              <t-button size="small" variant="link" @click="close">
                Close
              </t-button>
            </div>
          </template>
        </t-datepicker>
        <p class="mt-3">
          Selected: {{ footerDate ? formatDateDisplay(footerDate) : 'None' }}
        </p>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Basic usage
const singleDate = ref<Date>()

// Multiple selection
const multipleDates = ref<Date[]>([])

// Range constraints
const minDate = new Date()
const maxDate = new Date()
maxDate.setDate(maxDate.getDate() + 30)
const constrainedDate = ref<Date>()

// Weekday only
const weekdayDate = ref<Date>()

// Custom restrictions
const blackoutDates = ref<Date[]>([
  new Date(new Date().setDate(new Date().getDate() + 5)),
  new Date(new Date().setDate(new Date().getDate() + 10)),
  new Date(new Date().setDate(new Date().getDate() + 15))
])
const customDate = ref<Date>()

// Sizes
const sizeDate1 = ref<Date>()
const sizeDate2 = ref<Date>()
const sizeDate3 = ref<Date>()

// Variants
const variantDate1 = ref<Date>()
const variantDate2 = ref<Date>()
const variantDate3 = ref<Date>()

// Rounded
const roundedDate = ref<Date>()

// Disabled & Readonly
const disabledDate = ref<Date>(new Date())
const readonlyDate = ref<Date>(new Date())

// Custom icons
const iconDate = ref<Date>()

// Position
const positionDate1 = ref<Date>()
const positionDate2 = ref<Date>()

// Footer
const footerDate = ref<Date>()

function formatDateDisplay (date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
