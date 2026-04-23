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

  test('C3 — génération de créneaux via le modal', async ({ page }) => {
    test.setTimeout(90_000)
    await page.goto('/calendrier')
    await expect(page.getByTestId('calendar-page')).toBeVisible()

    const demain = new Date()
    demain.setDate(demain.getDate() + 1)
    const y = demain.getFullYear()
    const m = String(demain.getMonth() + 1).padStart(2, '0')
    const d = String(demain.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    await page.getByTestId('calendar-open-slots-modal').click()
    await expect(page.getByTestId('calendar-slots-modal')).toBeVisible()

    await page.getByTestId('calendar-slot-date').fill(dateStr)
    await page.getByTestId('calendar-slot-start').fill('10:00')
    await page.getByTestId('calendar-slot-end').fill('11:00')
    await page.getByTestId('calendar-slot-duration').selectOption('30')

    await page.getByTestId('calendar-slots-submit').click()
    await expect(page.getByTestId('calendar-slots-modal')).toBeHidden({ timeout: 45_000 })

    await expect(page.getByTestId('calendar-page').getByText('Créneau disponible').first()).toBeVisible({
      timeout: 15_000,
    })
  })
})
