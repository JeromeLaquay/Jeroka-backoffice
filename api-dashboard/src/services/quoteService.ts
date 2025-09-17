import { QuoteRepository, CreateQuoteData, UpdateQuoteData, CreateQuoteItemData } from '../repositories/quoteRepository';
import UserRepository from '../repositories/userRepository';
import { QuoteValidation } from '../validations/quoteValidation';


export interface QuoteWithItems {
  id: string;
  quote_number: string;
  client_id: string;
  company_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  total: number;
  tax: number;
  subtotal: number;
  valid_until: Date;
  issue_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  client_name?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    discount_percent?: number;
    vat_number?: number;
  }>;
}

export interface CreateQuoteRequest {
  client_id: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    vat_number?: number;
  }>;
  valid_until: string;
  notes?: string;
  status?: 'draft' | 'sent';
}

export interface UpdateQuoteRequest {
  client_id?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    vat_number?: number;
  }>;
  valid_until?: string;
  notes?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  subtotal?: number;
  tax?: number;
  total?: number;
}

export class QuoteService {
  /**
   * Récupère tous les devis d'une entreprise
   */
  static async getQuotes(user: any, filters?: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ quotes: QuoteWithItems[], total: number, page: number, limit: number, totalPages: number }> {
    // Validation des filtres
    if (filters) {
      const validation = QuoteValidation.validateFilters(filters);
      if (validation.error) {
        throw new Error(`Filtres invalides: ${validation.error}`);
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const { quotes, total } = await QuoteRepository.findByCompanyId(user.company_id, {
      ...filters,
      limit,
      offset
    });

    // Récupérer les éléments pour chaque devis
    const quotesWithItems: QuoteWithItems[] = [];
    for (const quote of quotes) {
      const items = await QuoteRepository.getQuoteItems(quote.id);
      quotesWithItems.push({
        ...quote,
        items
      });
    }

    return {
      quotes: quotesWithItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Récupère un devis par ID
   */
  static async getQuote(user: any, quoteId: string): Promise<QuoteWithItems | null> {
    // Validation de l'ID devis
    const idValidation = QuoteValidation.validateQuoteId(quoteId);
    if (idValidation.error) {
      throw new Error(idValidation.error);
    }

    const quote = await QuoteRepository.findById(quoteId, user.company_id);
    if (!quote) {
      return null;
    }

    const items = await QuoteRepository.getQuoteItems(quote.id);
    return {
      ...quote,
      items
    };
  }

  /**
   * Crée un nouveau devis
   */
  static async createQuote(user: any, data: any): Promise<QuoteWithItems> {
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Validation des données avec règles métier
    const validation = QuoteValidation.validateCreateWithBusinessRules(data);
    if (validation.error) {
      throw new Error(`Données invalides: ${validation.error}`);
    }

    const validatedData = validation.value!;

    // Calculer les totaux
    const subtotal = validatedData.items.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.unit_price;
      const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
      return sum + (itemTotal - discount);
    }, 0);

    const tax = subtotal * 0.2; // 20% TVA par défaut
    const total = subtotal + tax;

    // Générer le numéro de devis
    const quoteNumber = await QuoteRepository.generateQuoteNumber(user.company_id);

    const quoteData: CreateQuoteData = {
      client_id: validatedData.client_id,
      company_id: user.company_id,
      status: validatedData.status || 'draft',
      total,
      tax,
      subtotal,
      valid_until: new Date(validatedData.valid_until),
      issue_date: new Date(),
      notes: validatedData.notes
    };

    const quote = await QuoteRepository.create(quoteData);

    // Créer les éléments du devis
    const items = [];
    for (const itemData of validatedData.items) {
      const itemTotal = itemData.quantity * itemData.unit_price;
      const discount = itemData.discount_percent ? (itemTotal * itemData.discount_percent / 100) : 0;
      
      const quoteItemData: CreateQuoteItemData = {
        quote_id: quote.id,
        description: itemData.description,
        quantity: itemData.quantity,
        unit_price: itemData.unit_price,
        total: itemTotal - discount,
        discount_percent: itemData.discount_percent,
        vat_number: itemData.vat_number || 20
      };

      const item = await QuoteRepository.createQuoteItem(quoteItemData);
      items.push(item);
    }

    return {
      ...quote,
      items
    };
  }

  /**
   * Met à jour un devis
   */
  static async updateQuote(userId: string, quoteId: string, data: any): Promise<QuoteWithItems | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Validation de l'ID devis
    const idValidation = QuoteValidation.validateQuoteId(quoteId);
    if (idValidation.error) {
      throw new Error(idValidation.error);
    }

    // Validation des données avec règles métier
    const validation = QuoteValidation.validateUpdateWithBusinessRules(data);
    if (validation.error) {
      throw new Error(`Données invalides: ${validation.error}`);
    }

    const validatedData = validation.value!;

    // Si des éléments sont fournis, recalculer les totaux
    if (validatedData.items) {
      const subtotal = validatedData.items.reduce((sum: number, item: any) => {
        const itemTotal = item.quantity * item.unit_price;
        const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
        return sum + (itemTotal - discount);
      }, 0);

      const tax = subtotal * 0.2; // 20% TVA par défaut
      const total = subtotal + tax;

      validatedData.subtotal = subtotal;
      validatedData.tax = tax;
      validatedData.total = total;
    }

    const updateData: UpdateQuoteData = {
      client_id: validatedData.client_id,
      status: validatedData.status,
      total: validatedData.total,
      tax: validatedData.tax,
      subtotal: validatedData.subtotal,
      valid_until: validatedData.valid_until ? new Date(validatedData.valid_until) : undefined,
      notes: validatedData.notes
    };

    const quote = await QuoteRepository.update(quoteId, updateData, user.company_id);
    if (!quote) {
      return null;
    }

    // Si des éléments sont fournis, les mettre à jour
    if (validatedData.items) {
      // Supprimer les anciens éléments
      await QuoteRepository.deleteQuoteItems(quote.id);

      // Créer les nouveaux éléments
      for (const itemData of validatedData.items) {
        const itemTotal = itemData.quantity * itemData.unit_price;
        const discount = itemData.discount_percent ? (itemTotal * itemData.discount_percent / 100) : 0;
        
        const quoteItemData: CreateQuoteItemData = {
          quote_id: quote.id,
          description: itemData.description,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total: itemTotal - discount,
          discount_percent: itemData.discount_percent,
          vat_number: itemData.vat_number || 20
        };

        await QuoteRepository.createQuoteItem(quoteItemData);
      }
    }

    const items = await QuoteRepository.getQuoteItems(quote.id);
    return {
      ...quote,
      items
    };
  }

  /**
   * Supprime un devis
   */
  static async deleteQuote(userId: string, quoteId: string): Promise<boolean> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return await QuoteRepository.delete(quoteId, user.company_id);
  }

