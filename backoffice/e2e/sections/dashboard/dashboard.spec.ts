import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('D1 — accès via le menu latéral', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('dashboard-layout')).toBeVisible()
    await page.getByTestId('nav-dashboard').click()
    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
  })

  test('D2 — aperçu tableau de bord (titre de bienvenue)', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('dashboard-page')).toBeVisible()
    await expect(
      page.getByTestId('dashboard-page').getByRole('heading', { name: /Bonjour/i })
    ).toBeVisible()
  })

  test('D3 — zone statistiques ou graphiques (aperçu activité)', async ({ page }) => {
    await page.goto('/')
    const stats = page.getByTestId('dashboard-stats')
    const revenueCard = page.getByText(/chiffre d'affaires/i).first()
    if (await stats.count()) {
      await expect(stats).toBeVisible()
    } else {
      await expect(revenueCard).toBeVisible()
    }
  })
})
