import { test, expect } from '@playwright/test'

test.describe('Comptabilité', () => {
  test('CP1 — navigation menu vers Comptabilité', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-comptabilite').click()
    await expect(page).toHaveURL(/\/comptabilite$/)
    await expect(page.getByTestId('accounting-page')).toBeVisible()
  })

  test('CP2 — accès liste Transactions via lien', async ({ page }) => {
    await page.goto('/comptabilite')
    await expect(page.getByTestId('accounting-page')).toBeVisible()
    await page.getByTestId('accounting-transactions-link').click()
    await expect(page).toHaveURL(/\/comptabilite\/transactions/)
    await expect(page.getByTestId('transactions-page')).toBeVisible()
  })

  test('CP3 — page transactions : contenu principal chargé', async ({ page }) => {
    await page.goto('/comptabilite/transactions')
    await expect(page.getByTestId('transactions-page')).toBeVisible()
    await expect(
      page.getByTestId('transactions-page').getByRole('heading', { level: 1 })
    ).toBeVisible()
  })
})
