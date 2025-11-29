<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Card Component
      </h1>
      <p class="subtitle">
        Flexible content container with multiple sections
      </p>

      <div class="content">
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
                "There are two hard things in computer science"
              </p>
              <button class="card-header-icon" aria-label="more options">
                <t-icon icon="chevron-down" />
              </button>
            </template>
            <div class="content">
              <p>
                "There are two hard things in computer science: cache invalidation,
                naming things, and off-by-one errors."
              </p>
              <p class="has-text-grey">
                - Jeff Atwood
              </p>
            </div>
            <template #footer>
              <a href="#" class="card-footer-item">
                <t-icon icon="thumb-up" />
                <span>Like</span>
              </a>
              <a href="#" class="card-footer-item">
                <t-icon icon="share-variant" />
                <span>Share</span>
              </a>
              <a href="#" class="card-footer-item">
                <t-icon icon="bookmark" />
                <span>Bookmark</span>
              </a>
            </template>
          </t-card>
        </t-demo-box>

        <t-demo-box label="Card with Image">
          <div class="columns">
            <div class="column is-one-third">
              <t-card>
                <template #header>
                  <p class="card-header-title">
                    Mountain View
                  </p>
                </template>
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img src="https://picsum.photos/400/300?random=1" alt="Placeholder">
                  </figure>
                </div>
                <div class="content">
                  <p>
                    Beautiful mountain landscape with stunning views.
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
                    Ocean Sunset
                  </p>
                </template>
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img src="https://picsum.photos/400/300?random=2" alt="Placeholder">
                  </figure>
                </div>
                <div class="content">
                  <p>
                    Peaceful ocean view during golden hour.
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
                    Forest Path
                  </p>
                </template>
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img src="https://picsum.photos/400/300?random=3" alt="Placeholder">
                  </figure>
                </div>
                <div class="content">
                  <p>
                    Serene forest trail surrounded by nature.
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

        <t-demo-box label="User Profile Cards">
          <div class="columns">
            <div class="column is-one-third">
              <t-card>
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-48x48">
                        <img src="https://via.placeholder.com/96" alt="Avatar" class="is-rounded">
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-4">
                        John Smith
                      </p>
                      <p class="subtitle is-6">
                        @johnsmith
                      </p>
                    </div>
                  </div>
                  <div class="content">
                    <p>
                      Full-stack developer passionate about building great user experiences.
                    </p>
                    <p class="is-size-7 has-text-grey">
                      <t-icon icon="map-marker" /> San Francisco, CA
                    </p>
                  </div>
                </div>
                <template #footer>
                  <a href="#" class="card-footer-item">Follow</a>
                  <a href="#" class="card-footer-item">Message</a>
                </template>
              </t-card>
            </div>

            <div class="column is-one-third">
              <t-card>
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-48x48">
                        <img src="https://via.placeholder.com/96" alt="Avatar" class="is-rounded">
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-4">
                        Sarah Johnson
                      </p>
                      <p class="subtitle is-6">
                        @sarahj
                      </p>
                    </div>
                  </div>
                  <div class="content">
                    <p>
                      UX designer focused on creating intuitive and beautiful interfaces.
                    </p>
                    <p class="is-size-7 has-text-grey">
                      <t-icon icon="map-marker" /> New York, NY
                    </p>
                  </div>
                </div>
                <template #footer>
                  <a href="#" class="card-footer-item">Follow</a>
                  <a href="#" class="card-footer-item">Message</a>
                </template>
              </t-card>
            </div>

            <div class="column is-one-third">
              <t-card>
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-48x48">
                        <img src="https://via.placeholder.com/96" alt="Avatar" class="is-rounded">
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-4">
                        Mike Davis
                      </p>
                      <p class="subtitle is-6">
                        @miked
                      </p>
                    </div>
                  </div>
                  <div class="content">
                    <p>
                      Product manager helping teams build amazing products.
                    </p>
                    <p class="is-size-7 has-text-grey">
                      <t-icon icon="map-marker" /> Austin, TX
                    </p>
                  </div>
                </div>
                <template #footer>
                  <a href="#" class="card-footer-item">Follow</a>
                  <a href="#" class="card-footer-item">Message</a>
                </template>
              </t-card>
            </div>
          </div>
        </t-demo-box>

        <t-demo-box label="Statistics Cards">
          <div class="columns">
            <div class="column">
              <t-card>
                <div class="card-content has-text-centered">
                  <p class="heading">
                    Total Users
                  </p>
                  <p class="title">
                    12,345
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
                    Revenue
                  </p>
                  <p class="title">
                    $54,321
                  </p>
                  <p class="has-text-success">
                    <t-icon icon="arrow-up" />
                    +23%
                  </p>
                </div>
              </t-card>
            </div>
            <div class="column">
              <t-card>
                <div class="card-content has-text-centered">
                  <p class="heading">
                    Orders
                  </p>
                  <p class="title">
                    1,234
                  </p>
                  <p class="has-text-danger">
                    <t-icon icon="arrow-down" />
                    -8%
                  </p>
                </div>
              </t-card>
            </div>
            <div class="column">
              <t-card>
                <div class="card-content has-text-centered">
                  <p class="heading">
                    Satisfaction
                  </p>
                  <p class="title">
                    98%
                  </p>
                  <p class="has-text-success">
                    <t-icon icon="arrow-up" />
                    +2%
                  </p>
                </div>
              </t-card>
            </div>
          </div>
        </t-demo-box>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>
