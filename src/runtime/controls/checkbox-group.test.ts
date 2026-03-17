import { describe, it, expect } from 'vitest'
import TCheckboxGroup from './checkbox-group.vue'
import { mountComponent } from '../lib/testutil/component-helpers'

// Helper to get checkbox element with proper typing
function getCheckboxAt (wrapper: ReturnType<typeof mountComponent>, index: number): HTMLInputElement {
  const checkboxes = wrapper.findAll('input[type="checkbox"]')
  const checkbox = checkboxes[index]
  if (!checkbox) {
    throw new Error(`No checkbox found at index ${index}`)
  }
  return checkbox.element as HTMLInputElement
}

describe('TCheckboxGroup', () => {
  describe('undefined means all semantic (default)', () => {
    it('treats undefined as all selected by default', () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: undefined,
          options: ['a', 'b', 'c']
          // undefinedMeansNone defaults to false, so undefined = all selected
        }
      })

      // All option checkboxes should be checked (buttons are separate from checkboxes)
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(3) // 3 options only (no checkbox in header)
      expect(getCheckboxAt(wrapper, 0).checked).toBe(true)
      expect(getCheckboxAt(wrapper, 1).checked).toBe(true)
      expect(getCheckboxAt(wrapper, 2).checked).toBe(true)
    })

    it('treats undefined as none selected when undefinedMeansNone is true', () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: undefined,
          options: ['a', 'b', 'c'],
          undefinedMeansNone: true
        }
      })

      expect(getCheckboxAt(wrapper, 0).checked).toBe(false)
      expect(getCheckboxAt(wrapper, 1).checked).toBe(false)
      expect(getCheckboxAt(wrapper, 2).checked).toBe(false)
    })

    it('emits undefined when all options are selected (default behavior)', async () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: ['a', 'b'],
          options: ['a', 'b', 'c']
          // undefinedMeansNone defaults to false
        }
      })

      // Check the third option to complete the set
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const thirdOption = checkboxes[2] // index 2 is 'c' (0-indexed)
      expect(thirdOption).toBeDefined()
      await thirdOption!.setValue(true)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([undefined])
    })
  })

  describe('empty array vs undefined distinction', () => {
    it('emits empty array when deselecting all options one by one', async () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: ['a'],
          options: ['a', 'b', 'c']
        }
      })

      // Deselect the only selected option
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const firstOption = checkboxes[0] // index 0 is 'a' (0-indexed, no select-all checkbox)
      expect(firstOption).toBeDefined()
      await firstOption!.setValue(false) // uncheck 'a'

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]])
    })

    it('emits empty array when using Select None button', async () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: undefined,
          options: ['a', 'b', 'c']
          // hideSelectAll defaults to false, so buttons are shown
        }
      })

      // Click the "Select None" button
      const buttons = wrapper.findAll('.t-checkbox-group-header button')
      expect(buttons.length).toBe(2)
      const selectNoneButton = buttons[1]!
      await selectNoneButton.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]])
    })
  })

  describe('object options', () => {
    it('works with object options using valueField and labelField', () => {
      const options = [
        { id: 'opt1', name: 'Option 1' },
        { id: 'opt2', name: 'Option 2' }
      ]
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: ['opt1'],
          options,
          valueField: 'id',
          labelField: 'name'
        }
      })

      expect(getCheckboxAt(wrapper, 0).checked).toBe(true)
      expect(getCheckboxAt(wrapper, 1).checked).toBe(false)
    })
  })

  describe('select all functionality', () => {
    it('highlights Select All button when all options are selected', () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: undefined, // undefined means all selected
          options: ['a', 'b', 'c']
        }
      })

      const buttons = wrapper.findAll('.t-checkbox-group-header button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
      expect(buttons[0]!.classes()).toContain('is-selected')
    })

    it('highlights Select None button when no options are selected', () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: [],
          options: ['a', 'b', 'c']
        }
      })

      const buttons = wrapper.findAll('.t-checkbox-group-header button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      expect(buttons[1]!.classes()).toContain('is-selected')
    })

    it('hides buttons when hideSelectAll is true', () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: ['a'],
          options: ['a', 'b', 'c'],
          hideSelectAll: true
        }
      })

      expect(wrapper.find('.t-checkbox-group-header').exists()).toBe(false)
    })
  })

  describe('empty options', () => {
    it('shows empty label when no options provided', () => {
      const wrapper = mountComponent(TCheckboxGroup, {
        props: {
          modelValue: undefined,
          options: [],
          emptyLabel: 'No items available'
        }
      })

      expect(wrapper.text()).toContain('No items available')
    })
  })
})
