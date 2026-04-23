import { test, expect, type Page } from '@playwright/test'

async function lireCompteurStat(page: Page, nom: string): Promise<number | null> {
  const card = page.getByTestId(`stat-${nom}`)
  if (!(await card.isVisible().catch(() => false))) return null
  const texte = await card.locator('dd').first().textContent()
  const n = Number(String(texte).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

async function creerClientE2E(
  page: Page,
  prenom: string,
  nom: string,
  email: string,
) {
  await page.goto('/clients/create')
  await expect(page.getByTestId('create-client-page')).toBeVisible()
  await page.getByTestId('client-firstname-input').fill(prenom)
  await page.getByTestId('client-lastname-input').fill(nom)
  await page.getByTestId('client-email-input').fill(email)
  await page.getByTestId('submit-create-client').click()
  await expect(page).toHaveURL(/\/clients$/, { timeout: 45_000 })
}

async function creerFacturePourClient(page: Page, marqueurEmail: string) {
  await page.goto('/factures/create')
  await page.getByTestId('client-combobox-input').click()
  await page.getByTestId('client-combobox-input').fill(marqueurEmail)
  const ligneClient = page.locator('li').filter({ hasText: marqueurEmail }).first()
  await expect(ligneClient).toBeVisible({ timeout: 20_000 })
  await ligneClient.click()

  await page.getByTestId('invoice-add-line-button').click()
  const form = page.getByTestId('invoice-form')
  const ligne = form.getByTestId('invoice-item-row-0')
  await expect(ligne).toBeVisible({ timeout: 15_000 })
  await ligne.locator('input[placeholder*="Description"]').fill('Ligne test dashboard E2E')
  const numeriques = ligne.locator('input[type="number"]')
  await numeriques.nth(0).fill('1')
  await numeriques.nth(1).fill('100')

  await expect(page.getByTestId('submit-create-invoice')).toBeEnabled({ timeout: 15_000 })
  await page.getByTestId('submit-create-invoice').click()
  await expect(page).toHaveURL(/\/factures$/, { timeout: 45_000 })
}

test.describe('Dashboard — données créées via l’UI', () => {
  test.setTimeout(120_000)

  test('création client + facture met à jour les compteurs', async ({ page }) => {
    const id = `${Date.now()}`
    const prenom = `E2E${id}`
    const nom = 'DashboardData'
    const email = `e2e.dashboard.${id}@example.test`

    await page.goto('/')
    await expect(page.getByTestId('dashboard-layout')).toBeVisible()
    await expect(page.getByTestId('dashboard-stats')).toBeVisible({ timeout: 30_000 })

    const clientsAvant = await lireCompteurStat(page, 'Clients')
    const facturesAvant = await lireCompteurStat(page, 'Factures')

    await creerClientE2E(page, prenom, nom, email)
    await creerFacturePourClient(page, email)

    await page.goto('/')
    await expect(page.getByTestId('dashboard-stats')).toBeVisible({ timeout: 30_000 })

    const clientsApres = await lireCompteurStat(page, 'Clients')
    const facturesApres = await lireCompteurStat(page, 'Factures')

    expect(clientsApres).not.toBeNull()
    expect(facturesApres).not.toBeNull()
    if (clientsAvant != null && clientsApres != null) {
      expect(clientsApres).toBeGreaterThanOrEqual(clientsAvant + 1)
    }
    if (facturesAvant != null && facturesApres != null) {
      expect(facturesApres).toBeGreaterThanOrEqual(facturesAvant + 1)
    }

    await expect(
      page.getByTestId('dashboard-page').getByText(`${prenom} ${nom}`).first(),
    ).toBeVisible()
  })
})
