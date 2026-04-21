import { test, expect } from '@playwright/test'

test.describe('Emails', () => {
  test('E1 — navigation menu vers Emails', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('nav-emails').click()
    await expect(page).toHaveURL(/\/emails/)
    await expect(page.getByTestId('emails-page')).toBeVisible()
  })

  test('E2 — bouton synchroniser présent', async ({ page }) => {
    await page.goto('/emails')
    await expect(page.getByTestId('emails-page')).toBeVisible()
    await expect(page.getByTestId('emails-sync-button')).toBeVisible()
  })

  test('E3 — onglets Catégories / Expéditeurs / Emails', async ({ page }) => {
    await page.goto('/emails')
    await expect(page.getByTestId('emails-tab-categories')).toHaveAttribute('aria-selected', 'true')
    await page.getByTestId('emails-tab-senders').click()
    await expect(page.getByTestId('emails-tab-senders')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('heading', { name: "Expéditeurs d'Emails" })).toBeVisible()
    await page.getByTestId('emails-tab-emails').click()
    await expect(page.getByTestId('emails-tab-emails')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('heading', { name: 'Liste des Emails' })).toBeVisible()
  })

  test('E4 — modale nouvelle catégorie (ouvrir / fermer sans enregistrer)', async ({ page }) => {
    await page.goto('/emails')
    await page.getByTestId('emails-new-category-button').click()
    await expect(page.getByTestId('emails-category-modal')).toBeVisible()
    await page.getByTestId('emails-category-name-input').fill('E2E catégorie test')
    await page.getByTestId('emails-category-cancel').click()
    await expect(page.getByTestId('emails-category-modal')).toBeHidden()
  })

  test('E5 — modale synchronisation (options puis annuler)', async ({ page }) => {
    await page.goto('/emails')
    await page.getByTestId('emails-sync-button').click()
    await expect(page.getByTestId('emails-sync-modal')).toBeVisible()
    await expect(page.getByRole('heading', { name: /options de synchronisation/i })).toBeVisible()
    await page.getByLabel(/nombre spécifique d'emails/i).check()
    await expect(page.getByTestId('emails-sync-modal').locator('select.form-input').first()).toBeVisible()
    await page.getByTestId('emails-sync-cancel').click()
    await expect(page.getByTestId('emails-sync-modal')).toBeHidden()
  })

  test('E6 — statistiques visibles en tête de page', async ({ page }) => {
    await page.goto('/emails')
    await expect(page.getByText('Total Emails', { exact: true })).toBeVisible()
    await expect(page.getByText('Non Catégorisés', { exact: true })).toBeVisible()
  })
})
