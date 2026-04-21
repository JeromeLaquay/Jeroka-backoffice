import { test, expect } from '@playwright/test'

test.describe('Clients', () => {
  test('CL1 — navigation menu vers Clients', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-clients').click()
    await expect(page).toHaveURL(/\/clients$/)
    await expect(page.getByTestId('clients-page')).toBeVisible()
  })

  test('CL2 — bouton nouveau client', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('clients-page')).toBeVisible()
    await expect(page.getByTestId('create-client-button')).toBeVisible()
  })

  test('CL3 — champ de recherche et saisie', async ({ page }) => {
    await page.goto('/clients')
    const search = page.getByTestId('client-search-input')
    await expect(search).toBeVisible()
    await search.fill('Test recherche E2E')
    await expect(search).toHaveValue('Test recherche E2E')
  })
})
