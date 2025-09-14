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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

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
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId);

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

  async callOpenAIImage(prompt: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes pour DALL-E

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any
        throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json() as any
      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error('Invalid response from OpenAI API')
      }
      
      return data.data[0].url
    } catch (error) {
      console.error('Erreur génération image OpenAI:', error)
      throw error
    }
  }


}
