<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tooltip Component
      </h1>
      <p class="subtitle">
        Contextual information on hover
      </p>

      <t-demo-box label="Basic Tooltip">
        <div class="has-text-centered">
          <t-tooltip text="This is a tooltip">
            <t-button>
              Hover me
            </t-button>
          </t-tooltip>
        </div>
      </t-demo-box>

      <t-demo-box label="Positions">
        <div class="has-text-centered mb-4">
          <t-tooltip text="Top tooltip" position="top">
            <t-button>
              Top
            </t-button>
          </t-tooltip>
        </div>
        <div class="is-flex is-justify-content-space-between mb-4">
          <t-tooltip text="Left tooltip" position="left">
            <t-button>
              Left
            </t-button>
          </t-tooltip>
          <t-tooltip text="Right tooltip" position="right">
            <t-button>
              Right
            </t-button>
          </t-tooltip>
        </div>
        <div class="has-text-centered">
          <t-tooltip text="Bottom tooltip" position="bottom">
            <t-button>
              Bottom
            </t-button>
          </t-tooltip>
        </div>
      </t-demo-box>

      <t-demo-box label="With Icons">
        <div class="buttons">
          <t-tooltip text="Save changes">
            <t-button>
              <t-icon icon="content-save" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Edit item">
            <t-button>
              <t-icon icon="pencil" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Delete item">
            <t-button>
              <t-icon icon="delete" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Download file">
            <t-button>
              <t-icon icon="download" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Share content">
            <t-button>
              <t-icon icon="share-variant" />
            </t-button>
          </t-tooltip>
        </div>
      </t-demo-box>

      <t-demo-box label="Example: Form Field Help" example>
        <t-field label="Username:">
          <div class="is-flex">
            <t-input v-model="username" expanded />
            <t-tooltip text="Username must be 3-20 characters, alphanumeric only" position="right">
              <t-button class="ml-2">
                <t-icon icon="help-circle" />
              </t-button>
            </t-tooltip>
          </div>
        </t-field>

        <t-field label="Password:">
          <div class="is-flex">
            <t-input v-model="password" type="password" expanded />
            <t-tooltip text="Password must be at least 8 characters with uppercase, lowercase, and numbers" position="right">
              <t-button class="ml-2">
                <t-icon icon="help-circle" />
              </t-button>
            </t-tooltip>
          </div>
        </t-field>
      </t-demo-box>

      <t-demo-box label="Example: Text with Tooltip" example>
        <p>
          Hover over
          <t-tooltip text="This is an abbreviation for 'example'" position="top">
            <span class="has-text-primary" style="cursor: help; text-decoration: underline dotted;">
              e.g.
            </span>
          </t-tooltip>
          to see its meaning.
        </p>
        <p class="mt-3">
          The term
          <t-tooltip text="Application Programming Interface" position="top">
            <span class="has-text-info" style="cursor: help; border-bottom: 1px dotted;">
              API
            </span>
          </t-tooltip>
          is commonly used in software development.
        </p>
      </t-demo-box>

      <t-demo-box label="Example: Status Indicators" example>
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Web Server</td>
              <td>
                <t-tooltip text="All systems operational">
                  <t-icon icon="check-circle" class="has-text-success" />
                </t-tooltip>
              </td>
            </tr>
            <tr>
              <td>Database</td>
              <td>
                <t-tooltip text="All systems operational">
                  <t-icon icon="check-circle" class="has-text-success" />
                </t-tooltip>
              </td>
            </tr>
            <tr>
              <td>Email Service</td>
              <td>
                <t-tooltip text="Experiencing minor delays">
                  <t-icon icon="alert" class="has-text-warning" />
                </t-tooltip>
              </td>
            </tr>
            <tr>
              <td>API Gateway</td>
              <td>
                <t-tooltip text="Service unavailable - maintenance in progress">
                  <t-icon icon="alert-circle" class="has-text-danger" />
                </t-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </t-demo-box>

      <t-demo-box label="Example: Navigation Menu" example>
        <div class="buttons">
          <t-tooltip text="Dashboard" position="bottom">
            <t-button>
              <t-icon icon="view-dashboard" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Messages" position="bottom">
            <t-button>
              <t-icon icon="email" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Notifications" position="bottom">
            <t-button>
              <t-icon icon="bell" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Settings" position="bottom">
            <t-button>
              <t-icon icon="cog" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="User Profile" position="bottom">
            <t-button>
              <t-icon icon="account-circle" />
            </t-button>
          </t-tooltip>
        </div>
      </t-demo-box>

      <t-demo-box label="Example: Interactive Toolbar" example>
        <div class="buttons">
          <t-tooltip text="Bold (Ctrl+B)" position="bottom">
            <t-button>
              <t-icon icon="format-bold" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Italic (Ctrl+I)" position="bottom">
            <t-button>
              <t-icon icon="format-italic" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Underline (Ctrl+U)" position="bottom">
            <t-button>
              <t-icon icon="format-underline" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Align Left" position="bottom">
            <t-button>
              <t-icon icon="format-align-left" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Align Center" position="bottom">
            <t-button>
              <t-icon icon="format-align-center" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Align Right" position="bottom">
            <t-button>
              <t-icon icon="format-align-right" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Insert Link" position="bottom">
            <t-button>
              <t-icon icon="link" />
            </t-button>
          </t-tooltip>
          <t-tooltip text="Insert Image" position="bottom">
            <t-button>
              <t-icon icon="image" />
            </t-button>
          </t-tooltip>
        </div>
      </t-demo-box>

      <t-demo-box label="Example: Tags with Info" example>
        <div class="tags">
          <t-tooltip text="Primary programming language" position="top">
            <t-tag>
              TypeScript
            </t-tag>
          </t-tooltip>
          <t-tooltip text="UI framework" position="top">
            <t-tag>
              Vue.js
            </t-tag>
          </t-tooltip>
          <t-tooltip text="Meta framework for Vue" position="top">
            <t-tag>
              Nuxt
            </t-tag>
          </t-tooltip>
          <t-tooltip text="CSS framework" position="top">
            <t-tag>
              Bulma
            </t-tag>
          </t-tooltip>
        </div>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TDemoBox from '../../components/t-demo-box.vue'

const username = ref('')
const password = ref('')
</script>
