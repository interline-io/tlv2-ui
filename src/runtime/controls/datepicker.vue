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

<script setup lang="ts" generic="T extends Date | Date[] = Date, S extends string | string[] = string">
import { ref, computed, watch } from 'vue'
import type { InputSize, InputVariant } from './types'
import { format as formatDate, parse, isValid, isSameDay } from 'date-fns'

const DATE_FORMAT = 'yyyy-MM-dd'

function parseDate (dateString: string): Date | null {
  if (!dateString) return null
  const date = parse(dateString, DATE_FORMAT, new Date())
  return isValid(date) ? date : null
}

/**
 * Datepicker component with calendar dropdown for date selection.
 * Supports two model bindings:
 * - `v-model` for Date / Date[] values
 * - `v-model:date-string` for YYYY-MM-DD string / string[] values
 *
 * @component t-datepicker
 * @example
 * <t-datepicker v-model="selectedDate" placeholder="Select date" />
 * <t-datepicker v-model:date-string="dateStr" placeholder="Select date" />
 * <t-datepicker v-model="dateRange" multiple placeholder="Select dates" />
 * <t-datepicker v-model:date-string="dateStrs" multiple placeholder="Select dates" />
 */

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  selectable: boolean
}

const props = withDefaults(defineProps<{
  /** Selected date(s) - use with v-model. Date for single, Date[] for multiple. */
  modelValue?: T
  /** Selected date(s) as YYYY-MM-DD string(s) - use with v-model:date-string. */
  dateString?: S
  /** Allow multiple date selections. @default false */
  multiple?: boolean
  /** Input placeholder text. */
  placeholder?: string
  /** Input size variant. */
  size?: InputSize
  /** Input color variant. */
  variant?: InputVariant
  /** Disable the datepicker. @default false */
  disabled?: boolean
  /** Make input readonly (calendar still accessible). @default false */
  readonly?: boolean
  /** Use rounded input style. @default false */
  rounded?: boolean
  /** Minimum selectable date. */
  minDate?: Date
  /** Maximum selectable date. */
  maxDate?: Date
  /** List of dates that cannot be selected. */
  unselectableDates?: Date[]
  /** List of dates that can be selected (whitelist). */
  selectableDates?: Date[]
  /** Days of week that cannot be selected (0-6, Sunday-Saturday). */
  unselectableDaysOfWeek?: number[]
  /** Custom month names. */
  monthNames?: string[]
  /** Custom day names (short). */
  dayNames?: string[]
  /** First day of week (0-6, Sunday-Saturday). @default 0 */
  firstDayOfWeek?: number
  /** Left icon (MDI icon name without 'mdi-' prefix). @default 'calendar' */
  icon?: string
  /** Right icon (MDI icon name without 'mdi-' prefix). */
  iconRight?: string
  /** Make right icon clickable. @default false */
  iconRightClickable?: boolean
  /** Previous month icon. @default 'chevron-left' */
  iconPrev?: string
  /** Next month icon. @default 'chevron-right' */
  iconNext?: string
  /** Position of the dropdown. @default 'bottom-left' */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /** Date format for display. @default 'yyyy-MM-dd' */
  dateFormat?: string
  /** Years range for year select [before, after]. @default [-100, 10] */
  yearsRange?: [number, number]
  /** Open dropdown on input focus. @default true */
  openOnFocus?: boolean
  /** Close dropdown on date selection. @default true */
  closeOnSelect?: boolean
  /** Accessibility label for previous button. @default 'Previous month' */
  ariaPreviousLabel?: string
  /** Accessibility label for next button. @default 'Next month' */
  ariaNextLabel?: string
  /** Accessibility label for month select. @default 'Select month' */
  ariaSelectMonthLabel?: string
  /** Accessibility label for year select. @default 'Select year' */
  ariaSelectYearLabel?: string
}>(), {
  modelValue: undefined,
  dateString: undefined,
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
  'update:dateString': [value: S]
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

// Resolve active dates from whichever model is bound.
// Internally the component always works with Date objects.
// Prefers dateString when both are provided.
const activeDates = computed((): Date[] => {
  if (props.dateString != null) {
    const ds = props.dateString
    if (Array.isArray(ds)) {
      return ds.map(s => parseDate(s)).filter((d): d is Date => d != null)
    }
    const parsed = parseDate(ds)
    return parsed ? [parsed] : []
  }
  if (props.modelValue == null) return []
  if (Array.isArray(props.modelValue)) return props.modelValue as Date[]
  return [props.modelValue as Date]
})

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
  return activeDates.value.map(d => formatDate(d, DATE_FORMAT)).join(', ')
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

function isDateSelected (date: Date): boolean {
  return activeDates.value.some(d => isSameDay(d, date))
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

function emitDate (date: Date) {
  emit('update:modelValue', date as T)
  emit('update:dateString', formatDate(date, DATE_FORMAT) as S)
}

function emitDates (dates: Date[]) {
  emit('update:modelValue', dates as T)
  emit('update:dateString', dates.map(d => formatDate(d, DATE_FORMAT)) as S)
}

function selectDate (date: Date) {
  if (!isDateSelectable(date)) return

  if (props.multiple) {
    const current = [...activeDates.value]
    const index = current.findIndex(d => isSameDay(d, date))
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(date)
    }
    emitDates(current)
  } else {
    emitDate(date)
    if (props.closeOnSelect) {
      close()
    }
  }
}

function handleInputChange (value: string) {
  const date = parseDate(value)
  if (date && isDateSelectable(date)) {
    if (props.multiple) {
      selectDate(date)
    } else {
      emitDate(date)
    }
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

// Initialize focused date from the active selection
watch(activeDates, (dates) => {
  const date = dates[0]
  if (date) {
    focusedMonth.value = date.getMonth()
    focusedYear.value = date.getFullYear()
  }
}, { immediate: true })

defineExpose({ close, focus: () => inputRef.value?.focus() })
</script>

<style lang="scss" scoped>
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
  font-size: var(--bulma-size-small);
  font-weight: 600;
  color: var(--bulma-grey);
  padding: 0.5rem 0;
}

.t-datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.t-datepicker-day {
  aspect-ratio: 1;
  border: 1px solid var(--bulma-grey-lighter);
  border-radius: var(--bulma-radius);
  background: var(--bulma-white);
  color: var(--bulma-text);
  font-size: var(--bulma-size-normal);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: var(--bulma-grey-lighter);
    border-color: var(--bulma-grey-light);
  }

  &.is-today {
    border-color: var(--bulma-primary);
    font-weight: 600;
  }

  &.is-selected {
    background: var(--bulma-primary);
    color: var(--bulma-white);
    border-color: var(--bulma-primary);

    &:hover {
      filter: brightness(0.95);
    }
  }

  &.is-other-month {
    color: var(--bulma-grey-light);
  }

  &.is-unselectable,
  &:disabled {
    color: var(--bulma-grey-lighter);
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      background: var(--bulma-white);
      border-color: var(--bulma-grey-lighter);
    }
  }
}

.t-datepicker-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bulma-grey-lighter);
}
</style>
