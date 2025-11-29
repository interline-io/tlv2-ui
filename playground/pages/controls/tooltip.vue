<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Tooltip Component
      </h1>
      <p class="subtitle">
        Contextual information on hover
      </p>

      <div class="content">
        <!-- Basic Tooltip -->
        <h2 class="title is-3">
          Basic Tooltip
        </h2>
        <div class="box has-text-centered">
          <t-tooltip label="This is a tooltip">
            <t-button>
              Hover me
            </t-button>
          </t-tooltip>
        </div>

        <!-- Tooltip Positions -->
        <h2 class="title is-3">
          Positions
        </h2>
        <div class="box">
          <div class="has-text-centered mb-4">
            <t-tooltip label="Top tooltip" position="top">
              <t-button>
                Top
              </t-button>
            </t-tooltip>
          </div>
          <div class="is-flex is-justify-content-space-between mb-4">
            <t-tooltip label="Left tooltip" position="left">
              <t-button>
                Left
              </t-button>
            </t-tooltip>
            <t-tooltip label="Right tooltip" position="right">
              <t-button>
                Right
              </t-button>
            </t-tooltip>
          </div>
          <div class="has-text-centered">
            <t-tooltip label="Bottom tooltip" position="bottom">
              <t-button>
                Bottom
              </t-button>
            </t-tooltip>
          </div>
        </div>

        <!-- Tooltip Variants -->
        <h2 class="title is-3">
          Variants
        </h2>
        <div class="box">
          <div class="buttons">
            <t-tooltip label="Primary tooltip" variant="primary">
              <t-button variant="primary">
                Primary
              </t-button>
            </t-tooltip>
            <t-tooltip label="Info tooltip" variant="info">
              <t-button variant="info">
                Info
              </t-button>
            </t-tooltip>
            <t-tooltip label="Success tooltip" variant="success">
              <t-button variant="success">
                Success
              </t-button>
            </t-tooltip>
            <t-tooltip label="Warning tooltip" variant="warning">
              <t-button variant="warning">
                Warning
              </t-button>
            </t-tooltip>
            <t-tooltip label="Danger tooltip" variant="danger">
              <t-button variant="danger">
                Danger
              </t-button>
            </t-tooltip>
          </div>
        </div>

        <!-- Multiline Tooltip -->
        <h2 class="title is-3">
          Multiline Tooltip
        </h2>
        <div class="box has-text-centered">
          <t-tooltip label="This is a longer tooltip that will wrap to multiple lines to display more information." multiline>
            <t-button>
              Hover for multiline
            </t-button>
          </t-tooltip>
        </div>

        <!-- Always Active -->
        <h2 class="title is-3">
          Always Visible
        </h2>
        <div class="box has-text-centered">
          <t-tooltip label="This tooltip is always visible" active>
            <t-button>
              Always shows tooltip
            </t-button>
          </t-tooltip>
        </div>

        <!-- With Icons -->
        <h2 class="title is-3">
          With Icons
        </h2>
        <div class="box">
          <div class="buttons">
            <t-tooltip label="Save changes">
              <t-button variant="primary">
                <t-icon icon="content-save" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Edit item">
              <t-button>
                <t-icon icon="pencil" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Delete item">
              <t-button variant="danger">
                <t-icon icon="delete" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Download file">
              <t-button variant="info">
                <t-icon icon="download" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Share content">
              <t-button>
                <t-icon icon="share-variant" />
              </t-button>
            </t-tooltip>
          </div>
        </div>

        <!-- In Forms -->
        <h2 class="title is-3">
          Form Field Help
        </h2>
        <div class="box">
          <t-field label="Username:">
            <div class="is-flex">
              <t-input v-model="username" expanded />
              <t-tooltip label="Username must be 3-20 characters, alphanumeric only" position="right">
                <t-button class="ml-2">
                  <t-icon icon="help-circle" />
                </t-button>
              </t-tooltip>
            </div>
          </t-field>

          <t-field label="Password:">
            <div class="is-flex">
              <t-input v-model="password" type="password" expanded />
              <t-tooltip label="Password must be at least 8 characters with uppercase, lowercase, and numbers" position="right" multiline>
                <t-button class="ml-2">
                  <t-icon icon="help-circle" />
                </t-button>
              </t-tooltip>
            </div>
          </t-field>
        </div>

        <!-- Tooltip on Text -->
        <h2 class="title is-3">
          Text with Tooltip
        </h2>
        <div class="box">
          <p>
            Hover over
            <t-tooltip label="This is an abbreviation for 'example'" position="top">
              <span class="has-text-primary" style="cursor: help; text-decoration: underline dotted;">
                e.g.
              </span>
            </t-tooltip>
            to see its meaning.
          </p>
          <p class="mt-3">
            The term
            <t-tooltip label="Application Programming Interface" position="top">
              <span class="has-text-info" style="cursor: help; border-bottom: 1px dotted;">
                API
              </span>
            </t-tooltip>
            is commonly used in software development.
          </p>
        </div>

        <!-- Status Indicators -->
        <h2 class="title is-3">
          Status Indicators
        </h2>
        <div class="box">
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
                  <t-tooltip label="All systems operational" variant="success">
                    <t-icon icon="check-circle" class="has-text-success" />
                  </t-tooltip>
                </td>
              </tr>
              <tr>
                <td>Database</td>
                <td>
                  <t-tooltip label="All systems operational" variant="success">
                    <t-icon icon="check-circle" class="has-text-success" />
                  </t-tooltip>
                </td>
              </tr>
              <tr>
                <td>Email Service</td>
                <td>
                  <t-tooltip label="Experiencing minor delays" variant="warning">
                    <t-icon icon="alert" class="has-text-warning" />
                  </t-tooltip>
                </td>
              </tr>
              <tr>
                <td>API Gateway</td>
                <td>
                  <t-tooltip label="Service unavailable - maintenance in progress" variant="danger">
                    <t-icon icon="alert-circle" class="has-text-danger" />
                  </t-tooltip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Navigation Tooltips -->
        <h2 class="title is-3">
          Navigation Menu
        </h2>
        <div class="box">
          <div class="buttons">
            <t-tooltip label="Dashboard" position="bottom">
              <t-button>
                <t-icon icon="view-dashboard" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Messages" position="bottom">
              <t-button>
                <t-icon icon="email" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Notifications" position="bottom">
              <t-button>
                <t-icon icon="bell" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Settings" position="bottom">
              <t-button>
                <t-icon icon="cog" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="User Profile" position="bottom">
              <t-button>
                <t-icon icon="account-circle" />
              </t-button>
            </t-tooltip>
          </div>
        </div>

        <!-- Interactive Example -->
        <h2 class="title is-3">
          Interactive Toolbar
        </h2>
        <div class="box">
          <div class="buttons">
            <t-tooltip label="Bold (Ctrl+B)" position="bottom">
              <t-button>
                <t-icon icon="format-bold" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Italic (Ctrl+I)" position="bottom">
              <t-button>
                <t-icon icon="format-italic" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Underline (Ctrl+U)" position="bottom">
              <t-button>
                <t-icon icon="format-underline" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Align Left" position="bottom">
              <t-button>
                <t-icon icon="format-align-left" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Align Center" position="bottom">
              <t-button>
                <t-icon icon="format-align-center" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Align Right" position="bottom">
              <t-button>
                <t-icon icon="format-align-right" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Insert Link" position="bottom">
              <t-button>
                <t-icon icon="link" />
              </t-button>
            </t-tooltip>
            <t-tooltip label="Insert Image" position="bottom">
              <t-button>
                <t-icon icon="image" />
              </t-button>
            </t-tooltip>
          </div>
        </div>

        <!-- Tag Tooltips -->
        <h2 class="title is-3">
          Tags with Info
        </h2>
        <div class="box">
          <div class="tags">
            <t-tooltip label="Primary programming language" position="top">
              <t-tag variant="primary">
                TypeScript
              </t-tag>
            </t-tooltip>
            <t-tooltip label="UI framework" position="top">
              <t-tag variant="success">
                Vue.js
              </t-tag>
            </t-tooltip>
            <t-tooltip label="Meta framework for Vue" position="top">
              <t-tag variant="info">
                Nuxt
              </t-tag>
            </t-tooltip>
            <t-tooltip label="CSS framework" position="top">
              <t-tag variant="link">
                Bulma
              </t-tag>
            </t-tooltip>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')
</script>
