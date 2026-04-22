import { test, expect, type Page } from '@playwright/test'

/**
 * Sections du menu (DashboardLayout) : data-cy `nav-*` + pathname attendu après clic.
 * Admin en dernier : ignoré si le lien n’est pas affiché (compte non admin).
 */
const SECTIONS: ReadonlyArray<{ testId: string; pathname: string; optional?: boolean }> = [
  { testId: 'nav-dashboard', pathname: '/' },
  { testId: 'nav-messages', pathname: '/messages' },
  { testId: 'nav-calendrier', pathname: '/calendrier' },
  { testId: 'nav-publications', pathname: '/publications' },
  { testId: 'nav-clients', pathname: '/clients' },
  { testId: 'nav-factures', pathname: '/factures' },
  { testId: 'nav-devis', pathname: '/devis' },
  { testId: 'nav-produits', pathname: '/produits' },
  { testId: 'nav-documents', pathname: '/documents' },
  { testId: 'nav-commandes', pathname: '/commandes' },
  { testId: 'nav-fournisseurs', pathname: '/fournisseurs' },
  { testId: 'nav-emails', pathname: '/emails' },
  { testId: 'nav-comptabilite', pathname: '/comptabilite' },
  { testId: 'nav-parametres', pathname: '/parametres' },
  { testId: 'nav-annonces', pathname: '/annonces' },
  { testId: 'nav-admin', pathname: '/admin', optional: true },
]

async function assertResteConnecte(page: Page) {
  await expect(page).not.toHaveURL(/\/login/)
  await expect(page.getByTestId('dashboard-layout')).toBeVisible()
}

test.describe('Navigation — toutes les sections (menu latéral)', () => {
  test('enchaîne chaque entrée du menu : URL correcte, layout visible, pas de login', async ({
    page,
  }) => {
    await page.goto('/')
    await assertResteConnecte(page)

    for (const { testId, pathname, optional } of SECTIONS) {
      const link = page.getByTestId(testId)
      if (optional && !(await link.isVisible())) {
        continue
      }
      await expect(link).toBeVisible()
      await link.click()
      await assertResteConnecte(page)
      await expect
        .poll(() => new URL(page.url()).pathname.replace(/\/$/, '') || '/')
        .toBe(pathname.replace(/\/$/, '') || '/')
    }
  })
})
