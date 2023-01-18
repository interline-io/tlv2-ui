<template>
  <div class="columns is-mobile is-centered">
    <div class="column is-half">
      <div class="float-center">
        <p v-if="statusCode === 404" class="content is-medium">
          <strong>Sorry.</strong> The page you were looking for appears to have been moved, deleted or does not exist. Please use the navigation bar or go back to the <a href="/">homepage</a>.
        </p>
        <p v-else class="content is-medium">
          <strong>Sorry.</strong> An error has occured: {{ messages.client_error_details }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NuxtError',
  layout: 'default',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      messages: []
    }
  },
  computed: {
    statusCode () {
      return (this.error && this.error.statusCode) || 500
    },
    message () {
      return this.error.message || '<%= messages.client_error %>'
    }
  }
}
</script>
