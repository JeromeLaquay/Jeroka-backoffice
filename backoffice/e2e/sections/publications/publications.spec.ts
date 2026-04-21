import { test, expect } from '@playwright/test'

test.describe('Publications', () => {
  test('P1 — navigation menu vers Publications', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-publications').click()
    await expect(page).toHaveURL(/\/publications/)
    await expect(page.getByTestId('publications-page')).toBeVisible()
  })

  test('P2 — bouton créer publication', async ({ page }) => {
    await page.goto('/publications')
    await expect(page.getByTestId('publications-page')).toBeVisible()
    await expect(page.getByTestId('create-publication-button')).toBeVisible()
  })

  test('P3 — filtres et recherche présents', async ({ page }) => {
    await page.goto('/publications')
    await expect(page.getByTestId('publication-search-input')).toBeVisible()
    await expect(page.getByTestId('status-filter')).toBeVisible()
    await expect(page.getByTestId('platform-filter')).toBeVisible()
    await expect(page.getByTestId('category-filter')).toBeVisible()
    await page.getByTestId('publication-search-input').fill('__e2e_aucun_resultat__')
    await expect(
      page.getByRole('heading', { name: /aucune publication trouvée/i })
    ).toBeVisible()
    await expect(page.getByTestId('create-publication-empty-button')).toBeVisible()
  })
})
