import { test, expect } from '@playwright/test'

test.describe('Produits', () => {
  test('PR1 — navigation menu vers Produits', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-produits').click()
    await expect(page).toHaveURL(/\/produits$/)
    await expect(page.getByTestId('products-page')).toBeVisible()
  })

  test('PR2 — bouton nouveau produit', async ({ page }) => {
    await page.goto('/produits')
    await expect(page.getByTestId('products-page')).toBeVisible()
    await expect(page.getByTestId('create-product-button')).toBeVisible()
  })
})
