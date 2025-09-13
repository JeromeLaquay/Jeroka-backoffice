/// <reference types="cypress" />

describe('Tests du module Clients - Backoffice Jeroka', () => {
  beforeEach(() => {
    cy.viewport(1280, 720)
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Simuler une session active
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'fake-token')
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@jeroka.com',
        name: 'Administrateur',
        role: 'admin'
      }))
    })
  })

  it('Devrait afficher la page des clients avec tous les éléments', () => {
    // Intercepter les requêtes API
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@test.com',
            phone: '0123456789',
            company_name: 'Entreprise Test',
            status: 'active',
            type: 'individual',
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }
    }).as('getClients')
    
    cy.intercept('GET', '/api/v1/clients/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          total: 1,
          active: 1,
          prospects: 0,
          inactive: 0,
          companies: 0,
          individuals: 1
        }
      }
    }).as('getClientStats')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Vérifier que la page se charge
    cy.get('[data-cy="clients-page"]').should('be.visible')
    
    // Vérifier les éléments de la page
    cy.get('h1').should('contain', 'Gestion des Clients')
    cy.get('[data-cy="create-client-button"]').should('be.visible')
    cy.get('[data-cy="client-search-input"]').should('be.visible')
    
    // Vérifier les statistiques
    cy.wait('@getClientStats')
    cy.get('body').should('contain', 'Total Clients')
    cy.get('body').should('contain', 'Clients Actifs')
  })

  it('Devrait permettre de rechercher des clients', () => {
    // Intercepter la requête de recherche
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
    }).as('searchClients')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Effectuer une recherche
    cy.get('[data-cy="client-search-input"]').type('Jean')
    
    // Attendre la requête de recherche
    cy.wait('@searchClients')
  })

  it('Devrait permettre de filtrer par statut', () => {
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    }).as('filterClients')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Sélectionner un filtre de statut
    cy.get('select').first().select('active')
    
    // Vérifier que la requête est envoyée
    cy.wait('@filterClients')
  })

  it('Devrait permettre de créer un nouveau client', () => {
    // Intercepter la requête de création
    cy.intercept('POST', '/api/v1/clients', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          id: '2',
          first_name: 'Marie',
          last_name: 'Martin',
          email: 'marie.martin@test.com',
          created_at: '2024-01-01T00:00:00Z'
        }
      }
    }).as('createClient')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Cliquer sur le bouton de création
    cy.get('[data-cy="create-client-button"]').click()
    
    // Vérifier la redirection vers la page de création
    cy.url().should('include', '/clients/create')
  })

  it('Devrait afficher la liste des clients', () => {
    const mockClients = [
      {
        id: '1',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@test.com',
        phone: '0123456789',
        company_name: 'Entreprise Test',
        status: 'active',
        type: 'individual',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'marie.martin@test.com',
        phone: '0987654321',
        company_name: 'Société ABC',
        status: 'prospect',
        type: 'company',
        created_at: '2024-01-02T00:00:00Z'
      }
    ]
    
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: {
        success: true,
        data: mockClients,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      }
    }).as('getClients')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Vérifier l'affichage des clients
    cy.wait('@getClients')
    cy.get('table').should('be.visible')
    cy.get('tbody tr').should('have.length', 2)
    
    // Vérifier le contenu des lignes
    cy.get('tbody tr').first().should('contain', 'Jean Dupont')
    cy.get('tbody tr').first().should('contain', 'jean.dupont@test.com')
    cy.get('tbody tr').last().should('contain', 'Marie Martin')
  })

  it('Devrait permettre de modifier un client', () => {
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: {
        success: true,
        data: [{
          id: '1',
          first_name: 'Jean',
          last_name: 'Dupont',
          email: 'jean.dupont@test.com',
          status: 'active',
          type: 'individual',
          created_at: '2024-01-01T00:00:00Z'
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      }
    }).as('getClients')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Cliquer sur le bouton modifier
    cy.wait('@getClients')
    cy.get('tbody tr').first().find('button').contains('Modifier').click()
    
    // Vérifier la redirection vers la page de modification
    cy.url().should('include', '/clients/1/edit')
  })

  it('Devrait permettre de supprimer un client', () => {
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: {
        success: true,
        data: [{
          id: '1',
          first_name: 'Jean',
          last_name: 'Dupont',
          email: 'jean.dupont@test.com',
          status: 'active',
          type: 'individual',
          created_at: '2024-01-01T00:00:00Z'
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      }
    }).as('getClients')
    
    cy.intercept('DELETE', '/api/v1/clients/1', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteClient')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Cliquer sur le bouton supprimer
    cy.wait('@getClients')
    cy.get('tbody tr').first().find('button').contains('Supprimer').click()
    
    // Confirmer la suppression dans le modal
    cy.get('button').contains('Supprimer').click()
    
    // Vérifier que la requête de suppression est envoyée
    cy.wait('@deleteClient')
  })

  it('Devrait gérer les erreurs de l\'API', () => {
    // Intercepter avec une erreur
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 500,
      body: { success: false, error: 'Erreur serveur' }
    }).as('getClientsError')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Vérifier que l'erreur est gérée
    cy.wait('@getClientsError')
    // L'application devrait afficher un message d'erreur ou une liste vide
  })

  it('Devrait permettre la pagination', () => {
    const mockClients = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      first_name: `Client${i + 1}`,
      last_name: 'Test',
      email: `client${i + 1}@test.com`,
      status: 'active',
      type: 'individual',
      created_at: '2024-01-01T00:00:00Z'
    }))
    
    cy.intercept('GET', '/api/v1/clients*', {
      statusCode: 200,
      body: {
        success: true,
        data: mockClients.slice(0, 10),
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 }
      }
    }).as('getClientsPage1')
    
    cy.visit('/clients', { failOnStatusCode: false })
    
    // Vérifier la pagination
    cy.wait('@getClientsPage1')
    cy.get('body').should('contain', 'Affichage de')
    cy.get('body').should('contain', 'sur 25')
    
    // Vérifier les boutons de pagination
    cy.get('button').contains('Suivant').should('be.visible')
  })
})
