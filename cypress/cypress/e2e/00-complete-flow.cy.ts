/// <reference types="cypress" />

describe('Tests de flux complet - Backoffice Jeroka', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('Devrait permettre un flux complet : inscription → connexion → navigation → gestion clients → gestion messages', () => {
    // 1. Test d'inscription
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Compte créé avec succès',
        user: {
          id: 1,
          email: 'test@jeroka.com',
          firstName: 'Test',
          lastName: 'User'
        }
      }
    }).as('registerRequest')
    
    cy.visit('/register', { failOnStatusCode: false })
    cy.get('[data-cy="register-page"]').should('be.visible')
    
    cy.get('[data-cy="first-name-input"]').type('Test')
    cy.get('[data-cy="last-name-input"]').type('User')
    cy.get('[data-cy="register-email-input"]').type('test@jeroka.com')
    cy.get('[data-cy="register-password-input"]').type('Password123')
    cy.get('[data-cy="confirm-password-input"]').type('Password123')
    
    // Accepter les conditions si checkbox présente
    cy.get('body').then(($body) => {
      if ($body.find('input[type="checkbox"]').length > 0) {
        cy.get('input[type="checkbox"]').check()
      }
    })
    
    cy.get('[data-cy="register-button"]').click()
    cy.wait('@registerRequest')
    
    // 2. Test de connexion
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'test@jeroka.com',
          name: 'Test User',
          role: 'admin'
        }
      }
    }).as('loginRequest')
    
    cy.visit('/login', { failOnStatusCode: false })
    cy.get('[data-cy="login-page"]').should('be.visible')
    
    cy.get('[data-cy="email-input"]').type('test@jeroka.com')
    cy.get('[data-cy="password-input"]').type('Password123')
    cy.get('[data-cy="login-button"]').click()
    cy.wait('@loginRequest')
    
    // Vérifier la redirection vers le dashboard
    cy.url().should('include', '/')
    cy.get('[data-cy="dashboard-layout"]').should('be.visible')
    
    // 3. Test de navigation
    cy.get('[data-cy="nav-clients"]').click()
    cy.url().should('include', '/clients')
    cy.get('[data-cy="clients-page"]').should('be.visible')
    
    cy.get('[data-cy="nav-messages"]').click()
    cy.url().should('include', '/messages')
    cy.get('[data-cy="messages-page"]').should('be.visible')
    
    // 4. Test de gestion des clients
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
    }).as('getClients')
    
    cy.intercept('GET', '/api/v1/clients/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          total: 0,
          active: 0,
          prospects: 0,
          inactive: 0,
          companies: 0,
          individuals: 0
        }
      }
    }).as('getClientStats')
    
    cy.get('[data-cy="nav-clients"]').click()
    cy.wait('@getClients')
    cy.wait('@getClientStats')
    
    // Tester la recherche
    cy.get('[data-cy="client-search-input"]').type('test')
    
    // 5. Test de gestion des messages
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      }
    }).as('getMessages')
    
    cy.intercept('GET', '/api/v1/messages/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          total: 0,
          new: 0,
          read: 0,
          replied: 0,
          archived: 0
        }
      }
    }).as('getMessageStats')
    
    cy.get('[data-cy="nav-messages"]').click()
    cy.wait('@getMessages')
    cy.wait('@getMessageStats')
    
    // 6. Test de déconnexion
    cy.get('button').contains('Test User').click()
    cy.get('[data-cy="logout-button"]').click()
    
    // Vérifier la redirection vers login
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
  })

  it('Devrait gérer les erreurs de manière gracieuse', () => {
    // Test avec des erreurs API
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 500,
      body: { success: false, error: 'Erreur serveur' }
    }).as('loginError')
    
    cy.visit('/login', { failOnStatusCode: false })
    cy.get('[data-cy="email-input"]').type('test@jeroka.com')
    cy.get('[data-cy="password-input"]').type('password123')
    cy.get('[data-cy="login-button"]').click()
    
    cy.wait('@loginError')
    cy.get('[data-cy="error-message"]').should('be.visible')
  })

  it('Devrait maintenir l\'état de session entre les pages', () => {
    // Simuler une session active
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-token')
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@jeroka.com',
        name: 'Test User',
        role: 'admin'
      }))
    })
    
    // Intercepter les requêtes API
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    }).as('getClients')
    
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: { success: true, data: { messages: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } }
    }).as('getMessages')
    
    // Naviguer entre les pages
    cy.visit('/clients', { failOnStatusCode: false })
    cy.get('[data-cy="clients-page"]').should('be.visible')
    
    cy.visit('/messages', { failOnStatusCode: false })
    cy.get('[data-cy="messages-page"]').should('be.visible')
    
    cy.visit('/', { failOnStatusCode: false })
    cy.get('[data-cy="dashboard-layout"]').should('be.visible')
  })
})
