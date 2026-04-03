import { test, expect } from '@playwright/test'

test.describe('Fournisseurs', () => {
  test('FO1 — navigation menu vers Fournisseurs', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-fournisseurs').click()
    await expect(page).toHaveURL(/\/fournisseurs$/)
    await expect(page.getByTestId('suppliers-page')).toBeVisible()
  })

  test('FO2 — lien nouveau fournisseur', async ({ page }) => {
    await page.goto('/fournisseurs')
    await expect(page.getByTestId('suppliers-page')).toBeVisible()
    await expect(page.getByTestId('create-supplier-link')).toBeVisible()
  })
})
