<template>
  <div class="table-container">
    <table class="table is-striped is-fullwidth">
      <thead>
        <tr>
          <th>Filename</th>
          <th>Rows</th>
          <th>Size</th>
          <th>SHA1 hash</th>
          <th>CSV</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f of files" :key="f.name">
          <td><code>{{ f.name }}</code></td>
          <td>{{ f.rows }}</td>
          <td>{{ $filters.prettyBytes(f.size) }}</td>
          <td><tl-safelink :text="f.sha1" max-width="100px" /></td>
          <td>
            <o-tooltip v-if="f.csv_like" dashed>
              <template #content>
                <div>Columns</div>
                <ul>
                  <li v-for="i of f.header.split(',')" :key="i">
                    {{ i }}
                  </li>
                </ul>
              </template>
              Yes
            </o-tooltip>
            <span v-else>No</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    files: { type: Array, default() { return [] } }
  }
}
</script>
