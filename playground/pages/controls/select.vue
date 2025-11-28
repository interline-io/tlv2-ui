<template>
  <div class="container">
    <section class="section">
      <NuxtLink to="/" class="button is-light mb-4">
        <t-icon icon="arrow-left" />
        <span>Back to Index</span>
      </NuxtLink>

      <h1 class="title is-1">
        Select Component
      </h1>
      <p class="subtitle">
        Dropdown selection control
      </p>

      <div class="content">
        <!-- Basic Select -->
        <h2 class="title is-3">
          Basic Select
        </h2>
        <div class="box">
          <t-field label="Choose a country:">
            <t-select v-model="basic" placeholder="Select a country">
              <option value="us">
                United States
              </option>
              <option value="uk">
                United Kingdom
              </option>
              <option value="ca">
                Canada
              </option>
              <option value="au">
                Australia
              </option>
              <option value="de">
                Germany
              </option>
            </t-select>
          </t-field>
          <p class="has-text-grey">
            Selected: {{ basic || 'None' }}
          </p>
        </div>

        <!-- Multiple Selection -->
        <h2 class="title is-3">
          Multiple Selection
        </h2>
        <div class="box">
          <t-field label="Select multiple languages:">
            <t-select v-model="multiple" multiple>
              <option value="js">
                JavaScript
              </option>
              <option value="py">
                Python
              </option>
              <option value="rb">
                Ruby
              </option>
              <option value="go">
                Go
              </option>
              <option value="rs">
                Rust
              </option>
              <option value="ts">
                TypeScript
              </option>
            </t-select>
          </t-field>
          <p class="has-text-grey">
            Selected: {{ multiple.length > 0 ? multiple.join(', ') : 'None' }}
          </p>
        </div>

        <!-- Variants -->
        <h2 class="title is-3">
          Variants
        </h2>
        <div class="box">
          <t-field label="Primary:">
            <t-select v-model="variantPrimary" variant="primary">
              <option value="1">
                Option 1
              </option>
              <option value="2">
                Option 2
              </option>
              <option value="3">
                Option 3
              </option>
            </t-select>
          </t-field>
          <t-field label="Info:">
            <t-select v-model="variantInfo" variant="info">
              <option value="1">
                Option 1
              </option>
              <option value="2">
                Option 2
              </option>
            </t-select>
          </t-field>
          <t-field label="Success:">
            <t-select v-model="variantSuccess" variant="success">
              <option value="1">
                Option 1
              </option>
              <option value="2">
                Option 2
              </option>
            </t-select>
          </t-field>
          <t-field label="Warning:">
            <t-select v-model="variantWarning" variant="warning">
              <option value="1">
                Option 1
              </option>
              <option value="2">
                Option 2
              </option>
            </t-select>
          </t-field>
          <t-field label="Danger:">
            <t-select v-model="variantDanger" variant="danger">
              <option value="1">
                Option 1
              </option>
              <option value="2">
                Option 2
              </option>
            </t-select>
          </t-field>
        </div>

        <!-- Sizes -->
        <h2 class="title is-3">
          Sizes
        </h2>
        <div class="box">
          <t-field label="Small:">
            <t-select v-model="sizeSmall" size="small">
              <option value="1">
                Small select
              </option>
            </t-select>
          </t-field>
          <t-field label="Normal:">
            <t-select v-model="sizeNormal">
              <option value="1">
                Normal select
              </option>
            </t-select>
          </t-field>
          <t-field label="Medium:">
            <t-select v-model="sizeMedium" size="medium">
              <option value="1">
                Medium select
              </option>
            </t-select>
          </t-field>
          <t-field label="Large:">
            <t-select v-model="sizeLarge" size="large">
              <option value="1">
                Large select
              </option>
            </t-select>
          </t-field>
        </div>

        <!-- States -->
        <h2 class="title is-3">
          States
        </h2>
        <div class="box">
          <t-field label="Disabled:">
            <t-select v-model="stateDisabled" disabled>
              <option value="1">
                Cannot select this
              </option>
            </t-select>
          </t-field>
          <t-field label="Loading:">
            <t-select v-model="stateLoading" loading>
              <option value="1">
                Loading data...
              </option>
            </t-select>
          </t-field>
          <t-field label="Readonly:">
            <t-select v-model="stateReadonly" readonly>
              <option value="selected">
                Selected option
              </option>
              <option value="other">
                Other option
              </option>
            </t-select>
          </t-field>
        </div>

        <!-- Rounded Style -->
        <h2 class="title is-3">
          Rounded Style
        </h2>
        <div class="box">
          <t-field label="Choose an option:">
            <t-select v-model="rounded" rounded>
              <option value="1">
                Rounded option 1
              </option>
              <option value="2">
                Rounded option 2
              </option>
              <option value="3">
                Rounded option 3
              </option>
            </t-select>
          </t-field>
        </div>

        <!-- Expanded (Full Width) -->
        <h2 class="title is-3">
          Expanded (Full Width)
        </h2>
        <div class="box">
          <t-field label="Full width select:">
            <t-select v-model="expanded" expanded>
              <option value="1">
                This select takes the full width
              </option>
              <option value="2">
                Option 2
              </option>
            </t-select>
          </t-field>
        </div>

        <!-- Practical Examples -->
        <h2 class="title is-3">
          Product Filter
        </h2>
        <div class="box">
          <div class="columns">
            <div class="column">
              <t-field label="Category:">
                <t-select v-model="filter.category" expanded>
                  <option value="">
                    All Categories
                  </option>
                  <option value="electronics">
                    Electronics
                  </option>
                  <option value="clothing">
                    Clothing
                  </option>
                  <option value="books">
                    Books
                  </option>
                  <option value="home">
                    Home & Garden
                  </option>
                </t-select>
              </t-field>
            </div>
            <div class="column">
              <t-field label="Sort by:">
                <t-select v-model="filter.sort" expanded>
                  <option value="popular">
                    Most Popular
                  </option>
                  <option value="price-low">
                    Price: Low to High
                  </option>
                  <option value="price-high">
                    Price: High to Low
                  </option>
                  <option value="newest">
                    Newest First
                  </option>
                </t-select>
              </t-field>
            </div>
            <div class="column">
              <t-field label="Price Range:">
                <t-select v-model="filter.price" expanded>
                  <option value="all">
                    All Prices
                  </option>
                  <option value="0-25">
                    $0 - $25
                  </option>
                  <option value="25-50">
                    $25 - $50
                  </option>
                  <option value="50-100">
                    $50 - $100
                  </option>
                  <option value="100+">
                    $100+
                  </option>
                </t-select>
              </t-field>
            </div>
          </div>
          <p class="has-text-grey">
            Filters: Category={{ filter.category || 'All' }}, Sort={{ filter.sort }}, Price={{ filter.price }}
          </p>
        </div>

        <!-- Time Zone Selector -->
        <h2 class="title is-3">
          Time Zone Selector
        </h2>
        <div class="box">
          <t-field label="Select your time zone:">
            <t-select v-model="timezone" expanded>
              <optgroup label="North America">
                <option value="PST">
                  Pacific Time (PST)
                </option>
                <option value="MST">
                  Mountain Time (MST)
                </option>
                <option value="CST">
                  Central Time (CST)
                </option>
                <option value="EST">
                  Eastern Time (EST)
                </option>
              </optgroup>
              <optgroup label="Europe">
                <option value="GMT">
                  Greenwich Mean Time (GMT)
                </option>
                <option value="CET">
                  Central European Time (CET)
                </option>
                <option value="EET">
                  Eastern European Time (EET)
                </option>
              </optgroup>
              <optgroup label="Asia">
                <option value="IST">
                  India Standard Time (IST)
                </option>
                <option value="CST_CHINA">
                  China Standard Time (CST)
                </option>
                <option value="JST">
                  Japan Standard Time (JST)
                </option>
              </optgroup>
            </t-select>
          </t-field>
        </div>

        <!-- With Icons -->
        <h2 class="title is-3">
          With Icon
        </h2>
        <div class="box">
          <t-field label="Choose a theme:">
            <t-select v-model="theme" icon="palette" expanded>
              <option value="light">
                Light Theme
              </option>
              <option value="dark">
                Dark Theme
              </option>
              <option value="auto">
                Auto (System)
              </option>
            </t-select>
          </t-field>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const basic = ref('us')
const multiple = ref(['js', 'ts'])

const variantPrimary = ref('1')
const variantInfo = ref('1')
const variantSuccess = ref('1')
const variantWarning = ref('1')
const variantDanger = ref('1')

const sizeSmall = ref('1')
const sizeNormal = ref('1')
const sizeMedium = ref('1')
const sizeLarge = ref('1')

const stateDisabled = ref('1')
const stateLoading = ref('1')
const stateReadonly = ref('selected')

const rounded = ref('1')
const expanded = ref('1')

const filter = ref({
  category: 'electronics',
  sort: 'popular',
  price: 'all'
})

const timezone = ref('PST')
const theme = ref('auto')
</script>
