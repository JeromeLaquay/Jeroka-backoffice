import { test, expect } from '@playwright/test'

test.describe('Annonces', () => {
  test('AN1 — navigation menu vers Annonces', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-annonces').click()
    await expect(page).toHaveURL(/\/annonces/)
    await expect(page.getByTestId('announcements-page')).toBeVisible()
  })

  test('AN2 — bouton nouvelle annonce', async ({ page }) => {
    await page.goto('/annonces')
    await expect(page.getByTestId('announcements-page')).toBeVisible()
    await expect(page.getByTestId('create-announcement-button')).toBeVisible()
  })
})
