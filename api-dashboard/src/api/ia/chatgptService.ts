import { IAProvider, EmailDraftOptions } from './iaService'

export class ChatgptService implements IAProvider {
  name = 'chatgpt'
  private baseUrl = 'https://api.openai.com/v1/chat/completions'
  private apiKey = process.env.OPENAI_API_KEY || ''

  /**
   * Appel à l'API OpenAI
   */
  async callOpenAI(prompt: string): Promise<string> {
    try {
      const messages = [
        {
          role: 'system',
          content: 'Tu es un assistant IA professionnel'
        },
        {
          role: 'user',
          content: prompt
        }
      ]

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any
        throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json() as any
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API')
      }

      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('Erreur appel OpenAI:', error)
      throw error
    }
  }


}