  /**
   * Met à jour le statut d'un devis
   */
  static async updateQuoteStatus(userId: string, quoteId: string, status: string): Promise<QuoteWithItems | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Validation de l'ID devis
    const idValidation = QuoteValidation.validateQuoteId(quoteId);
    if (idValidation.error) {
      throw new Error(idValidation.error);
    }

    // Validation du statut
    const statusValidation = QuoteValidation.validateStatus(status);
    if (statusValidation.error) {
      throw new Error(statusValidation.error);
    }

    const quote = await QuoteRepository.updateStatus(quoteId, status, user.company_id);
    if (!quote) {
      return null;
    }

    const items = await QuoteRepository.getQuoteItems(quote.id);
    return {
      ...quote,
      items
    };
  }

  /**
   * Récupère les statistiques des devis
   */
  static async getQuoteStats(userId: string): Promise<{
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
    converted: number;
    totalValue: number;
    averageQuote: number;
  }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return await QuoteRepository.getStats(user.company_id);
  }

  /**
   * Convertit un devis en facture
   */
  static async convertToInvoice(userId: string, quoteId: string): Promise<{ quote: QuoteWithItems, invoice: any }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const quote = await this.getQuote(userId, quoteId);
    if (!quote) {
      throw new Error('Devis non trouvé');
    }

    if (quote.status !== 'accepted') {
      throw new Error('Seuls les devis acceptés peuvent être convertis en facture');
    }

    // TODO: Implémenter la création de facture
    // Pour l'instant, on retourne une structure de facture simulée
    const invoice = {
      id: `inv_${Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
      client_id: quote.client_id,
      company_id: quote.company_id,
      status: 'draft',
      total: quote.total,
      tax: quote.tax,
      subtotal: quote.subtotal,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      issue_date: new Date(),
      items: quote.items,
      notes: `Facture générée à partir du devis ${quote.quote_number}`,
      created_at: new Date()
    };

    // Marquer le devis comme converti
    const updatedQuote = await this.updateQuoteStatus(userId, quoteId, 'converted');

    return {
      quote: updatedQuote!,
      invoice
    };
  }
}
