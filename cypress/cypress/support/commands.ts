/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Commande personnalisée pour se connecter en tant qu'administrateur
 */
Cypress.Commands.add('loginAsAdmin', () => {
  const adminEmail = Cypress.env('ADMIN_EMAIL') || 'admin@jeroka.com'
  const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'adminpassword123'
  
  cy.session('admin-session', () => {
    cy.visit('/login')
    cy.get('[data-cy="email-input"]').type(adminEmail)
    cy.get('[data-cy="password-input"]').type(adminPassword)
    cy.get('[data-cy="login-button"]').click()
    cy.url().should('include', '/dashboard')
  })
  
  cy.visit('/dashboard')
})

/**
 * Commande personnalisée pour se connecter en tant qu'utilisateur standard
 */
Cypress.Commands.add('loginAsUser', () => {
  const userEmail = Cypress.env('TEST_USER_EMAIL') || 'test@jeroka.com'
  const userPassword = Cypress.env('TEST_USER_PASSWORD') || 'testpassword123'
  
  cy.session('user-session', () => {
    cy.visit('/login')
    cy.get('[data-cy="email-input"]').type(userEmail)
    cy.get('[data-cy="password-input"]').type(userPassword)
    cy.get('[data-cy="login-button"]').click()
    cy.url().should('include', '/dashboard')
  })
  
  cy.visit('/dashboard')
})

/**
 * Commande pour attendre qu'une page soit complètement chargée
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.get('[data-cy="loading"]').should('not.exist')
  cy.get('[data-cy="error"]').should('not.exist')
})

/**
 * Commande pour vérifier qu'un élément est visible et interactif
 */
Cypress.Commands.add('checkElementInteractable', (selector: string) => {
  cy.get(selector).should('be.visible')
  cy.get(selector).should('not.be.disabled')
  cy.get(selector).should('not.have.attr', 'aria-disabled', 'true')
})

/**
 * Commande pour attendre qu'une requête API soit terminée
 */
Cypress.Commands.add('waitForApiCall', (alias: string) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204])
  })
})

/**
 * Commande pour vérifier les notifications
 */
Cypress.Commands.add('checkNotification', (type: 'success' | 'error' | 'warning' | 'info', message?: string) => {
  cy.get(`[data-cy="notification-${type}"]`).should('be.visible')
  if (message) {
    cy.get(`[data-cy="notification-${type}"]`).should('contain', message)
  }
})

/**
 * Commande pour remplir un formulaire de manière sécurisée
 */
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-cy="${field}"]`).clear().type(value)
  })
})

/**
 * Commande pour vérifier la navigation
 */
Cypress.Commands.add('checkNavigation', (expectedUrl: string) => {
  cy.url().should('include', expectedUrl)
  cy.get('body').should('be.visible')
})

// Déclaration des types pour TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<Element>
      loginAsUser(): Chainable<Element>
      waitForPageLoad(): Chainable<Element>
      checkElementInteractable(selector: string): Chainable<Element>
      waitForApiCall(alias: string): Chainable<Element>
      checkNotification(type: 'success' | 'error' | 'warning' | 'info', message?: string): Chainable<Element>
      fillForm(formData: Record<string, string>): Chainable<Element>
      checkNavigation(expectedUrl: string): Chainable<Element>
    }
  }
}
