import { test, expect } from '@playwright/test'

test.describe('Documents', () => {
  test('DO1 — navigation menu vers Documents', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-documents').click()
    await expect(page).toHaveURL(/\/documents/)
    await expect(page.getByTestId('documents-page')).toBeVisible()
  })

  test('DO2 — rafraîchissement arborescence', async ({ page }) => {
    await page.goto('/documents')
    await expect(page.getByTestId('documents-page')).toBeVisible()
    await expect(page.getByTestId('documents-refresh-button')).toBeVisible()
  })

  test('DO3 — clic sur Rafraîchir (sans erreur bloquante)', async ({ page }) => {
    await page.goto('/documents')
    await page.getByTestId('documents-refresh-button').click()
    await expect(page.getByTestId('documents-page')).toBeVisible()
    await expect(page.getByTestId('documents-refresh-button')).toBeEnabled({ timeout: 30_000 })
  })
})
