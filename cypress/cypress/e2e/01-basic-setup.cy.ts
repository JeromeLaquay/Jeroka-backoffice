/// <reference types="cypress" />

describe('Tests de base - Validation du setup Cypress', () => {
  it('Devrait pouvoir visiter le backoffice', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
    cy.title().should('contain', 'Jeroka Backoffice')
  })

  it('Devrait pouvoir vérifier les éléments de base du backoffice', () => {
    cy.visit('/')
    cy.get('#app').should('be.visible')
    cy.get('body').should('have.class', 'font-sans')
  })

  it('Devrait pouvoir gérer les erreurs et les timeouts', () => {
    cy.visit('/')
    cy.get('body', { timeout: 10000 }).should('be.visible')
  })
})
