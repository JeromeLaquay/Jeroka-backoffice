import { test, expect } from '@playwright/test'

test.describe('Devis', () => {
  test('DV1 — navigation menu vers Devis', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-devis').click()
    await expect(page).toHaveURL(/\/devis$/)
    await expect(page.getByTestId('quotes-page')).toBeVisible()
  })

  test('DV2 — lien nouveau devis', async ({ page }) => {
    await page.goto('/devis')
    await expect(page.getByTestId('quotes-page')).toBeVisible()
    await expect(page.getByTestId('create-quote-link')).toBeVisible()
  })
})
