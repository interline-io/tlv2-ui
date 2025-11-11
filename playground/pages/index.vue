<template>
  <div>
    <p>This is an <a href="/">Example Page</a></p>
    <br>
    <o-field label="Notification">
      <o-notification variant="primary">
        This is a test <strong>o-notification</strong> component.
      </o-notification>
    </o-field>
    <br>
    <o-field label="Autocomplete">
      <o-autocomplete />
    </o-field>
    <br>
    <o-field label="Slider">
      <o-slider :model-value="8" />
    </o-field>
    <br>
    <o-field label="Datepicker">
      <o-datetimepicker />
    </o-field>
  </div>
</template>
