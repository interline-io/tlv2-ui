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
        <t-dropdown trigger-label="Actions">
          <t-dropdown-item value="edit">
            <t-icon icon="pencil" />
            <span>Edit</span>
          </t-dropdown-item>
          <t-dropdown-item value="duplicate">
            <t-icon icon="content-copy" />
            <span>Duplicate</span>
          </t-dropdown-item>
          <t-dropdown-item value="delete">
            <t-icon icon="delete" />
            <span>Delete</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Hoverable Dropdown">
        <p class="mb-3">
          Hover over the button to open the dropdown
        </p>
        <t-dropdown hoverable trigger-label="Hover me" trigger-variant="info">
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
        <t-dropdown trigger-label="My Account" trigger-icon-left="account-circle">
          <t-dropdown-item value="profile">
            <t-icon icon="account" />
            <span>Profile</span>
          </t-dropdown-item>
          <t-dropdown-item value="settings">
            <t-icon icon="cog" />
            <span>Settings</span>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item value="help">
            <t-icon icon="help-circle" />
            <span>Help</span>
          </t-dropdown-item>
          <t-dropdown-item value="logout">
            <t-icon icon="logout" />
            <span>Logout</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Dropdown Positions">
        <div class="buttons">
          <t-dropdown trigger-label="Bottom Left (Default)">
            <t-dropdown-item value="1">
              Item 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Item 2
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown position="bottom-right" trigger-label="Bottom Right">
            <t-dropdown-item value="1">
              Item 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Item 2
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown position="top-left" trigger-label="Top Left">
            <t-dropdown-item value="1">
              Item 1
            </t-dropdown-item>
            <t-dropdown-item value="2">
              Item 2
            </t-dropdown-item>
          </t-dropdown>

          <t-dropdown position="top-right" trigger-label="Top Right">
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
        <t-dropdown trigger-label="File">
          <t-dropdown-item value="new">
            <t-icon icon="file-plus" />
            <span>New</span>
          </t-dropdown-item>
          <t-dropdown-item value="open">
            <t-icon icon="folder-open" />
            <span>Open</span>
          </t-dropdown-item>
          <t-dropdown-item value="save" disabled>
            <t-icon icon="content-save" />
            <span>Save (disabled)</span>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item value="export">
            <t-icon icon="export" />
            <span>Export</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Custom Trigger">
        <t-dropdown>
          <template #trigger>
            <a class="navbar-item">
              <span>More</span>
              <t-icon icon="menu-down" />
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

      <t-demo-box label="Example: Interactive Actions" example>
        <p class="mb-3">
          Selected action: <strong>{{ selectedAction || 'None' }}</strong>
        </p>
        <t-dropdown @select="handleSelect">
          <template #trigger>
            <t-button variant="primary">
              <span>Choose Action</span>
              <t-icon icon="menu-down" />
            </t-button>
          </template>
          <t-dropdown-item value="save">
            <t-icon icon="content-save" />
            <span>Save</span>
          </t-dropdown-item>
          <t-dropdown-item value="export">
            <t-icon icon="export" />
            <span>Export</span>
          </t-dropdown-item>
          <t-dropdown-item value="print">
            <t-icon icon="printer" />
            <span>Print</span>
          </t-dropdown-item>
          <t-dropdown-item separator />
          <t-dropdown-item value="share">
            <t-icon icon="share-variant" />
            <span>Share</span>
          </t-dropdown-item>
        </t-dropdown>
      </t-demo-box>

      <t-demo-box label="Example: Notification Menu" example>
        <t-dropdown>
          <template #trigger>
            <t-button variant="info">
              <t-icon icon="bell" />
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
              <t-icon icon="translate" />
              <span>{{ currentLanguage }}</span>
              <t-icon icon="menu-down" />
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedAction = ref('')
const currentLanguage = ref('English')

const handleSelect = (value: string) => {
  selectedAction.value = value
}

const handleLanguageSelect = (value: string) => {
  currentLanguage.value = value
}
</script>
