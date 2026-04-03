import { test, expect } from '@playwright/test'

test.describe('Administration', () => {
  test('AD1 — accès Admin si le menu est visible', async ({ page }) => {
    await page.goto('/')
    const adminNav = page.getByTestId('nav-admin')
    if (!(await adminNav.isVisible())) {
      test.skip()
    }
    await adminNav.click()
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByTestId('admin-dashboard')).toBeVisible()
  })

  test('AD2 — liens rapides tableau de bord admin', async ({ page }) => {
    await page.goto('/admin')
    if (!new URL(page.url()).pathname.endsWith('/admin')) {
      test.skip()
    }
    await expect(page.getByTestId('admin-dashboard')).toBeVisible()
    await expect(page.getByTestId('manage-companies-button')).toBeVisible()
    await expect(page.getByTestId('manage-users-button')).toBeVisible()
  })
})
