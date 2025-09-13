import { iaService } from "../api/ia/iaService";
import { MessageService } from "./messageService";
import { CompanyService } from "./companyService";

export class MessageIAService {

  /**
   * Génère un brouillon de réponse pour un message
   * @param messageId - L'ID du message
   * @param companyId - L'ID de l'entreprise
   * @param options - Les options pour la génération du brouillon
   * @returns La réponse générée
   */
  static async generateEmailDraft(messageId: string, companyId: string, options: any) {

    const message = await MessageService.getById(messageId, companyId)
    if (!message) {
      throw new Error('Message non trouvé')
    }

    const company = await CompanyService.getCompany(companyId)
    if (!company) {
      throw new Error('Company non trouvée')
    }
    const prompt = this.generatePromptEmailDraft(message, company, options)
      const response = await iaService.callOpenAI(prompt)
      if (!response) {
      throw new Error('Réponse de l\'IA non trouvée')
    }
    message.prompt = prompt
    message.response = response
    await MessageService.update(message.id, companyId, {
      prompt: message.prompt,
      response: message.response
    })
    return response
  }


  /**
   * Génère un prompt pour la génération du brouillon de réponse
   * @param message - Le message
   * @param company - L'entreprise
   * @param options - Les options pour la génération du brouillon
   * @returns Le prompt
   */
  private static generatePromptEmailDraft(message: any, company: any, options: any) {
    return "Tu es un assistant IA professionnel qui aide à rédiger des réponses commerciales. Réponds au message suivant : " + message.message + " pour l'entreprise " + company.name + " avec les options suivantes : " + options
  }
    
}