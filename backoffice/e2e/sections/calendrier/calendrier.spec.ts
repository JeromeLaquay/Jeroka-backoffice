import { test, expect } from '@playwright/test'

test.describe('Calendrier', () => {
  test('C1 — navigation menu vers Calendrier', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-calendrier').click()
    await expect(page).toHaveURL(/\/calendrier/)
    await expect(page.getByTestId('calendar-page')).toBeVisible()
  })

  test('C2 — titre de la page calendrier', async ({ page }) => {
    await page.goto('/calendrier')
    await expect(page.getByTestId('calendar-page')).toBeVisible()
    const zone = page.getByTestId('calendar-page')
    await expect(
      zone.getByRole('heading', { level: 1, name: /Gestion du calendrier/i })
    ).toBeVisible()
  })
})
