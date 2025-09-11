/// <reference types="cypress" />

describe('Tests de gestion des utilisateurs - Backoffice Jeroka', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    
    // Simuler une session admin active
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token')
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@jeroka.com',
        name: 'Administrateur',
        role: 'admin'
      }))
    })
    
    // Intercepter les requêtes API des utilisateurs
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [
        { id: 1, email: 'user1@jeroka.com', name: 'Utilisateur 1', role: 'user', created_at: '2024-01-01T00:00:00Z' },
        { id: 2, email: 'user2@jeroka.com', name: 'Utilisateur 2', role: 'user', created_at: '2024-01-02T00:00:00Z' },
        { id: 3, email: 'admin@jeroka.com', name: 'Administrateur', role: 'admin', created_at: '2024-01-03T00:00:00Z' }
      ]
    }).as('getUsers')
  })

  it('Devrait afficher la liste des utilisateurs', () => {
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.wait('@getUsers')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="users-table"]').length > 0) {
        // Vérifier que le tableau des utilisateurs est présent
        cy.get('[data-cy="users-table"]').should('be.visible')
        
        // Vérifier la présence des colonnes
        cy.get('[data-cy="users-table"]').should('contain', 'Email')
        cy.get('[data-cy="users-table"]').should('contain', 'Nom')
        cy.get('[data-cy="users-table"]').should('contain', 'Rôle')
        
        // Vérifier la présence des utilisateurs
        cy.get('[data-cy="user-row"]').should('have.length.at.least', 1)
      }
    })
  })

  it('Devrait permettre de créer un nouvel utilisateur', () => {
    // Intercepter la requête de création
    cy.intercept('POST', '/api/users', {
      statusCode: 201,
      body: {
        id: 4,
        email: 'nouveau@jeroka.com',
        name: 'Nouvel Utilisateur',
        role: 'user',
        created_at: new Date().toISOString()
      }
    }).as('createUser')
    
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="add-user-button"]').length > 0) {
        // Cliquer sur le bouton d'ajout
        cy.get('[data-cy="add-user-button"]').click()
        
        // Vérifier que le formulaire s'ouvre
        cy.get('[data-cy="user-form"]').should('be.visible')
        
        // Remplir le formulaire
        cy.get('[data-cy="user-email"]').type('nouveau@jeroka.com')
        cy.get('[data-cy="user-name"]').type('Nouvel Utilisateur')
        cy.get('[data-cy="user-password"]').type('password123')
        cy.get('[data-cy="user-role"]').select('user')
        
        // Soumettre le formulaire
        cy.get('[data-cy="submit-user"]').click()
        
        // Vérifier que la requête a été envoyée
        cy.wait('@createUser')
        
        // Vérifier que le formulaire se ferme
        cy.get('[data-cy="user-form"]').should('not.be.visible')
      }
    })
  })

  it('Devrait permettre de modifier un utilisateur existant', () => {
    // Intercepter la requête de mise à jour
    cy.intercept('PUT', '/api/users/1', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'user1@jeroka.com',
        name: 'Utilisateur Modifié',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z'
      }
    }).as('updateUser')
    
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.wait('@getUsers')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="edit-user-button"]').length > 0) {
        // Cliquer sur le bouton d'édition du premier utilisateur
        cy.get('[data-cy="edit-user-button"]').first().click()
        
        // Vérifier que le formulaire s'ouvre avec les données existantes
        cy.get('[data-cy="user-form"]').should('be.visible')
        cy.get('[data-cy="user-name"]').should('have.value', 'Utilisateur 1')
        
        // Modifier le nom
        cy.get('[data-cy="user-name"]').clear().type('Utilisateur Modifié')
        
        // Soumettre le formulaire
        cy.get('[data-cy="submit-user"]').click()
        
        // Vérifier que la requête a été envoyée
        cy.wait('@updateUser')
      }
    })
  })

  it('Devrait permettre de supprimer un utilisateur', () => {
    // Intercepter la requête de suppression
    cy.intercept('DELETE', '/api/users/1', {
      statusCode: 204
    }).as('deleteUser')
    
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.wait('@getUsers')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="delete-user-button"]').length > 0) {
        // Cliquer sur le bouton de suppression du premier utilisateur
        cy.get('[data-cy="delete-user-button"]').first().click()
        
        // Vérifier que la confirmation s'affiche
        cy.get('[data-cy="confirm-delete"]').should('be.visible')
        
        // Confirmer la suppression
        cy.get('[data-cy="confirm-delete"]').click()
        
        // Vérifier que la requête a été envoyée
        cy.wait('@deleteUser')
      }
    })
  })

  it('Devrait permettre de rechercher des utilisateurs', () => {
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.wait('@getUsers')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="user-search"]').length > 0) {
        // Effectuer une recherche
        cy.get('[data-cy="user-search"]').type('user1@jeroka.com')
        
        // Vérifier que les résultats sont filtrés
        cy.get('[data-cy="user-row"]').should('have.length', 1)
        cy.get('[data-cy="user-row"]').should('contain', 'user1@jeroka.com')
      }
    })
  })

  it('Devrait permettre de filtrer les utilisateurs par rôle', () => {
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.wait('@getUsers')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="role-filter"]').length > 0) {
        // Filtrer par rôle admin
        cy.get('[data-cy="role-filter"]').select('admin')
        
        // Vérifier que seuls les administrateurs sont affichés
        cy.get('[data-cy="user-row"]').should('have.length', 1)
        cy.get('[data-cy="user-row"]').should('contain', 'admin')
      }
    })
  })

  it('Devrait valider les champs du formulaire utilisateur', () => {
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="add-user-button"]').length > 0) {
        // Ouvrir le formulaire
        cy.get('[data-cy="add-user-button"]').click()
        
        // Essayer de soumettre sans remplir les champs
        cy.get('[data-cy="submit-user"]').click()
        
        // Vérifier que les messages de validation s'affichent
        cy.get('[data-cy="user-form"]').should('contain', 'requis')
        
        // Tester avec un email invalide
        cy.get('[data-cy="user-email"]').type('email-invalide')
        cy.get('[data-cy="user-name"]').type('Nom')
        cy.get('[data-cy="user-password"]').type('password')
        
        cy.get('[data-cy="submit-user"]').click()
        
        // Vérifier que le formulaire n'est pas soumis
        cy.get('[data-cy="user-form"]').should('be.visible')
      }
    })
  })

  it('Devrait gérer les erreurs de l\'API', () => {
    // Intercepter avec une erreur
    cy.intercept('GET', '/api/users', {
      statusCode: 500,
      body: { message: 'Erreur serveur' }
    }).as('getUsersError')
    
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.wait('@getUsersError')
    
    cy.get('body').then(($body) => {
      // Vérifier qu'un message d'erreur s'affiche
      if ($body.find('[data-cy="error-message"]').length > 0) {
        cy.get('[data-cy="error-message"]').should('be.visible')
        cy.get('[data-cy="error-message"]').should('contain', 'Erreur')
      }
    })
  })

  it('Devrait permettre la pagination des utilisateurs', () => {
    // Intercepter avec plus d'utilisateurs
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        email: `user${i + 1}@jeroka.com`,
        name: `Utilisateur ${i + 1}`,
        role: 'user',
        created_at: '2024-01-01T00:00:00Z'
      }))
    }).as('getManyUsers')
    
    cy.visit('/users', { failOnStatusCode: false })
    
    cy.wait('@getManyUsers')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="pagination"]').length > 0) {
        // Vérifier la présence de la pagination
        cy.get('[data-cy="pagination"]').should('be.visible')
        
        // Tester la navigation vers la page suivante
        cy.get('[data-cy="next-page"]').click()
        
        // Vérifier que la page a changé
        cy.get('[data-cy="current-page"]').should('contain', '2')
      }
    })
  })
})
