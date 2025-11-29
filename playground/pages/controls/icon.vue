<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        Icon Component
      </h1>
      <p class="subtitle">
        Material Design Icons integration
      </p>

      <!-- Basic Icons -->
      <h2 class="title is-3">
        Basic Icons
      </h2>
      <div class="box">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <t-icon icon="home" />
          <t-icon icon="account" />
          <t-icon icon="cog" />
          <t-icon icon="bell" />
          <t-icon icon="email" />
          <t-icon icon="heart" />
          <t-icon icon="star" />
          <t-icon icon="check" />
        </div>
      </div>

      <!-- Sizes -->
      <h2 class="title is-3">
        Sizes
      </h2>
      <div class="box">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <t-icon icon="home" size="small" />
          <t-icon icon="home" />
          <t-icon icon="home" size="medium" />
          <t-icon icon="home" size="large" />
        </div>
        <p class="has-text-grey mt-3">
          Sizes: small, normal (default), medium, large
        </p>
      </div>

      <!-- Colors -->
      <h2 class="title is-3">
        Colors
      </h2>
      <div class="box">
        <div class="is-flex is-align-items-center" style="gap: 1rem;">
          <t-icon icon="heart" class="has-text-primary" />
          <t-icon icon="heart" class="has-text-info" />
          <t-icon icon="heart" class="has-text-success" />
          <t-icon icon="heart" class="has-text-warning" />
          <t-icon icon="heart" class="has-text-danger" />
          <t-icon icon="heart" class="has-text-dark" />
        </div>
        <p class="has-text-grey mt-3">
          Use Bulma color helper classes to change icon colors
        </p>
      </div>

      <!-- Common Icons -->
      <h2 class="title is-3">
        Common Icons
      </h2>
      <div class="box">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="home" />
              <span class="ml-2">home</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="account" />
              <span class="ml-2">account</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="cog" />
              <span class="ml-2">cog</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="bell" />
              <span class="ml-2">bell</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="email" />
              <span class="ml-2">email</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="heart" />
              <span class="ml-2">heart</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="star" />
              <span class="ml-2">star</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="check" />
              <span class="ml-2">check</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="close" />
              <span class="ml-2">close</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="menu" />
              <span class="ml-2">menu</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="search" />
              <span class="ml-2">search</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="plus" />
              <span class="ml-2">plus</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="pencil" />
              <span class="ml-2">pencil</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="delete" />
              <span class="ml-2">delete</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="upload" />
              <span class="ml-2">upload</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="download" />
              <span class="ml-2">download</span>
            </div>
          </div>
        </div>
      </div>

      <!-- With Buttons -->
      <h2 class="title is-3">
        Icons in Buttons
      </h2>
      <div class="box">
        <div class="buttons">
          <t-button variant="primary">
            <t-icon icon="plus" />
            <span>Add</span>
          </t-button>
          <t-button variant="info">
            <t-icon icon="pencil" />
            <span>Edit</span>
          </t-button>
          <t-button variant="danger">
            <t-icon icon="delete" />
            <span>Delete</span>
          </t-button>
          <t-button>
            <t-icon icon="download" />
            <span>Download</span>
          </t-button>
        </div>
        <div class="buttons">
          <t-button variant="primary">
            <t-icon icon="content-save" />
          </t-button>
          <t-button variant="info">
            <t-icon icon="share-variant" />
          </t-button>
          <t-button>
            <t-icon icon="dots-vertical" />
          </t-button>
        </div>
      </div>

      <!-- Navigation Icons -->
      <h2 class="title is-3">
        Navigation Icons
      </h2>
      <div class="box">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="arrow-left" />
              <span class="ml-2">arrow-left</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="arrow-right" />
              <span class="ml-2">arrow-right</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="arrow-up" />
              <span class="ml-2">arrow-up</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="arrow-down" />
              <span class="ml-2">arrow-down</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="chevron-left" />
              <span class="ml-2">chevron-left</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="chevron-right" />
              <span class="ml-2">chevron-right</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="chevron-up" />
              <span class="ml-2">chevron-up</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="chevron-down" />
              <span class="ml-2">chevron-down</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Icons -->
      <h2 class="title is-3">
        Status Icons
      </h2>
      <div class="box">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="check-circle" class="has-text-success" />
              <span class="ml-2">Success</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="information" class="has-text-info" />
              <span class="ml-2">Information</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="alert" class="has-text-warning" />
              <span class="ml-2">Warning</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="alert-circle" class="has-text-danger" />
              <span class="ml-2">Error</span>
            </div>
          </div>
        </div>
      </div>

      <!-- File Type Icons -->
      <h2 class="title is-3">
        File Type Icons
      </h2>
      <div class="box">
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="file-document" />
              <span class="ml-2">Document</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="file-image" />
              <span class="ml-2">Image</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="file-video" />
              <span class="ml-2">Video</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="file-music" />
              <span class="ml-2">Music</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="file-pdf-box" />
              <span class="ml-2">PDF</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="file-code" />
              <span class="ml-2">Code</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="folder" />
              <span class="ml-2">Folder</span>
            </div>
          </div>
          <div class="column is-one-quarter">
            <div class="is-flex is-align-items-center">
              <t-icon icon="zip-box" />
              <span class="ml-2">Archive</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Social Media Icons -->
      <h2 class="title is-3">
        Social Media Icons
      </h2>
      <div class="box">
        <div class="buttons">
          <t-button>
            <t-icon icon="facebook" />
          </t-button>
          <t-button>
            <t-icon icon="twitter" />
          </t-button>
          <t-button>
            <t-icon icon="instagram" />
          </t-button>
          <t-button>
            <t-icon icon="linkedin" />
          </t-button>
          <t-button>
            <t-icon icon="github" />
          </t-button>
          <t-button>
            <t-icon icon="youtube" />
          </t-button>
        </div>
      </div>

      <!-- Icon Reference -->
      <h2 class="title is-3">
        Icon Reference
      </h2>
      <div class="box">
        <div class="notification is-info is-light">
          <p>
            <strong>Material Design Icons</strong>
          </p>
          <p class="mt-2">
            This component uses <a href="https://materialdesignicons.com/" target="_blank">Material Design Icons</a>.
            Browse the full icon library at:
          </p>
          <p class="mt-2">
            <a href="https://materialdesignicons.com/" target="_blank">
              https://materialdesignicons.com/
            </a>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>
