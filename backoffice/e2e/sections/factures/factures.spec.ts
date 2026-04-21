import { test, expect } from '@playwright/test'

test.describe('Factures', () => {
  test('F1 — navigation menu vers Factures', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-factures').click()
    await expect(page).toHaveURL(/\/factures$/)
    await expect(page.getByTestId('invoices-page')).toBeVisible()
  })

  test('F2 — lien créer facture', async ({ page }) => {
    await page.goto('/factures')
    await expect(page.getByTestId('invoices-page')).toBeVisible()
    await expect(page.getByTestId('create-invoice-link')).toBeVisible()
  })
})
