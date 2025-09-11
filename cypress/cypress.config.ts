import { defineConfig } from 'cypress'
import { config } from 'dotenv'

// Charger les variables d'environnement
config()

export default defineConfig({
  e2e: {
    baseUrl: 'https://backoffice.jerokaxperience.fr',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    setupNodeEvents(on, config) {
      // Configuration pour les rapports
      import('cypress-mochawesome-reporter/plugin.js').then(plugin => plugin.default(on))
      
      // Configuration pour ignorer les erreurs SSL
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--ignore-certificate-errors')
          launchOptions.args.push('--ignore-ssl-errors')
          launchOptions.args.push('--allow-running-insecure-content')
          launchOptions.args.push('--disable-web-security')
        }
        return launchOptions
      })
      
      // Configuration pour les variables d'environnement
      config.env = {
        ...config.env,
        ...process.env
      }
      
      return config
    },
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    timestamp: 'mmddyyyy_HHMMss',
    reportTitle: 'Rapport de Tests Jeroka Backoffice',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  env: {
    // Variables d'environnement pour les tests
    API_BASE_URL: 'https://apibackoffice.jerokaxperience.fr',
    BACKOFFICE_URL: process.env.BACKOFFICE_URL || 'http://localhost:3001',
    TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'test@jeroka.com',
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'testpassword123',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@jeroka.com',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'adminpassword123'
  }
})
