import Oruga, {
  OButton,
  OAutocomplete,
  ONotification,
  OTable,
  OTableColumn,
  OTooltip,
  OField,
  OSlider,
  OSelect,
  ODropdown,
  ODropdownItem,
  OCheckbox,
  ODatepicker,
  OIcon,
  ODatetimepicker,
  OInput,
  OModal,
  OTabItem,
  OTabs
} from '@oruga-ui/oruga-next'

import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@oruga-ui/theme-bulma/dist/bulma.css'

import '@oruga-ui/oruga-next/dist/oruga.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Oruga, bulmaConfig)
  nuxtApp.vueApp.component('b-button', OButton)
  nuxtApp.vueApp.component('b-autocomplete', OAutocomplete)
  nuxtApp.vueApp.component('b-notification', ONotification)
  nuxtApp.vueApp.component('b-tooltip', OTooltip)
  nuxtApp.vueApp.component('b-field', OField)
  nuxtApp.vueApp.component('b-slider', OSlider)
  nuxtApp.vueApp.component('b-select', OSelect)
  nuxtApp.vueApp.component('b-dropdown', ODropdown)
  nuxtApp.vueApp.component('b-dropdown-item', ODropdownItem)
  nuxtApp.vueApp.component('b-checkbox', OCheckbox)
  nuxtApp.vueApp.component('b-datepicker', ODatepicker)
  nuxtApp.vueApp.component('b-icon', OIcon)
  nuxtApp.vueApp.component('b-datetimepicker', ODatetimepicker)
  nuxtApp.vueApp.component('b-input', OInput)
  nuxtApp.vueApp.component('b-tab-item', OTabItem)
  nuxtApp.vueApp.component('b-tabs', OTabs)
  nuxtApp.vueApp.component('b-table-column', OTableColumn)
  nuxtApp.vueApp.component('b-table', OTable)
  nuxtApp.vueApp.component('b-modal', OModal)
})
