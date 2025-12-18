import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { expect } from 'vitest'

/**
 * Helper utilities for testing t-* components
 */

/**
 * Mount a component with common test props and configuration
 */
export function mountComponent (
  component: any,
  options: Record<string, any> = {}
): VueWrapper {
  return mount(component, {
    global: {
      stubs: {
        // Stub teleport for testing modals, tooltips, etc.
        Teleport: true
      }
    },
    ...options
  })
}

/**
 * Generate test props for different component variants
 */
export const variantProps = () => [
  'primary',
  'info',
  'success',
  'warning',
  'danger',
  'light',
  'dark'
]

/**
 * Generate test props for different component sizes
 */
export const sizeProps = () => [
  'small',
  'normal',
  'medium',
  'large'
]

/**
 * Test if component properly handles v-model binding
 */
export async function testVModel (
  wrapper: VueWrapper,
  inputSelector: string,
  testValue: any
): Promise<void> {
  const input = wrapper.find(inputSelector)

  // Set value via input
  await input.setValue(testValue)
  await wrapper.vm.$nextTick()

  // Check if update:modelValue event was emitted
  expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([testValue])
}

/**
 * Test if component properly emits events
 */
export async function testEvent (
  wrapper: VueWrapper,
  eventTrigger: () => Promise<void>,
  eventName: string,
  expectedPayload?: any
): Promise<void> {
  await eventTrigger()
  await wrapper.vm.$nextTick()

  expect(wrapper.emitted(eventName)).toBeTruthy()
  if (expectedPayload !== undefined) {
    expect(wrapper.emitted(eventName)?.[0]).toEqual([expectedPayload])
  }
}

/**
 * Test if component properly handles disabled state
 */
export function testDisabledState (
  wrapper: VueWrapper,
  elementSelector: string = 'button,input,select,textarea'
): void {
  const element = wrapper.find(elementSelector)
  expect(element.attributes('disabled')).toBeDefined()
  const hasDisabledClass = element.classes().includes('is-disabled')
  const hasDisabledProp = (element.element as HTMLInputElement).disabled
  expect(hasDisabledClass || hasDisabledProp).toBe(true)
}

/**
 * Test if component applies correct Bulma classes
 */
export function testBulmaClasses (
  wrapper: VueWrapper | ReturnType<VueWrapper['find']>,
  expectedClasses: string[]
): void {
  const classes = wrapper.classes()
  expectedClasses.forEach((className) => {
    expect(classes).toContain(className)
  })
}

/**
 * Test if component properly handles slot content
 */
export function testSlotContent (
  wrapper: VueWrapper,
  slotContent: string
): void {
  expect(wrapper.text()).toContain(slotContent)
}

/**
 * Test if component is SSR-safe (no window/document access on mount)
 */
export function testSSRSafe (component: any, props: Record<string, any> = {}): void {
  // Mock SSR environment
  const originalWindow = global.window
  const originalDocument = global.document

  // @ts-expect-error - Testing SSR environment
  delete global.window
  // @ts-expect-error - Testing SSR environment
  delete global.document

  expect(() => {
    mountComponent(component, { props })
  }).not.toThrow()

  // Restore
  global.window = originalWindow
  global.document = originalDocument
}

/**
 * Wait for async updates to complete
 */
export async function flushPromises (): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Test if component handles null/undefined props gracefully
 */
export function testNullHandling (component: any, propName: string): void {
  expect(() => {
    mountComponent(component, {
      props: { [propName]: null }
    })
  }).not.toThrow()

  expect(() => {
    mountComponent(component, {
      props: { [propName]: undefined }
    })
  }).not.toThrow()
}

/**
 * Create mock data for table testing
 */
export function createMockTableData (count: number = 5): Array<Record<string, any>> {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    status: i % 2 === 0 ? 'Active' : 'Inactive',
    nested: {
      field: `Nested ${i + 1}`
    }
  }))
}

/**
 * Simulate keyboard event
 */
export async function triggerKeyboard (
  wrapper: VueWrapper,
  key: string,
  elementSelector?: string
): Promise<void> {
  const element = elementSelector ? wrapper.find(elementSelector) : wrapper
  await element.trigger('keydown', { key })
  await wrapper.vm.$nextTick()
}

/**
 * Test accessibility attributes
 */
export function testA11y (
  wrapper: VueWrapper,
  attributes: Record<string, string>
): void {
  Object.entries(attributes).forEach(([attr, value]) => {
    expect(wrapper.attributes(attr)).toBe(value)
  })
}
