<template>
  <t-field :addons="false">
    <template #label>
      Transfer time scoring
    </template>
    <template #message>
      <p v-if="inEditMode && errorMsg" class="help is-danger">
        {{ errorMsg }}
      </p>
      <p v-if="inEditMode" class="help">
        Time boundaries are in minutes. Press - to remove 30 seconds and + to add 30 seconds to boundaries between classifications. Press <em>Save</em> when done editing. Or press <em>Cancel</em> to undo your edits.
      </p>
    </template>
    <table class="table is-fullwidth breakpoints-table">
      <tbody>
        <tr>
          <td class="trip-not-considered">
            <span v-if="!inEditMode">{{ transferScoringBreakpointsDescriptions[0] }}</span>
          </td>
          <td v-if="inEditMode">
            <t-input
              :model-value="revisedTransferScoringBreakpointsMinutes[0]"
              step="0.5"
              size="small"
              type="number"
              @update:model-value="revisedTransferScoringBreakpointsMinutes[0] = Number($event) || 0; changeBreakPoint()"
            />
          </td>
          <td class="trip-missed">
            <span v-if="!inEditMode">
              {{ transferScoringBreakpointsDescriptions[1] }}
            </span>
          </td>
          <td v-if="inEditMode">
            <t-input
              :model-value="revisedTransferScoringBreakpointsMinutes[1]"
              step="0.5"
              size="small"
              type="number"
              @update:model-value="revisedTransferScoringBreakpointsMinutes[1] = Number($event) || 0; changeBreakPoint()"
            />
          </td>
          <td class="trip-close">
            <span v-if="!inEditMode">
              {{ transferScoringBreakpointsDescriptions[2] }}
            </span>
          </td>
          <td v-if="inEditMode">
            <t-input
              :model-value="revisedTransferScoringBreakpointsMinutes[2]"
              step="0.5"
              type="number"
              size="small"
              @update:model-value="revisedTransferScoringBreakpointsMinutes[2] = Number($event) || 0; changeBreakPoint()"
            />
          </td>
          <td class="trip-acceptable">
            <span v-if="!inEditMode">
              {{ transferScoringBreakpointsDescriptions[3] }}
            </span>
          </td>
          <td v-if="inEditMode">
            <t-input
              :model-value="revisedTransferScoringBreakpointsMinutes[3]"
              step="0.5"
              type="number"
              size="small"
              @update:model-value="revisedTransferScoringBreakpointsMinutes[3] = Number($event) || 0; changeBreakPoint()"
            />
          </td>
          <td class="trip-unacceptable">
            <span v-if="!inEditMode">
              {{ transferScoringBreakpointsDescriptions[4] }}
            </span>
          </td>
          <td v-if="inEditMode">
            <t-input
              :model-value="revisedTransferScoringBreakpointsMinutes[4]"
              step="0.5"
              type="number"
              size="small"
              @update:model-value="revisedTransferScoringBreakpointsMinutes[4] = Number($event) || 0; changeBreakPoint()"
            />
          </td>
          <td class="trip-not-considered">
            <span v-if="!inEditMode">{{ transferScoringBreakpointsDescriptions[5] }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="inEditMode" class="field is-grouped is-pulled-right pl-4 pt-2">
      <div class="control">
        <t-button
          class="is-pulled-right is-small is-danger is-outlined"
          @click.prevent="cancel"
        >
          Cancel
        </t-button>
      </div>
      <div class="control">
        <t-button
          :disabled="!valid"
          class="is-pulled-right is-small is-primary"
          @click.prevent="save"
        >
          Save breakpoints
        </t-button>
      </div>
    </div>
    <div v-else class="control">
      <t-button
        class="is-pulled-right is-primary is-small"
        @click.prevent="modify"
      >
        Modify breakpoints
      </t-button>
    </div>
  </t-field>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const breakpointSecondsToMinutes = (b: number): number => {
  if (b < 0 || b > 0) {
    return Number.parseFloat((b / 60).toFixed(1)) // outer parseFloat is to turn, for example: 10.0 into 10
  } else {
    return 0
  }
}

const breakpointMinutesToString = (b: number): string => {
  if (b === 0) {
    return '0'
  } else if (b < 0) {
    return b.toString()
  } else if (b > 0) {
    return '+' + b.toString()
  } else {
    return ''
  }
}

interface Props {
  transferScoringBreakpoints?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  transferScoringBreakpoints: () => []
})

const emit = defineEmits({
  changed: (_value: number[]) => true
})

const inEditMode = ref(false)
const changed = ref(false)
const valid = ref(true)
const errorMsg = ref<string | null>(null)
const revisedTransferScoringBreakpointsMinutes = ref<number[]>([])

const breakpointsAsMinutes = computed(() => {
  return props.transferScoringBreakpoints.map(b => breakpointSecondsToMinutes(b))
})

const breakpointsAsMinuteStrings = computed(() => {
  return breakpointsAsMinutes.value.map(b => breakpointMinutesToString(b))
})

const transferScoringBreakpointsDescriptions = computed(() => {
  return [
    'not considered',
    `${breakpointsAsMinuteStrings.value[0]} to ${breakpointsAsMinuteStrings.value[1]} minutes`,
    `${breakpointsAsMinuteStrings.value[1]} to ${breakpointsAsMinuteStrings.value[2]} minutes`,
    `${breakpointsAsMinuteStrings.value[2]} to ${breakpointsAsMinuteStrings.value[3]} minutes`,
    `${breakpointsAsMinuteStrings.value[3]} to ${breakpointsAsMinuteStrings.value[4]} minutes`,
    `more than ${breakpointsAsMinuteStrings.value[4]} minutes`
  ]
})

function modify () {
  // set or reset the values
  revisedTransferScoringBreakpointsMinutes.value = props.transferScoringBreakpoints.map(b => b / 60)
  changed.value = false
  valid.value = true
  inEditMode.value = true
}

function cancel () {
  inEditMode.value = false
}

function save () {
  if (validateAndWarnAll() === false) {
    return false
  }
  inEditMode.value = false
  emit('changed', revisedTransferScoringBreakpointsMinutes.value.map(b => b * 60))
}

function changeBreakPoint () {
  valid.value = validateAndWarnAll()
  changed.value = true
}

function validateAndWarnAll (): boolean {
  if (revisedTransferScoringBreakpointsMinutes.value.length === 0) {
    errorMsg.value = 'No values'
    return false
  }
  let prev = -10000
  for (const val of revisedTransferScoringBreakpointsMinutes.value) {
    if (val <= prev) {
      errorMsg.value = 'Breakpoint values must be increasing.'
      return false
    }
    if (val < -40) {
      errorMsg.value = 'You cannot set a breakpoint at less than -40 minutes.'
      return false
    }
    if (val > 40) {
      errorMsg.value = 'You cannot set a breakpoint greater than 40 minutes.'
      return false
    }
    prev = val
  }
  errorMsg.value = null
  return true
}
</script>

<style scoped lang="scss">
table {
  margin: 0 !important;
}
tr {
  text-align: center;
  height: 40px;
}
td {
  padding:5px;
  vertical-align: middle;
}

.breakpoints-table {
  span {
    display:block;
  }

.trip-missed span {
  background: var(--trip-missed) !important;
}
.trip-close span {
  background: var(--trip-close) !important;
}
.trip-acceptable span {
  background: var(--trip-acceptable) !important;
}
.trip-unacceptable span {
  background: var(--trip-unacceptable) !important;
}
.trip-not-considered span {
  background: var(--trip-not-considered) !important;
}
}
</style>
