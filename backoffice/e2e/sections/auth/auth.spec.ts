import { test, expect } from '@playwright/test'

test.describe('Authentification (sans session enregistrée)', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('A1 — page de connexion affichée', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('login-page')).toBeVisible()
    await expect(page.getByTestId('email-input')).toBeVisible()
    await expect(page.getByTestId('login-button')).toBeVisible()
  })

  test('A2 — lien vers la page inscription', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /créer un compte/i }).click()
    await expect(page).toHaveURL(/register/)
    await expect(page.getByTestId('register-page')).toBeVisible()
  })

  test('A3 — page inscription affichée', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByTestId('register-page')).toBeVisible()
    await expect(page.getByTestId('register-button')).toBeVisible()
  })

  test('A4 — identifiants invalides : message d’erreur, reste sur la connexion', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('e2e-invalide@example.invalid')
    await page.getByTestId('password-input').fill('motdepasse_invalide_12345')
    await page.getByTestId('login-button').click()
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-page')).toBeVisible()
  })
})
