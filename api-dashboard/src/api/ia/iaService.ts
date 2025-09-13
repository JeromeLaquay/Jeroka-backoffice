import { ChatgptService } from './chatgptService'

export interface IAProvider {
  name: string
  callOpenAI(prompt: string): Promise<string>
}

export interface EmailDraftOptions {
  tone: 'professionnel' | 'amical' | 'formel' | 'concis'
  language: 'fr' | 'en'
}

export interface IAConfig {
  provider: 'chatgpt' | 'claude' | 'local'
}

export class IaService {
  private providers: Map<string, IAProvider> = new Map()
  private defaultProvider: string = 'chatgpt'
  private config: IAConfig

  constructor(config: IAConfig) {
    this.config = config
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialiser ChatGPT
    if (this.config.provider === 'chatgpt' || this.config.provider === 'local') {
      const chatgptService = new ChatgptService()
      this.providers.set('chatgpt', chatgptService)
    }

    // TODO: Ajouter d'autres providers (Claude, etc.)
  }

  callOpenAI(prompt: string) {
    return this.providers.get(this.defaultProvider)?.callOpenAI(prompt)
  }

}

export const iaService = new IaService({ provider: 'chatgpt' })
export default iaService
