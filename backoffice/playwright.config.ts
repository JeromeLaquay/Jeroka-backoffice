import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'path'
import { loadE2eEnv } from './e2e/load-e2e-env'

const root = process.cwd()
loadE2eEnv(root)

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  globalSetup: resolve(root, 'e2e/global-setup.ts'),
  use: {
    baseURL,
    testIdAttribute: 'data-cy',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    storageState: resolve(root, 'e2e/.auth/user.json'),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
