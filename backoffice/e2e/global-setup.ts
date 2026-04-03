import { chromium, type FullConfig } from '@playwright/test'
import { mkdirSync, existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { loadE2eEnv } from './load-e2e-env'

const root = process.cwd()
loadE2eEnv(root)

const authFile = resolve(root, 'e2e/.auth/user.json')

export default async function globalSetup(_config: FullConfig) {
  const email = process.env.PLAYWRIGHT_EMAIL?.trim()
  const password = process.env.PLAYWRIGHT_PASSWORD?.trim()
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

  if (!email || !password) {
    throw new Error(
      'E2E: renseigner PLAYWRIGHT_EMAIL et PLAYWRIGHT_PASSWORD dans .env.e2e.local (non vides). ' +
        'Le global-setup s’exécute dans un processus séparé : les .env y sont rechargés via load-e2e-env.'
    )
  }

  mkdirSync(dirname(authFile), { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`, { waitUntil: 'load' })
  await page.locator('[data-cy="email-input"]').fill(email)
  await page.locator('[data-cy="password-input"]').fill(password)
  await page.locator('[data-cy="login-button"]').click()

  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 30_000,
  })

  await page.context().storageState({ path: authFile })
  await browser.close()

  if (!existsSync(authFile)) {
    throw new Error('E2E: échec de la création du fichier storageState.')
  }
}
