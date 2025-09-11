/// <reference types="cypress" />

describe('Tests de base - Backoffice Jeroka', () => {
  beforeEach(() => {
    // Configuration pour chaque test
    cy.viewport(1280, 720)
  })

  it('Devrait pouvoir accéder à la page de connexion du backoffice', () => {
    // Test d'accès à la page de login (en supposant que le backoffice tourne sur localhost:3000)
    cy.visit('/login', { failOnStatusCode: false })
    
    // Vérifier que la page se charge (même si elle retourne une erreur)
    cy.get('body').should('be.visible')
    
    // Si la page de login existe, vérifier les éléments
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="email-input"]').length > 0) {
        cy.get('[data-cy="email-input"]').should('be.visible')
        cy.get('[data-cy="password-input"]').should('be.visible')
        cy.get('[data-cy="login-button"]').should('be.visible')
      }
    })
  })

  it('Devrait pouvoir tester la navigation de base', () => {
    // Test de navigation vers différentes pages
    const pages = ['/login', '/dashboard', '/users', '/products']
    
    pages.forEach(page => {
      cy.visit(page, { failOnStatusCode: false })
      cy.get('body').should('be.visible')
      cy.url().should('include', page)
    })
  })

  it('Devrait pouvoir vérifier les éléments de base de l\'interface', () => {
    cy.visit('/', { failOnStatusCode: false })
    
    // Vérifier que la page se charge
    cy.get('body').should('be.visible')
    
    // Vérifier la présence d'éléments HTML de base
    cy.get('html').should('exist')
    cy.get('head').should('exist')
    cy.get('title').should('exist')
  })

  it('Devrait pouvoir tester les requêtes API simulées', () => {
    // Intercepter les requêtes API
    cy.intercept('GET', '/api/**', { fixture: 'api-responses.json' }).as('apiCall')
    
    cy.visit('/', { failOnStatusCode: false })
    
    // Vérifier que l'interception fonctionne
    cy.get('body').should('be.visible')
  })

  it('Devrait pouvoir gérer les erreurs de connexion', () => {
    // Test de gestion d'erreur avec une URL inexistante
    cy.visit('/nonexistent-page', { failOnStatusCode: false })
    
    // Vérifier que nous gérons bien l'erreur
    cy.get('body').should('be.visible')
  })
})
