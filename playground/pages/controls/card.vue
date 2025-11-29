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
</script>
