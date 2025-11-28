import { describe, it, expect } from 'vitest'
import TInput from '../controls/input.vue'
import {
  mountComponent,
  testVModel,
  variantProps,
  sizeProps,
  testBulmaClasses,
  testDisabledState
} from '../testutil/component-helpers'

describe('TInput', () => {
  it('renders text input by default', () => {
    const wrapper = mountComponent(TInput, {
      props: { modelValue: '' }
    })

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('text')
    testBulmaClasses(wrapper, ['input'])
  })

  it('handles v-model binding', async () => {
    const wrapper = mountComponent(TInput, {
      props: { modelValue: 'initial' }
    })

    await testVModel(wrapper, 'input', 'new value')
  })

  it('renders different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'url', 'date']

    types.forEach((type) => {
      const wrapper = mountComponent(TInput, {
        props: {
          modelValue: '',
          type
        }
      })

      expect(wrapper.find('input').attributes('type')).toBe(type)
    })
  })

  it('renders all variants', () => {
    variantProps().forEach((variant) => {
      const wrapper = mountComponent(TInput, {
        props: {
          modelValue: '',
          variant
        }
      })

      testBulmaClasses(wrapper, ['input', `is-${variant}`])
    })
  })

  it('renders all sizes', () => {
    sizeProps().forEach((size) => {
      if (size === 'normal') return

      const wrapper = mountComponent(TInput, {
        props: {
          modelValue: '',
          size
        }
      })

      testBulmaClasses(wrapper, ['input', `is-${size}`])
    })
  })

  it('handles disabled state', () => {
    const wrapper = mountComponent(TInput, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    testDisabledState(wrapper, 'input')
  })

  it('handles readonly state', () => {
    const wrapper = mountComponent(TInput, {
      props: {
        modelValue: 'readonly value',
        readonly: true
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('readonly')).toBeDefined()
  })

  it('renders loading state', () => {
    const wrapper = mountComponent(TInput, {
      props: {
        modelValue: '',
        loading: true
      }
    })

    testBulmaClasses(wrapper, ['input', 'is-loading'])
  })

  it('renders rounded input', () => {
    const wrapper = mountComponent(TInput, {
      props: {
        modelValue: '',
        rounded: true
      }
    })

    testBulmaClasses(wrapper, ['input', 'is-rounded'])
  })

  it('handles placeholder', () => {
    const wrapper = mountComponent(TInput, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
  })

  it('handles maxlength', () => {
    const wrapper = mountComponent(TInput, {
      props: {
        modelValue: '',
        maxlength: 20
      }
    })

    expect(wrapper.find('input').attributes('maxlength')).toBe('20')
  })
})
