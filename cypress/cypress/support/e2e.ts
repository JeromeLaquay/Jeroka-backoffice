// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configuration globale pour les tests
beforeEach(() => {
  // Intercepter les requêtes API pour éviter les appels réels en test
  cy.intercept('GET', '/api/**', { fixture: 'api-responses.json' }).as('apiCall')
  
  // Configuration des cookies et du localStorage
  cy.clearCookies()
  cy.clearLocalStorage()
})

// Gestion des erreurs non capturées
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ne pas faire échouer les tests sur les erreurs non capturées
  // qui ne sont pas liées à notre application
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  return true
})

// Configuration pour les rapports
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Commande personnalisée pour se connecter en tant qu'admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<Element>
      
      /**
       * Commande personnalisée pour se connecter en tant qu'utilisateur
       * @example cy.loginAsUser()
       */
      loginAsUser(): Chainable<Element>
      
      /**
       * Commande pour attendre qu'une page soit complètement chargée
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<Element>
      
      /**
       * Commande pour vérifier qu'un élément est visible et interactif
       * @example cy.checkElementInteractable('button')
       */
      checkElementInteractable(selector: string): Chainable<Element>
    }
  }
}
