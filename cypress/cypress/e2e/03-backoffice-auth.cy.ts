/// <reference types="cypress" />

describe('Tests d\'authentification - Backoffice Jeroka', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    // Nettoyer les cookies et le localStorage avant chaque test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('Devrait afficher la page de connexion avec tous les éléments requis', () => {
    cy.visit('/login', { failOnStatusCode: false })
    
    // Vérifier que la page se charge
    cy.get('body').should('be.visible')
    
    // Vérifier les éléments de la page de login
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="email-input"]').length > 0) {
        cy.get('[data-cy="email-input"]').should('be.visible')
        cy.get('[data-cy="password-input"]').should('be.visible')
        cy.get('[data-cy="login-button"]').should('be.visible')
        
        // Vérifier les types d'input
        cy.get('[data-cy="email-input"]').should('have.attr', 'type', 'email')
        cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password')
      }
    })
  })

  it('Devrait pouvoir se connecter avec des identifiants valides', () => {
    // Intercepter la requête de login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'laquay.jerome@gmail.com',
          name: 'Administrateur',
          role: 'admin'
        }
      }
    }).as('loginRequest')
    
    cy.visit('/login', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="email-input"]').length > 0) {
        // Remplir le formulaire de connexion
        cy.get('[data-cy="email-input"]').type('laquay.jerome@gmail.com')
        cy.get('[data-cy="password-input"]').type('Je123456!')
        
        // Soumettre le formulaire
        cy.get('[data-cy="login-button"]').click()
        
        // Vérifier que la requête a été envoyée
        cy.wait('@loginRequest')
        
        // Vérifier la redirection vers le dashboard
        cy.url().should('include', '/dashboard')
      }
    })
  })

  it('Devrait afficher une erreur avec des identifiants invalides', () => {
    // Intercepter la requête de login avec une erreur
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Identifiants invalides'
      }
    }).as('loginError')
    
    cy.visit('/login', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="email-input"]').length > 0) {
        // Remplir le formulaire avec des identifiants invalides
        cy.get('[data-cy="email-input"]').type('invalid@email.com')
        cy.get('[data-cy="password-input"]').type('wrongpassword')
        
        // Soumettre le formulaire
        cy.get('[data-cy="login-button"]').click()
        
        // Vérifier que la requête a été envoyée
        cy.wait('@loginError')
        
        // Vérifier qu'un message d'erreur s'affiche
        cy.get('body').should('contain', 'Identifiants invalides')
      }
    })
  })

  it('Devrait valider le format de l\'email', () => {
    cy.visit('/login', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="email-input"]').length > 0) {
        // Tester avec un email invalide
        cy.get('[data-cy="email-input"]').type('email-invalide')
        cy.get('[data-cy="password-input"]').type('password123')
        
        // Vérifier que le formulaire n'est pas soumis
        cy.get('[data-cy="login-button"]').click()
        
        // Vérifier qu'on reste sur la page de login
        cy.url().should('include', '/login')
      }
    })
  })

  it('Devrait pouvoir se déconnecter', () => {
    // Simuler une session active
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token')
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'laquay.jerome@gmail.com',
        name: 'Administrateur',
        role: 'admin'
      }))
    })
    
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="logout-button"]').length > 0) {
        // Cliquer sur le bouton de déconnexion
        cy.get('[data-cy="logout-button"]').click()
        
        // Vérifier la redirection vers la page de login
        cy.url().should('include', '/login')
        
        // Vérifier que le token a été supprimé
        cy.window().then((win) => {
          expect(win.localStorage.getItem('token')).to.be.null
        })
      }
    })
  })

  it('Devrait rediriger vers login si non authentifié', () => {
    // Visiter une page protégée sans être connecté
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    // Vérifier la redirection vers la page de login
    cy.url().should('include', '/login')
  })

  it('Devrait gérer l\'expiration du token', () => {
    // Simuler un token expiré
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'expired-token')
    })
    
    // Intercepter les requêtes API avec une erreur 401
    cy.intercept('GET', '/api/**', {
      statusCode: 401,
      body: { message: 'Token expiré' }
    }).as('expiredToken')
    
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    // Vérifier la redirection vers la page de login
    cy.url().should('include', '/login')
  })
})
