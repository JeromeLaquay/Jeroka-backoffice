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

  test('FO3 — création fournisseur entreprise', async ({ page }) => {
    test.setTimeout(90_000)
    const id = `${Date.now()}`
    const email = `e2e.fournisseur.${id}@example.test`

    await page.goto('/fournisseurs/create')
    await expect(page.getByTestId('create-supplier-page')).toBeVisible()

    await page.getByTestId('supplier-company-name-input').fill(`SARL Test E2E ${id}`)
    await page.getByTestId('supplier-firstname-input').fill('Camille')
    await page.getByTestId('supplier-lastname-input').fill('Fournisseur')
    await page.getByTestId('supplier-email-input').fill(email)
    await page.getByTestId('submit-create-supplier').click()

    await expect(page).toHaveURL(/\/fournisseurs$/, { timeout: 45_000 })
    await expect(page.getByTestId('suppliers-page')).toBeVisible()
    await expect(page.getByText(`SARL Test E2E ${id}`).first()).toBeVisible({ timeout: 15_000 })
  })
})
