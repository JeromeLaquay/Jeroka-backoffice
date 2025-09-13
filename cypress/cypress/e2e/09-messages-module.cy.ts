/// <reference types="cypress" />

describe('Tests du module Messages - Backoffice Jeroka', () => {
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

  it('Devrait afficher la page des messages avec tous les éléments', () => {
    // Intercepter les requêtes API
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [
            {
              id: '1',
              first_name: 'Jean',
              last_name: 'Dupont',
              email: 'jean.dupont@test.com',
              phone: '0123456789',
              company: 'Entreprise Test',
              subject: 'Demande de devis',
              message: 'Bonjour, je souhaiterais obtenir un devis...',
              status: 'new',
              priority: 'medium',
              source: 'website',
              tags: ['devis', 'nouveau-client'],
              created_at: '2024-01-01T00:00:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1
          }
        }
      }
    }).as('getMessages')
    
    cy.intercept('GET', '/api/v1/messages/stats', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          total: 1,
          new: 1,
          read: 0,
          replied: 0,
          archived: 0
        }
      }
    }).as('getMessageStats')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Vérifier que la page se charge
    cy.get('[data-cy="messages-page"]').should('be.visible')
    
    // Vérifier les éléments de la page
    cy.get('h1').should('contain', 'Messages de contact')
    cy.get('[data-cy="mark-all-read-button"]').should('be.visible')
    
    // Vérifier les statistiques
    cy.wait('@getMessageStats')
    cy.get('body').should('contain', 'Total messages')
    cy.get('body').should('contain', 'Nouveaux')
  })

  it('Devrait afficher la liste des messages', () => {
    const mockMessages = [
      {
        id: '1',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@test.com',
        subject: 'Demande de devis',
        message: 'Bonjour, je souhaiterais obtenir un devis...',
        status: 'new',
        priority: 'high',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'marie.martin@test.com',
        subject: 'Question produit',
        message: 'Pouvez-vous me renseigner sur...',
        status: 'read',
        priority: 'medium',
        created_at: '2024-01-02T00:00:00Z'
      }
    ]
    
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: mockMessages,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }
    }).as('getMessages')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Vérifier l'affichage des messages
    cy.wait('@getMessages')
    cy.get('table').should('be.visible')
    cy.get('tbody tr').should('have.length', 2)
    
    // Vérifier le contenu des messages
    cy.get('tbody tr').first().should('contain', 'Jean Dupont')
    cy.get('tbody tr').first().should('contain', 'Demande de devis')
    cy.get('tbody tr').last().should('contain', 'Marie Martin')
  })

  it('Devrait permettre de marquer tous les messages comme lus', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [{
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@test.com',
            subject: 'Test',
            message: 'Message test',
            status: 'new',
            created_at: '2024-01-01T00:00:00Z'
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
    }).as('getMessages')
    
    cy.intercept('POST', '/api/v1/messages/mark-all-read', {
      statusCode: 200,
      body: { success: true }
    }).as('markAllRead')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Cliquer sur "Tout marquer comme lu"
    cy.get('[data-cy="mark-all-read-button"]').click()
    
    // Vérifier que la requête est envoyée
    cy.wait('@markAllRead')
  })

  it('Devrait permettre de filtrer les messages par statut', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      }
    }).as('filterMessages')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Sélectionner un filtre de statut
    cy.get('select').first().select('new')
    
    // Vérifier que la requête est envoyée
    cy.wait('@filterMessages')
  })

  it('Devrait permettre de rechercher des messages', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      }
    }).as('searchMessages')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Effectuer une recherche
    cy.get('input[type="text"]').first().type('devis')
    
    // Attendre la requête de recherche
    cy.wait('@searchMessages')
  })

  it('Devrait permettre de marquer un message comme lu', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [{
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@test.com',
            subject: 'Test',
            message: 'Message test',
            status: 'new',
            created_at: '2024-01-01T00:00:00Z'
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
    }).as('getMessages')
    
    cy.intercept('POST', '/api/v1/messages/1/mark-read', {
      statusCode: 200,
      body: { success: true }
    }).as('markRead')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Cliquer sur le bouton "Marquer comme lu"
    cy.wait('@getMessages')
    cy.get('tbody tr').first().find('button').contains('Marquer comme lu').click()
    
    // Vérifier que la requête est envoyée
    cy.wait('@markRead')
  })

  it('Devrait permettre de générer une réponse IA', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [{
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@test.com',
            subject: 'Demande de devis',
            message: 'Bonjour, je souhaiterais obtenir un devis...',
            status: 'new',
            created_at: '2024-01-01T00:00:00Z'
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
    }).as('getMessages')
    
    cy.intercept('POST', '/api/v1/messages/1/ai-draft', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          prompt: 'Générer une réponse professionnelle...',
          response: 'Bonjour Jean,\n\nMerci pour votre demande de devis...'
        }
      }
    }).as('generateAIResponse')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Cliquer sur le bouton "Générer réponse IA"
    cy.wait('@getMessages')
    cy.get('tbody tr').first().find('button').contains('IA').click()
    
    // Vérifier que la requête est envoyée
    cy.wait('@generateAIResponse')
  })

  it('Devrait permettre de répondre à un message', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [{
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@test.com',
            subject: 'Test',
            message: 'Message test',
            status: 'new',
            created_at: '2024-01-01T00:00:00Z'
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
    }).as('getMessages')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Cliquer sur le bouton "Répondre"
    cy.wait('@getMessages')
    cy.get('tbody tr').first().find('button').contains('Répondre').click()
    
    // Vérifier l'ouverture du modal ou la redirection
    cy.get('body').should('contain', 'Répondre')
  })

  it('Devrait permettre de supprimer un message', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [{
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@test.com',
            subject: 'Test',
            message: 'Message test',
            status: 'new',
            created_at: '2024-01-01T00:00:00Z'
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
    }).as('getMessages')
    
    cy.intercept('DELETE', '/api/v1/messages/1', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteMessage')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Cliquer sur le bouton "Supprimer"
    cy.wait('@getMessages')
    cy.get('tbody tr').first().find('button').contains('Supprimer').click()
    
    // Confirmer la suppression
    cy.get('button').contains('Supprimer').click()
    
    // Vérifier que la requête est envoyée
    cy.wait('@deleteMessage')
  })

  it('Devrait gérer les erreurs de l\'API', () => {
    // Intercepter avec une erreur
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 500,
      body: { success: false, error: 'Erreur serveur' }
    }).as('getMessagesError')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Vérifier que l'erreur est gérée
    cy.wait('@getMessagesError')
    // L'application devrait afficher un message d'erreur ou une liste vide
  })

  it('Devrait afficher les détails d\'un message', () => {
    cy.intercept('GET', '/api/v1/messages*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          messages: [{
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@test.com',
            phone: '0123456789',
            company: 'Entreprise Test',
            subject: 'Demande de devis',
            message: 'Bonjour, je souhaiterais obtenir un devis pour vos services...',
            status: 'new',
            priority: 'high',
            source: 'website',
            tags: ['devis', 'nouveau-client'],
            created_at: '2024-01-01T00:00:00Z'
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }
    }).as('getMessages')
    
    cy.visit('/messages', { failOnStatusCode: false })
    
    // Cliquer sur un message pour voir les détails
    cy.wait('@getMessages')
    cy.get('tbody tr').first().click()
    
    // Vérifier l'affichage des détails
    cy.get('body').should('contain', 'Jean Dupont')
    cy.get('body').should('contain', 'jean.dupont@test.com')
    cy.get('body').should('contain', 'Demande de devis')
  })
})
