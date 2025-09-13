/// <reference types="cypress" />

describe('Tests de création de compte - Backoffice Jeroka', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('Devrait afficher la page de création de compte avec tous les éléments requis', () => {
    cy.visit('/register', { failOnStatusCode: false })
    
    // Vérifier que la page se charge
    cy.get('[data-cy="register-page"]').should('be.visible')
    
    // Vérifier les éléments du formulaire
    cy.get('[data-cy="first-name-input"]').should('be.visible')
    cy.get('[data-cy="last-name-input"]').should('be.visible')
    cy.get('[data-cy="register-email-input"]').should('be.visible')
    cy.get('[data-cy="register-password-input"]').should('be.visible')
    cy.get('[data-cy="confirm-password-input"]').should('be.visible')
    cy.get('[data-cy="register-button"]').should('be.visible')
    
    // Vérifier les types d'input
    cy.get('[data-cy="register-email-input"]').should('have.attr', 'type', 'email')
    cy.get('[data-cy="register-password-input"]').should('have.attr', 'type', 'password')
    cy.get('[data-cy="confirm-password-input"]').should('have.attr', 'type', 'password')
  })

  it('Devrait valider les champs requis', () => {
    cy.visit('/register', { failOnStatusCode: false })
    
    // Essayer de soumettre le formulaire vide
    cy.get('[data-cy="register-button"]').click()
    
    // Vérifier que le bouton est désactivé ou qu'une erreur apparaît
    cy.get('[data-cy="register-button"]').should('be.disabled')
  })

  it('Devrait valider le format de l\'email', () => {
    cy.visit('/register', { failOnStatusCode: false })
    
    // Remplir avec un email invalide
    cy.get('[data-cy="first-name-input"]').type('Jean')
    cy.get('[data-cy="last-name-input"]').type('Dupont')
    cy.get('[data-cy="register-email-input"]').type('email-invalide')
    cy.get('[data-cy="register-password-input"]').type('Password123')
    cy.get('[data-cy="confirm-password-input"]').type('Password123')
    
    // Vérifier que le bouton reste désactivé
    cy.get('[data-cy="register-button"]').should('be.disabled')
  })

  it('Devrait valider la force du mot de passe', () => {
    cy.visit('/register', { failOnStatusCode: false })
    
    // Remplir avec un mot de passe faible
    cy.get('[data-cy="first-name-input"]').type('Jean')
    cy.get('[data-cy="last-name-input"]').type('Dupont')
    cy.get('[data-cy="register-email-input"]').type('jean.dupont@test.com')
    cy.get('[data-cy="register-password-input"]').type('123')
    cy.get('[data-cy="confirm-password-input"]').type('123')
    
    // Vérifier que le bouton reste désactivé
    cy.get('[data-cy="register-button"]').should('be.disabled')
  })

  it('Devrait valider la correspondance des mots de passe', () => {
    cy.visit('/register', { failOnStatusCode: false })
    
    // Remplir avec des mots de passe différents
    cy.get('[data-cy="first-name-input"]').type('Jean')
    cy.get('[data-cy="last-name-input"]').type('Dupont')
    cy.get('[data-cy="register-email-input"]').type('jean.dupont@test.com')
    cy.get('[data-cy="register-password-input"]').type('Password123')
    cy.get('[data-cy="confirm-password-input"]').type('Password456')
    
    // Vérifier que le bouton reste désactivé
    cy.get('[data-cy="register-button"]').should('be.disabled')
  })

  it('Devrait permettre de créer un compte avec des données valides', () => {
    // Intercepter la requête d'inscription
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Compte créé avec succès',
        user: {
          id: 1,
          email: 'jean.dupont@test.com',
          firstName: 'Jean',
          lastName: 'Dupont'
        }
      }
    }).as('registerRequest')
    
    cy.visit('/register', { failOnStatusCode: false })
    
    // Remplir le formulaire avec des données valides
    cy.get('[data-cy="first-name-input"]').type('Jean')
    cy.get('[data-cy="last-name-input"]').type('Dupont')
    cy.get('[data-cy="register-email-input"]').type('jean.dupont@test.com')
    cy.get('[data-cy="register-password-input"]').type('Password123')
    cy.get('[data-cy="confirm-password-input"]').type('Password123')
    
    // Accepter les conditions (si checkbox présente)
    cy.get('body').then(($body) => {
      if ($body.find('input[type="checkbox"]').length > 0) {
        cy.get('input[type="checkbox"]').check()
      }
    })
    
    // Soumettre le formulaire
    cy.get('[data-cy="register-button"]').click()
    
    // Vérifier que la requête a été envoyée
    cy.wait('@registerRequest')
  })

  it('Devrait afficher une erreur en cas d\'échec de création', () => {
    // Intercepter la requête d'inscription avec une erreur
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        success: false,
        error: 'Email déjà utilisé'
      }
    }).as('registerError')
    
    cy.visit('/register', { failOnStatusCode: false })
    
    // Remplir le formulaire
    cy.get('[data-cy="first-name-input"]').type('Jean')
    cy.get('[data-cy="last-name-input"]').type('Dupont')
    cy.get('[data-cy="register-email-input"]').type('jean.dupont@test.com')
    cy.get('[data-cy="register-password-input"]').type('Password123')
    cy.get('[data-cy="confirm-password-input"]').type('Password123')
    
    // Accepter les conditions
    cy.get('body').then(($body) => {
      if ($body.find('input[type="checkbox"]').length > 0) {
        cy.get('input[type="checkbox"]').check()
      }
    })
    
    // Soumettre le formulaire
    cy.get('[data-cy="register-button"]').click()
    
    // Vérifier l'affichage de l'erreur
    cy.wait('@registerError')
    cy.get('[data-cy="register-error-message"]').should('be.visible')
  })

  it('Devrait permettre de basculer vers la page de connexion', () => {
    cy.visit('/register', { failOnStatusCode: false })
    
    // Cliquer sur le lien de connexion
    cy.get('body').then(($body) => {
      if ($body.find('a[href*="login"]').length > 0) {
        cy.get('a[href*="login"]').click()
        cy.url().should('include', '/login')
      }
    })
  })
})
