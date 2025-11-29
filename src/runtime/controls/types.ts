/**
 * Shared type definitions for component props.
 * These can be used by both components and demo pages.
 */

export const ButtonVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger', 'white', 'light', 'dark', 'text', 'ghost'] as const
export type ButtonVariant = typeof ButtonVariants[number]

export const ButtonSizes = ['small', 'normal', 'medium', 'large'] as const
export type ButtonSize = typeof ButtonSizes[number]

export const NotificationVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger', 'white', 'light', 'dark'] as const
export type NotificationVariant = typeof NotificationVariants[number]

export const TagVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger', 'light', 'dark', 'black', 'white'] as const
export type TagVariant = typeof TagVariants[number]

export const TagSizes = ['normal', 'medium', 'large'] as const
export type TagSize = typeof TagSizes[number]

export const SelectVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger'] as const
export type SelectVariant = typeof SelectVariants[number]

export const SelectSizes = ['small', 'normal', 'medium', 'large'] as const
export type SelectSize = typeof SelectSizes[number]

export const CheckboxVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger'] as const
export type CheckboxVariant = typeof CheckboxVariants[number]

export const CheckboxSizes = ['small', 'normal', 'medium', 'large'] as const
export type CheckboxSize = typeof CheckboxSizes[number]

export const RadioVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger'] as const
export type RadioVariant = typeof RadioVariants[number]

export const RadioSizes = ['small', 'normal', 'medium', 'large'] as const
export type RadioSize = typeof RadioSizes[number]

export const SwitchVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger', 'dark'] as const
export type SwitchVariant = typeof SwitchVariants[number]

export const SwitchSizes = ['small', 'medium', 'large'] as const
export type SwitchSize = typeof SwitchSizes[number]

export const InputVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger'] as const
export type InputVariant = typeof InputVariants[number]

export const InputSizes = ['small', 'normal', 'medium', 'large'] as const
export type InputSize = typeof InputSizes[number]

export const InputTypes = ['text', 'email', 'tel', 'password', 'url', 'search', 'number', 'date', 'time', 'datetime-local', 'month', 'week'] as const
export type InputType = typeof InputTypes[number]

export const TextareaVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger', 'white', 'light', 'dark'] as const
export type TextareaVariant = typeof TextareaVariants[number]

export const TextareaSizes = ['small', 'normal', 'medium', 'large'] as const
export type TextareaSize = typeof TextareaSizes[number]

export const SliderSizes = ['small', 'normal', 'medium', 'large'] as const
export type SliderSize = typeof SliderSizes[number]

export const SliderVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger'] as const
export type SliderVariant = typeof SliderVariants[number]

export const TabsSizes = ['small', 'normal', 'medium', 'large'] as const
export type TabsSize = typeof TabsSizes[number]

export const TabsPositions = ['left', 'centered', 'right'] as const
export type TabsPosition = typeof TabsPositions[number]

export const TabsTypes = ['default', 'boxed', 'toggle', 'toggle-rounded'] as const
export type TabsType = typeof TabsTypes[number]

export const DropdownTriggerVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger', 'white', 'light', 'dark'] as const
export type DropdownTriggerVariant = typeof DropdownTriggerVariants[number]

export const MsgVariants = ['primary', 'link', 'info', 'success', 'warning', 'danger', 'dark'] as const
export type MsgVariant = typeof MsgVariants[number]
