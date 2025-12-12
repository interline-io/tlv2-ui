<template>
  <div class="control t-control">
    <t-dropdown
      ref="dropdownRef"
      v-model:model-value="isActive as any"
      :position="position"
      class="t-datepicker-dropdown"
    >
      <template #trigger>
        <t-input
          ref="inputRef"
          :model-value="formattedValue"
          :placeholder="placeholder"
          :icon="icon"
          :icon-right="iconRight"
          :icon-right-clickable="iconRightClickable"
          :size="size"
          :variant="variant"
          :disabled="disabled"
          :readonly="readonly"
          :rounded="rounded"
          expanded
          @update:model-value="handleInputChange"
          @icon-right-click="$emit('icon-right-click', $event)"
        />
      </template>

      <div class="t-datepicker-calendar">
        <header class="t-datepicker-header">
          <button
            type="button"
            class="button is-small"
            :aria-label="ariaPreviousLabel"
            @click="previousMonth"
          >
            <span class="icon">
              <i :class="`mdi mdi-${iconPrev}`" />
            </span>
          </button>

          <div class="t-datepicker-selects">
            <t-select
              v-model:model-value="focusedMonth as any"
              size="small"
            >
              <option
                v-for="(month, index) in monthNames"
                :key="index"
                :value="index"
              >
                {{ month }}
              </option>
            </t-select>

            <t-select
              v-model:model-value="focusedYear as any"
              size="small"
            >
              <option
                v-for="year in availableYears"
                :key="year"
                :value="year"
              >
                {{ year }}
              </option>
            </t-select>
          </div>

          <button
            type="button"
            class="button is-small"
            :aria-label="ariaNextLabel"
            @click="nextMonth"
          >
            <span class="icon">
              <i :class="`mdi mdi-${iconNext}`" />
            </span>
          </button>
        </header>

        <div class="t-datepicker-body">
          <div class="t-datepicker-weekdays">
            <div
              v-for="day in dayNames"
              :key="day"
              class="t-datepicker-weekday"
            >
              {{ day }}
            </div>
          </div>

          <div class="t-datepicker-days">
            <button
              v-for="day in calendarDays"
              :key="`${day.date.getTime()}`"
              type="button"
              class="t-datepicker-day"
              :class="getDayClasses(day)"
              :disabled="!day.selectable"
              @click="selectDate(day.date)"
            >
              {{ day.date.getDate() }}
            </button>
          </div>
        </div>

        <footer v-if="$slots.footer" class="t-datepicker-footer">
          <slot name="footer" :close="close" />
        </footer>
      </div>
    </t-dropdown>
  </div>
</template>

<script setup lang="ts" generic="T extends Date | Date[] = Date">
import { ref, computed, watch } from 'vue'
import type { InputSize, InputVariant } from './types'

/**
 * Datepicker component with calendar dropdown for date selection.
 * Similar in concept to Oruga Datepicker with customizable calendar interface.
 *
 * @component t-datepicker
 * @example
 * <t-datepicker v-model="selectedDate" placeholder="Select date" />
 * <t-datepicker v-model="dateRange" multiple placeholder="Select dates" />
 */

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  selectable: boolean
}

interface Props {
  /**
   * Selected date(s) - use with v-model.
   * Date for single selection, Date[] for multiple selection.
   */
  modelValue?: T

  /**
   * Allow multiple date selections.
   * @default false
   */
  multiple?: boolean

  /**
   * Input placeholder text.
   */
  placeholder?: string

  /**
   * Input size variant.
   */
  size?: InputSize

  /**
   * Input color variant.
   */
  variant?: InputVariant

  /**
   * Disable the datepicker.
   * @default false
   */
  disabled?: boolean

  /**
   * Make input readonly (calendar still accessible).
   * @default false
   */
  readonly?: boolean

  /**
   * Use rounded input style.
   * @default false
   */
  rounded?: boolean

  /**
   * Minimum selectable date.
   */
  minDate?: Date

  /**
   * Maximum selectable date.
   */
  maxDate?: Date

  /**
   * List of dates that cannot be selected.
   */
  unselectableDates?: Date[]

