import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import vue from '@vitejs/plugin-vue'

const _dirname = dirname(fileURLToPath(import.meta.url))
const alias = [
  { find: '~', replacement: _dirname },
]

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json'],
      reportsDirectory: './coverage',
    },
    projects: [
      {
        plugins: [vue()],
        resolve: { alias },
        test: {
          name: 'node',
          include: [
            'app/**/*.{test,spec}.{js,ts}',
            'src/**/*.{test,spec}.ts',
            'test/node/**/*.{test,spec}.ts',
          ],
          exclude: [
            '**/controls/**/*.{test,spec}.ts',
          ],
          environment: 'node',
        },
      },
      {
        plugins: [vue()],
        resolve: { alias },
        test: {
          name: 'controls',
          include: [
            'src/runtime/controls/**/*.{test,spec}.ts',
          ],
          environment: 'jsdom',
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'e2e',
          include: [
            'test/e2e/**/*.{test,spec}.ts',
          ],
          environment: 'node',
          setupFiles: ['./test/e2e/setup.ts'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'browser',
          include: ['test/browser/**/*.{test,spec}.ts'],
          environment: 'node',
          setupFiles: ['./test/browser/setup.ts'],
        },
      },
    ],
  },
})
