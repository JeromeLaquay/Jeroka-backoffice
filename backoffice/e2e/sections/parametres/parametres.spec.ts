import { test, expect } from '@playwright/test'

test.describe('Paramètres', () => {
  test('PA1 — navigation menu vers Paramètres', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-parametres').click()
    await expect(page).toHaveURL(/\/parametres/)
    await expect(page.getByTestId('settings-page')).toBeVisible()
  })

  test('PA2 — onglet Entreprise', async ({ page }) => {
    await page.goto('/parametres')
    await expect(page.getByTestId('settings-page')).toBeVisible()
    await page.getByTestId('settings-tab-company').click()
    await expect(page.getByTestId('settings-page').getByRole('heading', { name: /^paramètres$/i })).toBeVisible()
  })

  test('PA3 — navigation plusieurs onglets (Profil → Sécurité → Intégrations)', async ({ page }) => {
    await page.goto('/parametres')
    await expect(page.getByTestId('settings-tab-profile')).toBeVisible()
    await page.getByTestId('settings-tab-security').click()
    await expect(page.getByTestId('settings-tab-security')).toBeVisible()
    await page.getByTestId('settings-tab-integrations').click()
    await expect(page.getByTestId('settings-tab-integrations')).toBeVisible()
  })
})
