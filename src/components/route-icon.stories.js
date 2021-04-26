export default {
  title: 'tl-route-icon',
  argTypes: {
    routeType: {
      control: {type:'radio', options: [0,1,2,3]},
      defaultValue: 1,
    },
    routeShortName: {
      control: 'text',
      defaultValue: 'Orange'
    },
    routeLongName: {
      control: 'text',
      defaultValue: 'Richmond / Berryessa'
    },
    routeUrl: {
      control: 'text',
      defaultValue: 'https://www.bart.gov'
    }
  }
}

export const Route = (arg, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: '<tl-route-icon v-bind="$props" />'
})