  /**
   * List of dates that can be selected (whitelist).
   */
  selectableDates?: Date[]

  /**
   * Days of week that cannot be selected (0-6, Sunday-Saturday).
   */
  unselectableDaysOfWeek?: number[]

  /**
   * Custom month names.
   */
  monthNames?: string[]

  /**
   * Custom day names (short).
   */
  dayNames?: string[]

  /**
   * First day of week (0-6, Sunday-Saturday).
   * @default 0
   */
  firstDayOfWeek?: number

  /**
   * Left icon (MDI icon name without 'mdi-' prefix).
   * @default 'calendar'
   */
  icon?: string

  /**
   * Right icon (MDI icon name without 'mdi-' prefix).
   */
  iconRight?: string

  /**
   * Make right icon clickable.
   * @default false
   */
  iconRightClickable?: boolean

  /**
   * Previous month icon.
   * @default 'chevron-left'
   */
  iconPrev?: string

  /**
   * Next month icon.
   * @default 'chevron-right'
   */
  iconNext?: string

  /**
   * Position of the dropdown.
   * @default 'bottom-left'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

  /**
   * Date format for display.
   * @default 'yyyy-MM-dd'
   */
  dateFormat?: string

  /**
   * Years range for year select [before, after].
   * @default [-100, 10]
   */
  yearsRange?: [number, number]

  /**
   * Open dropdown on input focus.
   * @default true
   */
  openOnFocus?: boolean

  /**
   * Close dropdown on date selection.
   * @default true
   */
  closeOnSelect?: boolean

  /**
   * Accessibility label for previous button.
   * @default 'Previous month'
   */
  ariaPreviousLabel?: string

  /**
   * Accessibility label for next button.
   * @default 'Next month'
   */
  ariaNextLabel?: string

  /**
   * Accessibility label for month select.
   * @default 'Select month'
   */
  ariaSelectMonthLabel?: string

  /**
   * Accessibility label for year select.
   * @default 'Select year'
   */
  ariaSelectYearLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  multiple: false,
  placeholder: undefined,
  size: undefined,
  variant: undefined,
  disabled: false,
  readonly: false,
  rounded: false,
  minDate: undefined,
  maxDate: undefined,
  unselectableDates: undefined,
  selectableDates: undefined,
  unselectableDaysOfWeek: undefined,
  monthNames: () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dayNames: () => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  firstDayOfWeek: 0,
  icon: 'calendar',
  iconRight: undefined,
  iconRightClickable: false,
  iconPrev: 'chevron-left',
  iconNext: 'chevron-right',
  position: 'bottom-left',
  dateFormat: 'yyyy-MM-dd',
  yearsRange: () => [-100, 10],
  openOnFocus: true,
  closeOnSelect: true,
  ariaPreviousLabel: 'Previous month',
  ariaNextLabel: 'Next month',
  ariaSelectMonthLabel: 'Select month',
  ariaSelectYearLabel: 'Select year'
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'icon-right-click': [event: MouseEvent]
  'change-month': [month: number]
  'change-year': [year: number]
}>()

const dropdownRef = ref()
const inputRef = ref()
const isActive = ref(false)

// Current focused date in calendar
const today = new Date()
const focusedMonth = ref(today.getMonth())
const focusedYear = ref(today.getFullYear())

// Watch for month/year changes and emit events
watch(focusedMonth, newMonth => emit('change-month', newMonth))
watch(focusedYear, newYear => emit('change-year', newYear))

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const [before, after] = props.yearsRange
  const years: number[] = []
  for (let i = currentYear + before; i <= currentYear + after; i++) {
    years.push(i)
  }
  return years
})

const formattedValue = computed(() => {
  if (!props.modelValue) return ''

  if (Array.isArray(props.modelValue)) {
    return props.modelValue.map(d => formatDate(d)).join(', ')
  }

  return formatDate(props.modelValue as Date)
})

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const year = focusedYear.value
  const month = focusedMonth.value

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Days from previous month
  let startDay = firstDay.getDay() - props.firstDayOfWeek
  if (startDay < 0) startDay += 7

  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isDateSelected(date),
      selectable: isDateSelectable(date)
    })
  }

  // Days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: isDateSelected(date),
      selectable: isDateSelectable(date)
    })
  }

  // Days from next month to complete the grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isDateSelected(date),
      selectable: isDateSelectable(date)
    })
  }

  return days
})

