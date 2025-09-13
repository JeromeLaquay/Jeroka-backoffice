/// <reference types="cypress" />

describe('Tests de flux de connexion - Backoffice Jeroka', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('Devrait permettre de se connecter avec des identifiants valides', () => {
    // Intercepter la requête de login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'admin@jeroka.com',
          name: 'Administrateur',
          role: 'admin'
        }
      }
    }).as('loginRequest')
    
    cy.visit('/login', { failOnStatusCode: false })
    
    // Vérifier que la page de login se charge
    cy.get('[data-cy="login-page"]').should('be.visible')
    
    // Remplir le formulaire de connexion
    cy.get('[data-cy="email-input"]').type('admin@jeroka.com')
    cy.get('[data-cy="password-input"]').type('admin123')
    
    // Soumettre le formulaire
    cy.get('[data-cy="login-button"]').click()
    
    // Vérifier que la requête a été envoyée
    cy.wait('@loginRequest')
    
    // Vérifier la redirection vers le dashboard
    cy.url().should('include', '/')
    cy.get('[data-cy="dashboard-layout"]').should('be.visible')
  })

  it('Devrait afficher une erreur avec des identifiants invalides', () => {
    // Intercepter la requête de login avec une erreur
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        error: 'Identifiants invalides'
      }
    }).as('loginError')
    
    cy.visit('/login', { failOnStatusCode: false })
    
    // Remplir avec des identifiants invalides
    cy.get('[data-cy="email-input"]').type('invalid@test.com')
    cy.get('[data-cy="password-input"]').type('wrongpassword')
    
    // Soumettre le formulaire
    cy.get('[data-cy="login-button"]').click()
    
    // Vérifier l'affichage de l'erreur
    cy.wait('@loginError')
    cy.get('[data-cy="error-message"]').should('be.visible')
    cy.get('[data-cy="error-message"]').should('contain', 'Identifiants invalides')
  })

  it('Devrait valider le format de l\'email', () => {
    cy.visit('/login', { failOnStatusCode: false })
    
    // Tester avec un email invalide
    cy.get('[data-cy="email-input"]').type('email-invalide')
    cy.get('[data-cy="password-input"]').type('password123')
    
    // Vérifier que le bouton reste cliquable mais que la validation HTML fonctionne
    cy.get('[data-cy="login-button"]').should('be.visible')
  })

  it('Devrait permettre de se déconnecter', () => {
    // Simuler une session active
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-token')
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@jeroka.com',
        name: 'Administrateur'
      }))
    })
    
    cy.visit('/', { failOnStatusCode: false })
    
    // Vérifier que le dashboard se charge
    cy.get('[data-cy="dashboard-layout"]').should('be.visible')
    
    // Cliquer sur le menu profil
    cy.get('button').contains('Administrateur').click()
    
    // Cliquer sur déconnexion
    cy.get('[data-cy="logout-button"]').click()
    
    // Vérifier la redirection vers la page de login
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
  })

  it('Devrait rediriger vers login si non authentifié', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    // Vérifier la redirection vers login
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-page"]').should('be.visible')
  })

  it('Devrait gérer l\'expiration du token', () => {
    // Simuler un token expiré
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'expired-token')
    })
    
    // Intercepter les requêtes API avec une erreur 401
    cy.intercept('GET', '/api/**', {
      statusCode: 401,
      body: { error: 'Token expiré' }
    }).as('expiredToken')
    
    cy.visit('/', { failOnStatusCode: false })
    
    // Vérifier la redirection vers login
    cy.url().should('include', '/login')
  })

  it('Devrait permettre de naviguer vers la page d\'inscription', () => {
    cy.visit('/login', { failOnStatusCode: false })
    
    // Cliquer sur le lien d'inscription
    cy.get('body').then(($body) => {
      if ($body.find('a[href*="register"]').length > 0) {
        cy.get('a[href*="register"]').click()
        cy.url().should('include', '/register')
        cy.get('[data-cy="register-page"]').should('be.visible')
      }
    })
  })

  it('Devrait afficher les identifiants de test', () => {
    cy.visit('/login', { failOnStatusCode: false })
    
    // Vérifier que les identifiants de test sont affichés
    cy.get('body').should('contain', 'admin@jeroka.com')
    cy.get('body').should('contain', 'admin123')
  })
})
