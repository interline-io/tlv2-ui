<template>
  <form style="flex: 1 0 auto;" @submit.prevent>
    <div class="field has-addons" style="flex: 1 0 auto;">
      <div class="control" style="flex: 1 0 auto;">
        <o-autocomplete
          :expanded="focused"
          :data="data"
          max-height="600px"
          placeholder="Search operators, feeds, and routes..."
          :loading="isFetching"
          :clearable="true"
          icon="magnify"
          @focus="focus"
          @blur="blur"
          @typing="typing"
          @select="option => selected = option"
          @keydown.esc.native="clearSearch"
        >
          <template #default="props">
            {{ props.option.name }}
            <span class="is-pulled-right" style="color:#ccc">{{ props.option.type }}</span>
          </template>
        </o-autocomplete>
      </div>
      <!-- <div class="control">
        <button v-if="focused" class="button is-primary" @click="goToSearch">
          Search
        </button>
      </div> -->
    </div>
  </form>
</template>

<script>
import SearchBarMixin from './search-bar-mixin'
export default {
  mixins: [SearchBarMixin],
  data () {
    return {
      focused: false,
      selected: null
    }
  },
  watch: {
    selected () {
      this.$emit('blur')
      const key = this.selected ? this.selected.type : null
      const ent = this.selected.entity
      if (!key) {
        return
      }
      if (key === 'Feed') {
        this.$router.push({ name: 'feeds-feedKey', params: { feedKey: ent.onestop_id } })
      } else if (key === 'Operator') {
        this.$router.push({ name: 'operators-operatorKey', params: { operatorKey: ent.onestop_id } })
      } else if (key === 'Route') {
        this.$router.push($filters.makeRouteLink(ent.onestop_id, ent.feed_onestop_id, ent.feed_version_sha1, ent.route_id, ent.id, false))
      } else if (key === 'Stop') {
        this.$router.push($filters.makeStopLink(ent.onestop_id, ent.feed_onestop_id, ent.feed_version_sha1, ent.stop_id, ent.id, false))
      }
    }
  },
  methods: {
    typing (val) {
      this.search = val
      return this.getAsyncData(val)
    },
    selectOrSearch () {
      if (typeof this.selected !== 'undefined') {
        this.selected()
      } else {
        this.goToSearch()
      }
    },
    goToSearch () {
      this.$emit('blur')
      this.$router.push({ name: 'search', query: { q: this.search } })
      this.clearSearch()
    },
    focus () {
      this.focused = true
      this.$emit('focus')
    },
    blur () {
      this.focused = false
      this.$emit('blur')
    }
  }
}
</script>