function formatDate (date: Date): string {
  // Simple format implementation - can be enhanced
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate (dateString: string): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

function isSameDay (date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()
}

function isDateSelected (date: Date): boolean {
  if (!props.modelValue) return false

  if (Array.isArray(props.modelValue)) {
    return props.modelValue.some(d => isSameDay(d, date))
  }

  return isSameDay(props.modelValue as Date, date)
}

function isDateSelectable (date: Date): boolean {
  // Check min/max dates
  if (props.minDate && date < props.minDate) return false
  if (props.maxDate && date > props.maxDate) return false

  // Check unselectable days of week
  if (props.unselectableDaysOfWeek?.includes(date.getDay())) return false

  // Check unselectable dates
  if (props.unselectableDates?.some(d => isSameDay(d, date))) return false

  // Check selectable dates (whitelist)
  if (props.selectableDates && !props.selectableDates.some(d => isSameDay(d, date))) return false

  return true
}

function getDayClasses (day: CalendarDay) {
  return {
    'is-today': day.isToday,
    'is-selected': day.isSelected,
    'is-other-month': !day.isCurrentMonth,
    'is-unselectable': !day.selectable
  }
}

function selectDate (date: Date) {
  if (!isDateSelectable(date)) return

  if (props.multiple) {
    const currentDates = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentDates.findIndex(d => isSameDay(d, date))

    if (index >= 0) {
      currentDates.splice(index, 1)
    } else {
      currentDates.push(date)
    }

    emit('update:modelValue', currentDates as T)
  } else {
    emit('update:modelValue', date as T)

    if (props.closeOnSelect) {
      close()
    }
  }
}

function handleInputChange (value: string) {
  const date = parseDate(value)
  if (date && isDateSelectable(date)) {
    emit('update:modelValue', date as T)
    focusedMonth.value = date.getMonth()
    focusedYear.value = date.getFullYear()
  }
}

function previousMonth () {
  if (focusedMonth.value === 0) {
    focusedMonth.value = 11
    focusedYear.value--
  } else {
    focusedMonth.value--
  }
}

function nextMonth () {
  if (focusedMonth.value === 11) {
    focusedMonth.value = 0
    focusedYear.value++
  } else {
    focusedMonth.value++
  }
}

function close () {
  isActive.value = false
}

// Initialize focused date from modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = Array.isArray(newValue) ? newValue[0] : newValue as Date
    if (date) {
      focusedMonth.value = date.getMonth()
      focusedYear.value = date.getFullYear()
    }
  }
}, { immediate: true })

defineExpose({ close, focus: () => inputRef.value?.focus() })
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-datepicker-calendar {
  min-width: 320px;
  padding: 1rem;
}

.t-datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.t-datepicker-selects {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.t-datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.t-datepicker-weekday {
  text-align: center;
  font-size: $size-small;
  font-weight: 600;
  color: $grey;
  padding: 0.5rem 0;
}

.t-datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.t-datepicker-day {
  aspect-ratio: 1;
  border: 1px solid $grey-lighter;
  border-radius: $radius;
  background: $white;
  color: $text;
  font-size: $size-normal;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: $grey-lighter;
    border-color: $grey-light;
  }

  &.is-today {
    border-color: $primary;
    font-weight: 600;
  }

  &.is-selected {
    background: $primary;
    color: $white;
    border-color: $primary;

    &:hover {
      background: color.adjust($primary, $lightness: -5%);
    }
  }

  &.is-other-month {
    color: $grey-light;
  }

  &.is-unselectable,
  &:disabled {
    color: $grey-lighter;
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      background: $white;
      border-color: $grey-lighter;
    }
  }
}

.t-datepicker-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid $grey-lighter;
}
</style>
