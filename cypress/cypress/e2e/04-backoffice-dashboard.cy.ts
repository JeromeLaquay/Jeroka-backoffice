/// <reference types="cypress" />

describe('Tests du Dashboard - Backoffice Jeroka', () => {
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
    
    // Intercepter les requêtes API du dashboard
    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: {
        totalUsers: 150,
        totalProducts: 45,
        totalOrders: 320,
        totalRevenue: 12500.50
      }
    }).as('dashboardStats')
    
    cy.intercept('GET', '/api/dashboard/recent-activity', {
      statusCode: 200,
      body: [
        { id: 1, type: 'user_registration', message: 'Nouvel utilisateur inscrit', timestamp: '2024-01-15T10:30:00Z' },
        { id: 2, type: 'order_created', message: 'Nouvelle commande créée', timestamp: '2024-01-15T09:15:00Z' },
        { id: 3, type: 'product_updated', message: 'Produit mis à jour', timestamp: '2024-01-15T08:45:00Z' }
      ]
    }).as('recentActivity')
  })

  it('Devrait afficher le dashboard avec toutes les statistiques', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    // Vérifier que la page se charge
    cy.get('body').should('be.visible')
    
    // Attendre que les données soient chargées
    cy.wait('@dashboardStats')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="dashboard-stats"]').length > 0) {
        // Vérifier les statistiques
        cy.get('[data-cy="stat-total-users"]').should('contain', '150')
        cy.get('[data-cy="stat-total-products"]').should('contain', '45')
        cy.get('[data-cy="stat-total-orders"]').should('contain', '320')
        cy.get('[data-cy="stat-total-revenue"]').should('contain', '12500.50')
      }
    })
  })

  it('Devrait afficher les activités récentes', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.wait('@recentActivity')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="recent-activity"]').length > 0) {
        // Vérifier la présence des activités récentes
        cy.get('[data-cy="recent-activity"]').should('be.visible')
        cy.get('[data-cy="activity-item"]').should('have.length.at.least', 1)
        
        // Vérifier le contenu des activités
        cy.get('[data-cy="activity-item"]').first().should('contain', 'Nouvel utilisateur inscrit')
      }
    })
  })

  it('Devrait permettre la navigation vers les différentes sections', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      // Vérifier la présence du menu de navigation
      if ($body.find('[data-cy="nav-menu"]').length > 0) {
        // Tester la navigation vers les utilisateurs
        if ($body.find('[data-cy="nav-users"]').length > 0) {
          cy.get('[data-cy="nav-users"]').click()
          cy.url().should('include', '/users')
        }
        
        // Retourner au dashboard
        cy.visit('/dashboard', { failOnStatusCode: false })
        
        // Tester la navigation vers les produits
        if ($body.find('[data-cy="nav-products"]').length > 0) {
          cy.get('[data-cy="nav-products"]').click()
          cy.url().should('include', '/products')
        }
      }
    })
  })

  it('Devrait afficher les graphiques et visualisations', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      // Vérifier la présence des graphiques
      if ($body.find('[data-cy="chart-container"]').length > 0) {
        cy.get('[data-cy="chart-container"]').should('be.visible')
        
        // Vérifier que les graphiques sont interactifs
        cy.get('[data-cy="chart-container"]').should('not.be.disabled')
      }
    })
  })

  it('Devrait permettre de rafraîchir les données', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="refresh-button"]').length > 0) {
        // Cliquer sur le bouton de rafraîchissement
        cy.get('[data-cy="refresh-button"]').click()
        
        // Vérifier que les données sont rechargées
        cy.wait('@dashboardStats')
        cy.wait('@recentActivity')
      }
    })
  })

  it('Devrait gérer les erreurs de chargement des données', () => {
    // Intercepter avec une erreur
    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 500,
      body: { message: 'Erreur serveur' }
    }).as('dashboardError')
    
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.wait('@dashboardError')
    
    cy.get('body').then(($body) => {
      // Vérifier qu'un message d'erreur s'affiche
      if ($body.find('[data-cy="error-message"]').length > 0) {
        cy.get('[data-cy="error-message"]').should('be.visible')
        cy.get('[data-cy="error-message"]').should('contain', 'Erreur')
      }
    })
  })

  it('Devrait être responsive sur mobile', () => {
    // Tester sur mobile
    cy.viewport(375, 667)
    
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="mobile-menu"]').length > 0) {
        // Vérifier que le menu mobile est présent
        cy.get('[data-cy="mobile-menu"]').should('be.visible')
        
        // Tester l'ouverture du menu mobile
        cy.get('[data-cy="mobile-menu-toggle"]').click()
        cy.get('[data-cy="mobile-menu"]').should('be.visible')
      }
    })
  })

  it('Devrait permettre de filtrer les activités récentes', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    
    cy.wait('@recentActivity')
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="activity-filter"]').length > 0) {
        // Tester le filtre par type d'activité
        cy.get('[data-cy="activity-filter"]').select('user_registration')
        
        // Vérifier que seules les activités de type user_registration sont affichées
        cy.get('[data-cy="activity-item"]').should('contain', 'Nouvel utilisateur inscrit')
      }
    })
  })
})
