import { describe, it, expect } from 'vitest'
import TTaginput from '../controls/taginput.vue'
import {
  mountComponent,
  triggerKeyboard
} from '../lib/testutil/component-helpers'

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' }
]

describe('TTaginput allowNew', () => {
  it('adds a free-form tag on Enter', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('custom')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['custom']])
  })

  it('adds a free-form tag on separator key', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('newtag')
    await triggerKeyboard(wrapper, ',', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['newtag']])
  })

  it('does not add free-form tag when allowNew is false', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: false }
    })
    const input = wrapper.find('input')
    await input.setValue('custom')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('does not add duplicate tags', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: ['existing'], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('existing')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    // Should clear input but not emit a new modelValue with duplicate
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('respects maxTags limit', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: ['a', 'b'], options: fruitOptions, allowNew: true, maxTags: 2 }
    })
    const input = wrapper.find('input')
    await input.setValue('third')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('trims whitespace from new tags', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('  spaced  ')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['spaced']])
  })

  it('does not add empty tags', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('   ')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('selects dropdown option over free-form when highlighted', async () => {
    const wrapper = mountComponent(TTaginput, {
      props: { modelValue: [], options: fruitOptions, allowNew: true }
    })
    const input = wrapper.find('input')
    await input.setValue('a') // filters to Apple
    // Arrow down to highlight first option, then Enter
    await triggerKeyboard(wrapper, 'ArrowDown', 'input')
    await triggerKeyboard(wrapper, 'Enter', 'input')
    const emitted = wrapper.emitted('update:modelValue') as string[][]
    expect(emitted[emitted.length - 1]).toEqual([['apple']])
  })
})
