<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Dropdown Component
      </h1>
      <p class="subtitle">
        Contextual dropdown menu with custom triggers
      </p>

      <t-demo-box label="Basic Dropdown">
        <t-dropdown label="Actions">
          <t-dropdown-item value="edit">
            <t-icon icon="pencil" size="small" />
            <span>Edit</span>
          </t-dropdown-item>
          <t-dropdown-item value="duplicate">
            <t-icon icon="content-copy" size="small" />
            <span>Duplicate</span>
          </t-dropdown-item>
          <t-dropdown-item value="delete">
            <t-icon icon="delete" size="small" />
            <span>Delete</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Trigger Variants">
        <div class="buttons">
          <t-dropdown v-for="variant in triggerVariants" :key="variant" :button-variant="variant" :label="capitalize(variant)">
            <t-dropdown-item value="1">
              Option 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Option 2
            </t-dropdown-item>
            <t-dropdown-item value="3">
              Option 3
            </t-dropdown-item>
          </t-dropdown>
        </div>
      </t-demo-box>

      <t-demo-box label="Hoverable Dropdown">
        <p class="mb-3">
          Hover over the button to open the dropdown
        </p>
        <t-dropdown hoverable label="Hover me" button-variant="link">
          <t-dropdown-item value="option1">
            Option 1
          </t-dropdown-item>
          <t-dropdown-item value="option2">
            Option 2
          </t-dropdown-item>
          <t-dropdown-item value="option3">
            Option 3
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="With Icons">
        <t-dropdown label="My Account" icon-left="account-circle">
          <t-dropdown-item value="profile">
            <t-icon icon="account" size="small" />
            <span>Profile</span>
          </t-dropdown-item>
          <t-dropdown-item value="settings">
            <t-icon icon="cog" size="small" />
            <span>Settings</span>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item value="help">
            <t-icon icon="help-circle" size="small" />
            <span>Help</span>
          </t-dropdown-item>
          <t-dropdown-item value="logout">
            <t-icon icon="logout" size="small" />
            <span>Logout</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Dropdown Positions">
        <div class="buttons">
          <t-dropdown label="Bottom Left (Default)">
            <t-dropdown-item value="1">
              Item 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Item 2
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown position="bottom-right" label="Bottom Right">
            <t-dropdown-item value="1">
              Item 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Item 2
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown position="top-left" label="Top Left">
            <t-dropdown-item value="1">
              Item 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Item 2
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown position="top-right" label="Top Right">
            <t-dropdown-item value="1">
              Item 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Item 2
            </t-dropdown-item>
          </t-dropdown>
        </div>
      </t-demo-box>

      <t-demo-box label="With Disabled Items">
        <t-dropdown label="File">
          <t-dropdown-item value="new">
            <t-icon icon="file-plus" size="small" />
            <span>New</span>
          </t-dropdown-item>
          <t-dropdown-item value="open">
            <t-icon icon="folder-open" size="small" />
            <span>Open</span>
          </t-dropdown-item>
          <t-dropdown-item value="save" disabled>
            <t-icon icon="content-save" size="small" />
            <span>Save (disabled)</span>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item value="export">
            <t-icon icon="export" size="small" />
            <span>Export</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Custom Trigger">
        <t-dropdown>
          <template #trigger>
            <a class="navbar-item">
              <span>More</span>
              <t-icon icon="menu-down" size="small" />
            </a>
          </template>
          <t-dropdown-item value="docs">
            Documentation
          </t-dropdown-item>
          <t-dropdown-item value="examples">
            Examples
          </t-dropdown-item>
          <t-dropdown-item value="api">
            API Reference
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Multiple Selection (Array Model)">
        <p class="mb-3">
          Selected items: <strong>{{ multipleSelection.length > 0 ? multipleSelection.join(', ') : 'None' }}</strong>
        </p>
        <t-dropdown v-model="multipleSelection as string[]" selectable multiple inline label="Select Multiple" button-variant="primary">
          <t-dropdown-item value="cat">
            🐱 Cat
          </t-dropdown-item>
          <t-dropdown-item value="dog">
            🐶 Dog
          </t-dropdown-item>
          <t-dropdown-item value="rabbit">
            🐰 Rabbit
          </t-dropdown-item>
          <t-dropdown-item value="mouse">
            🐭 Mouse
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Example: Interactive Actions" example>
        <p class="mb-3">
          Selected action: <strong>{{ selectedAction || 'None' }}</strong>
        </p>
        <t-dropdown @select="handleSelect">
          <template #trigger>
            <t-button variant="primary">
              <span>Choose Action</span>
              <t-icon icon="menu-down" size="small" />
            </t-button>
          </template>
          <t-dropdown-item value="save">
            <t-icon icon="content-save" size="small" />
            <span>Save</span>
          </t-dropdown-item>
          <t-dropdown-item value="export">
            <t-icon icon="export" size="small" />
            <span>Export</span>
          </t-dropdown-item>
          <t-dropdown-item value="print">
            <t-icon icon="printer" size="small" />
            <span>Print</span>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item value="share">
            <t-icon icon="share-variant" size="small" />
            <span>Share</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Example: Notification Menu" example>
        <t-dropdown>
          <template #trigger>
            <t-button variant="info">
              <t-icon icon="bell" size="small" />
              <span class="tag is-danger is-rounded">
                3
              </span>
            </t-button>
          </template>
          <t-dropdown-item>
            <div style="min-width: 250px;">
              <p class="has-text-weight-bold">
                New message from John
              </p>
              <p class="is-size-7 has-text-grey">
                2 minutes ago
              </p>
            </div>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item>
            <div style="min-width: 250px;">
              <p class="has-text-weight-bold">
                Update completed
              </p>
              <p class="is-size-7 has-text-grey">
                1 hour ago
              </p>
            </div>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item>
            <div style="min-width: 250px;">
              <p class="has-text-weight-bold">
                System maintenance scheduled
              </p>
              <p class="is-size-7 has-text-grey">
                Yesterday
              </p>
            </div>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item value="view-all">
            <p class="has-text-centered has-text-link">
              View all notifications
            </p>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Example: Language Selector" example>
        <p class="mb-3">
          Current language: <strong>{{ currentLanguage }}</strong>
        </p>
        <t-dropdown @select="handleLanguageSelect">
          <template #trigger>
            <t-button>
              <t-icon icon="translate" size="small" />
              <span>{{ currentLanguage }}</span>
              <t-icon icon="menu-down" size="small" />
            </t-button>
          </template>
          <t-dropdown-item value="English">
            🇺🇸 English
          </t-dropdown-item>
          <t-dropdown-item value="Español">
            🇪🇸 Español
          </t-dropdown-item>
          <t-dropdown-item value="Français">
            🇫🇷 Français
          </t-dropdown-item>
          <t-dropdown-item value="Deutsch">
            🇩🇪 Deutsch
          </t-dropdown-item>
          <t-dropdown-item value="日本語">
            🇯🇵 日本語
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Single Selection with v-model">
        <p class="mb-3">
          Selected option: <strong>{{ singleSelection || 'None' }}</strong>
        </p>
        <t-dropdown v-model:model-value="singleSelection as any" selectable label="Select Option" button-variant="link">
          <t-dropdown-item value="option1">
            Option 1
          </t-dropdown-item>
          <t-dropdown-item value="option2">
            Option 2
          </t-dropdown-item>
          <t-dropdown-item value="option3">
            Option 3
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Example: Numeric Values" example>
        <p class="mb-3">
          Selected user ID: <strong>{{ selectedUserId || 'None' }}</strong>
        </p>
        <t-dropdown v-model:model-value="selectedUserId as any" selectable label="Select User" button-variant="info">
          <t-dropdown-item :value="1">
            👤 John Doe (ID: 1)
          </t-dropdown-item>
          <t-dropdown-item :value="2">
            👤 Jane Smith (ID: 2)
          </t-dropdown-item>
          <t-dropdown-item :value="3">
            👤 Bob Johnson (ID: 3)
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DropdownTriggerVariants } from '../../../../src/runtime/controls/types'
import TDemoBox from '../../components/t-demo-box.vue'

const triggerVariants = DropdownTriggerVariants

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const selectedAction = ref('')
const currentLanguage = ref('English')
const singleSelection = ref<string | undefined>(undefined)
const multipleSelection = ref<string[]>(['cat', 'rabbit'])
const selectedUserId = ref<number | undefined>(undefined)

const handleSelect = (value: string) => {
  selectedAction.value = value
}

const handleLanguageSelect = (value: string) => {
  currentLanguage.value = value
}
</script>
