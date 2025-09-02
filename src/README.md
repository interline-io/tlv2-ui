The /src/lib and /src/config directories must be "pure" typescript and MUST NOT reference nuxt runtime.

The /src/runtime/auth directory is somewhat tightly coupled with the nuxt runtime and may use '#imports'

The /src/runtime/plugins and /src/runtime/composables directories MUST be kept as minimal as possible. They should limit themselves to binding lib code to the nuxt runtime.

Absolutely no code should import from /src/runtime/plugins. That causes pain quickly.
