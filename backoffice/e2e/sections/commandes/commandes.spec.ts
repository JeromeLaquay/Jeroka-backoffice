import { test, expect } from '@playwright/test'

test.describe('Commandes', () => {
  test('CO1 — navigation menu vers Commandes', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-commandes').click()
    await expect(page).toHaveURL(/\/commandes$/)
    await expect(page.getByTestId('orders-page')).toBeVisible()
  })

  test('CO2 — lien nouvelle commande', async ({ page }) => {
    await page.goto('/commandes')
    await expect(page.getByTestId('orders-page')).toBeVisible()
    await expect(page.getByTestId('create-order-link')).toBeVisible()
  })
})
