/**
 * Shared type definitions for component props.
 * These can be used by both components and demo pages.
 */

// Core variants and sizes that most components support
export const CoreVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger'] as const
export type CoreVariant = typeof CoreVariants[number]

export const CoreSizes = ['small', 'normal', 'medium', 'large'] as const
export type CoreSize = typeof CoreSizes[number]

// Button extends core variants with additional options
export const ButtonVariants = [...CoreVariants, 'white', 'light', 'dark', 'text', 'ghost'] as const
export type ButtonVariant = typeof ButtonVariants[number]

export const ButtonSizes = CoreSizes
export type ButtonSize = typeof ButtonSizes[number]

// Notification extends core variants
export const NotificationVariants = [...CoreVariants, 'white', 'light', 'dark'] as const
export type NotificationVariant = typeof NotificationVariants[number]

// Tag extends core variants
export const TagVariants = [...CoreVariants, 'light', 'dark', 'black', 'white'] as const
export type TagVariant = typeof TagVariants[number]

export const TagSizes = CoreSizes
export type TagSize = typeof TagSizes[number]

// Select uses core variants
export const SelectVariants = CoreVariants
export type SelectVariant = typeof SelectVariants[number]

export const SelectSizes = CoreSizes
export type SelectSize = typeof SelectSizes[number]

// Checkbox uses core variants
export const CheckboxVariants = CoreVariants
export type CheckboxVariant = typeof CheckboxVariants[number]

export const CheckboxSizes = CoreSizes
export type CheckboxSize = typeof CheckboxSizes[number]

// Radio uses core variants
export const RadioVariants = CoreVariants
export type RadioVariant = typeof RadioVariants[number]

export const RadioSizes = CoreSizes
export type RadioSize = typeof RadioSizes[number]

// Switch extends core variants with dark
export const SwitchVariants = [...CoreVariants, 'dark'] as const
export type SwitchVariant = typeof SwitchVariants[number]

export const SwitchSizes = ['small', 'medium', 'large'] as const
export type SwitchSize = typeof SwitchSizes[number]

// Input uses core variants
export const InputVariants = CoreVariants
export type InputVariant = typeof InputVariants[number]

export const InputSizes = CoreSizes
export type InputSize = typeof InputSizes[number]

export const InputTypes = ['text', 'email', 'tel', 'password', 'url', 'search', 'number', 'date', 'time', 'datetime-local', 'month', 'week'] as const
export type InputType = typeof InputTypes[number]

// Textarea extends core variants
export const TextareaVariants = [...CoreVariants, 'white', 'light', 'dark'] as const
export type TextareaVariant = typeof TextareaVariants[number]

export const TextareaSizes = CoreSizes
export type TextareaSize = typeof TextareaSizes[number]

// Slider uses core variants and sizes
export const SliderSizes = CoreSizes
export type SliderSize = typeof SliderSizes[number]

export const SliderVariants = CoreVariants
export type SliderVariant = typeof SliderVariants[number]

// Tabs uses core sizes
export const TabsSizes = CoreSizes
export type TabsSize = typeof TabsSizes[number]

export const TabsPositions = ['left', 'centered', 'right'] as const
export type TabsPosition = typeof TabsPositions[number]

export const TabsTypes = ['default', 'boxed', 'toggle', 'toggle-rounded'] as const
export type TabsType = typeof TabsTypes[number]

// Dropdown extends core variants
export const DropdownTriggerVariants = [...CoreVariants, 'white', 'light', 'dark'] as const
export type DropdownTriggerVariant = typeof DropdownTriggerVariants[number]

// Msg extends core variants with dark
export const MsgVariants = [...CoreVariants, 'dark'] as const
export type MsgVariant = typeof MsgVariants[number]

// Pagination uses core sizes and positions
export const PaginationSizes = CoreSizes
export type PaginationSize = typeof PaginationSizes[number]

export const PaginationPositions = ['left', 'centered', 'right'] as const
export type PaginationPosition = typeof PaginationPositions[number]

// Taginput uses tag variants for styling and input sizes
export const TaginputVariants = TagVariants
export type TaginputVariant = typeof TaginputVariants[number]

export const TaginputSizes = CoreSizes
export type TaginputSize = typeof TaginputSizes[number]

/**
 * Option type for taginput items.
 * @template T - The type of the value (string or number)
 */
export interface TagOption<T extends string | number = string> {
  /** Unique value identifier */
  value: T
  /** Display label */
  label: string
  /** Allow additional properties */
  [key: string]: unknown
}
