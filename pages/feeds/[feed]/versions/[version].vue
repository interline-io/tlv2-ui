<template>
  <div>
    <tl-pages-feed-version
      :feed-version-sha1="version"
      :can-edit="true"
    />
  </div>
</template>

<script lang="ts">
// not sure why this particular component requires converting to single string
function getFirstValue (v: string | string[]): string {
  if (typeof (v) === 'string') {
    return v
  } else if (typeof (v) === 'object' && v.length > 0) {
    return v[0]
  }
  return ''
}

export default {
  computed: {
    version () {
      return getFirstValue(this.$route.params.version)
    }
  }
}
</script>
