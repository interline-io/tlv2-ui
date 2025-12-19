<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Card Component
      </h1>
      <p class="subtitle">
        Flexible content container with multiple sections
      </p>

      <t-demo-box label="Basic Card">
        <t-card>
          <div class="content">
            <p>
              This is a basic card with content. Cards are versatile containers
              that can hold any type of content.
            </p>
          </div>
        </t-card>
      </t-demo-box>

      <t-demo-box label="Card with Header">
        <t-card>
          <template #header>
            <p class="card-header-title">
              Component
            </p>
            <button class="card-header-icon" aria-label="more options">
              <t-icon icon="dots-vertical" />
            </button>
          </template>
          <div class="content">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Phasellus nec iaculis mauris.
            </p>
          </div>
        </t-card>
      </t-demo-box>

      <t-demo-box label="Card with Footer">
        <t-card>
          <div class="content">
            <p>
              This card includes a footer with action buttons.
            </p>
          </div>
          <template #footer>
            <a href="#" class="card-footer-item">Save</a>
            <a href="#" class="card-footer-item">Edit</a>
            <a href="#" class="card-footer-item">Delete</a>
          </template>
        </t-card>
      </t-demo-box>

      <t-demo-box label="Expandable Card">
        <div class="columns">
          <div class="column">
            <t-card label="Click to Expand" expandable>
              <div class="content">
                <p>
                  This card is initially closed. Click the header or the chevron icon to expand it.
                  The content smoothly animates in and out.
                </p>
              </div>
            </t-card>
          </div>
          <div class="column">
            <t-card label="Initially Expanded" expandable :open="true">
              <div class="content">
                <p>
                  This card starts in an expanded state. Click to collapse.
                </p>
              </div>
            </t-card>
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Controlled Expandable Card">
        <div class="buttons mb-4">
          <t-button @click="cardOpen = !cardOpen">
            {{ cardOpen ? 'Close Card' : 'Open Card' }}
          </t-button>
        </div>
        <t-card v-model:open="cardOpen" label="Controlled Card" expandable>
          <div class="content">
            <p>
              This card's open state is controlled externally via <code>v-model:open</code>.
              Use the button above to toggle.
            </p>
          </div>
        </t-card>
      </t-demo-box>

      <t-demo-box label="Expandable with Footer">
        <t-card label="Settings" expandable>
          <div class="content">
            <p>
              When collapsed, both content and footer are hidden.
            </p>
            <t-field label="Option 1">
              <t-checkbox>Enable feature</t-checkbox>
            </t-field>
            <t-field label="Option 2">
              <t-checkbox>Another option</t-checkbox>
            </t-field>
          </div>
          <template #footer>
            <a href="#" class="card-footer-item">Save</a>
            <a href="#" class="card-footer-item">Cancel</a>
          </template>
        </t-card>
      </t-demo-box>

      <t-demo-box label="Complete Card">
        <t-card>
          <template #header>
            <p class="card-header-title">
              Card Title
            </p>
            <button class="card-header-icon" aria-label="more options">
              <t-icon icon="chevron-down" />
            </button>
          </template>
          <div class="content">
            <p>
              This card demonstrates all available sections: a header with title and icon,
              content area, and a footer with multiple action items.
            </p>
          </div>
          <template #footer>
            <a href="#" class="card-footer-item">Action 1</a>
            <a href="#" class="card-footer-item">Action 2</a>
            <a href="#" class="card-footer-item">Action 3</a>
          </template>
        </t-card>
      </t-demo-box>

      <t-demo-box label="Example: Card with Image" example>
        <div class="columns">
          <div class="column is-one-third">
            <t-card>
              <template #header>
                <p class="card-header-title">
                  Image Card 1
                </p>
              </template>
              <div class="card-image">
                <figure class="image is-4by3">
                  <img src="https://picsum.photos/400/300?random=1" alt="Placeholder">
                </figure>
              </div>
              <div class="content">
                <p>
                  Card with header, image, content, and footer sections.
                </p>
              </div>
              <template #footer>
                <a href="#" class="card-footer-item">View</a>
                <a href="#" class="card-footer-item">Download</a>
              </template>
            </t-card>
          </div>

          <div class="column is-one-third">
            <t-card>
              <template #header>
                <p class="card-header-title">
                  Image Card 2
                </p>
              </template>
              <div class="card-image">
                <figure class="image is-4by3">
                  <img src="https://picsum.photos/400/300?random=2" alt="Placeholder">
                </figure>
              </div>
              <div class="content">
                <p>
                  Card with header, image, content, and footer sections.
                </p>
              </div>
              <template #footer>
                <a href="#" class="card-footer-item">View</a>
                <a href="#" class="card-footer-item">Download</a>
              </template>
            </t-card>
          </div>

          <div class="column is-one-third">
            <t-card>
              <template #header>
                <p class="card-header-title">
                  Image Card 3
                </p>
              </template>
              <div class="card-image">
                <figure class="image is-4by3">
                  <img src="https://picsum.photos/400/300?random=3" alt="Placeholder">
                </figure>
              </div>
              <div class="content">
                <p>
                  Card with header, image, content, and footer sections.
                </p>
              </div>
              <template #footer>
                <a href="#" class="card-footer-item">View</a>
                <a href="#" class="card-footer-item">Download</a>
              </template>
            </t-card>
          </div>
        </div>
      </t-demo-box>

      <t-demo-box label="Example: Statistics Cards" example>
        <div class="columns">
          <div class="column">
            <t-card>
              <div class="card-content has-text-centered">
                <p class="heading">
                  Metric 1
                </p>
                <p class="title">
                  1,234
                </p>
                <p class="has-text-success">
                  <t-icon icon="arrow-up" />
                  +10%
                </p>
              </div>
            </t-card>
          </div>
          <div class="column">
            <t-card>
              <div class="card-content has-text-centered">
                <p class="heading">
                  Metric 2
                </p>
                <p class="title">
                  5,678
                </p>
                <p class="has-text-success">
                  <t-icon icon="arrow-up" />
                  +15%
                </p>
              </div>
            </t-card>
          </div>
          <div class="column">
            <t-card>
              <div class="card-content has-text-centered">
                <p class="heading">
                  Metric 3
                </p>
                <p class="title">
                  987
                </p>
                <p class="has-text-danger">
                  <t-icon icon="arrow-down" />
                  -5%
                </p>
              </div>
            </t-card>
          </div>
          <div class="column">
            <t-card>
              <div class="card-content has-text-centered">
                <p class="heading">
                  Metric 4
                </p>
                <p class="title">
                  456
                </p>
                <p class="has-text-success">
                  <t-icon icon="arrow-up" />
                  +8%
                </p>
              </div>
            </t-card>
          </div>
        </div>
      </t-demo-box>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TDemoBox from '../../components/t-demo-box.vue'

const cardOpen = ref(true)
</script>
