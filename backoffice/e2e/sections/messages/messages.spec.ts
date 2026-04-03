import { test, expect } from '@playwright/test'

test.describe('Messages', () => {
  test('M1 — navigation menu vers Messages', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-messages').click()
    await expect(page).toHaveURL(/\/messages/)
    await expect(page.getByTestId('messages-page')).toBeVisible()
  })

  test('M2 — action marquer tout lu (présence du bouton)', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.getByTestId('messages-page')).toBeVisible()
    await expect(page.getByTestId('mark-all-read-button')).toBeVisible()
  })
})
