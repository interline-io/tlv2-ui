import { describe, it, expect } from 'vitest'
import TButton from '../controls/button.vue'
import {
  mountComponent,
  variantProps,
  sizeProps,
  testBulmaClasses,
  testSlotContent,
  testDisabledState
} from '../lib/testutil/component-helpers'

describe('TButton', () => {
  it('renders default button', () => {
    const wrapper = mountComponent(TButton, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.html()).toContain('Click me')
    expect(wrapper.find('button').exists()).toBe(true)
    testBulmaClasses(wrapper.find('button'), ['button'])
  })

  it('renders all variants', () => {
    variantProps().forEach((variant) => {
      const wrapper = mountComponent(TButton, {
        props: { variant },
        slots: { default: 'Button' }
      })

      testBulmaClasses(wrapper.find('button'), ['button', `is-${variant}`])
    })
  })

  it('renders all sizes', () => {
    sizeProps().forEach((size) => {
      if (size === 'normal') return // 'normal' doesn't add a class

      const wrapper = mountComponent(TButton, {
        props: { size },
        slots: { default: 'Button' }
      })

      testBulmaClasses(wrapper.find('button'), ['button', `is-${size}`])
    })
  })

  it('renders outlined variant', () => {
    const wrapper = mountComponent(TButton, {
      props: {
        variant: 'primary',
        outlined: true
      },
      slots: { default: 'Button' }
    })

    testBulmaClasses(wrapper.find('button'), ['button', 'is-primary', 'is-outlined'])
  })

  it('renders rounded variant', () => {
    const wrapper = mountComponent(TButton, {
      props: { rounded: true },
      slots: { default: 'Button' }
    })

    testBulmaClasses(wrapper.find('button'), ['button', 'is-rounded'])
  })

  it('renders loading state', () => {
    const wrapper = mountComponent(TButton, {
      props: { loading: true },
      slots: { default: 'Button' }
    })

    testBulmaClasses(wrapper.find('button'), ['button', 'is-loading'])
  })

  it('handles disabled state', () => {
    const wrapper = mountComponent(TButton, {
      props: { disabled: true },
      slots: { default: 'Button' }
    })

    testDisabledState(wrapper, 'button')
  })

  it('emits click event', async () => {
    const wrapper = mountComponent(TButton, {
      slots: { default: 'Button' }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders slot content', () => {
    const wrapper = mountComponent(TButton, {
      slots: {
        default: '<span>Custom Content</span>'
      }
    })

    testSlotContent(wrapper, 'Custom Content')
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mountComponent(TButton, {
      props: { disabled: true },
      slots: { default: 'Button' }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
