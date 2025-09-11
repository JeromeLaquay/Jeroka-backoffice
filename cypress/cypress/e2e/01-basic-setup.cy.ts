/// <reference types="cypress" />

describe('Tests de base - Validation du setup Cypress', () => {
  beforeEach(() => {
    // Configuration pour chaque test
    cy.viewport(1280, 720)
  })

  it('Devrait pouvoir visiter Google et effectuer une recherche', () => {
    // Test basique pour valider que Cypress fonctionne
    cy.visit('https://www.google.com')
    
    // Vérifier que la page Google se charge
    cy.get('input[name="q"]').should('be.visible')
    cy.get('input[name="q"]').should('not.be.disabled')
    
    // Effectuer une recherche
    cy.get('input[name="q"]').type('Cypress testing framework')
    cy.get('input[name="q"]').type('{enter}')
    
    // Vérifier que les résultats s'affichent
    cy.get('#search').should('be.visible')
    cy.get('h3').should('contain', 'Cypress')
  })

  it('Devrait pouvoir naviguer et vérifier les éléments de base', () => {
    cy.visit('https://www.google.com')
    
    // Vérifier les éléments principaux de Google
    cy.get('img[alt="Google"]').should('be.visible')
    cy.get('input[name="q"]').should('be.visible')
    cy.get('input[name="btnK"]').should('be.visible')
    
    // Vérifier que le bouton "J\'ai de la chance" existe
    cy.get('input[name="btnI"]').should('be.visible')
  })

  it('Devrait pouvoir tester les interactions avec les formulaires', () => {
    cy.visit('https://www.google.com')
    
    // Test de saisie dans le champ de recherche
    const searchTerm = 'Jeroka backoffice testing'
    cy.get('input[name="q"]').type(searchTerm)
    cy.get('input[name="q"]').should('have.value', searchTerm)
    
    // Test de soumission du formulaire
    cy.get('form').submit()
    
    // Vérifier que nous sommes sur la page de résultats
    cy.url().should('include', 'search')
    cy.get('#search').should('be.visible')
  })

  it('Devrait pouvoir gérer les erreurs et les timeouts', () => {
    // Test de gestion d'erreur avec une URL invalide
    cy.visit('https://www.google.com/invalid-page', { failOnStatusCode: false })
    
    // Vérifier que nous gérons bien l'erreur 404
    cy.get('body').should('be.visible')
  })

  it('Devrait pouvoir prendre des captures d\'écran', () => {
    cy.visit('https://www.google.com')
    
    // Prendre une capture d'écran de la page d'accueil
    cy.screenshot('google-homepage')
    
    // Vérifier que la page est bien chargée
    cy.get('input[name="q"]').should('be.visible')
  })
})
