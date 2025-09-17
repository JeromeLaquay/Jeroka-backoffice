import { InvoiceRepository, CreateInvoiceData, UpdateInvoiceData, CreateInvoiceItemData } from '../repositories/invoiceRepository';
import UserRepository from '../repositories/userRepository';
import { ClientRepository } from '../repositories/personRepository';
import { InvoiceValidation } from '../validations/invoiceValidation';

export interface InvoiceWithItems {
  id: string;
  invoice_number: string;
  client_id: string;
  company_id: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  tax: number;
  subtotal: number;
  due_date: Date;
  issue_date: Date;
  paid_date?: Date;
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

export interface CreateInvoiceRequest {
  client_id: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    vat_number?: number;
  }>;
  due_date: string;
  notes?: string;
  status?: 'draft' | 'sent';
}

export interface UpdateInvoiceRequest {
  client_id?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    vat_number?: number;
  }>;
  due_date?: string;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal?: number;
  tax?: number;
  total?: number;
}

export class InvoiceService {
  /**
   * Récupère toutes les factures d'une entreprise
   */
  static async getInvoices(userId: string, filters?: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ invoices: InvoiceWithItems[], total: number, page: number, limit: number, totalPages: number }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Validation des filtres
    if (filters) {
      const validation = InvoiceValidation.validateFilters(filters);
      if (validation.error) {
        throw new Error(`Filtres invalides: ${validation.error}`);
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const { invoices, total } = await InvoiceRepository.findByCompanyId(user.company_id, {
      ...filters,
      limit,
      offset
    });

    // Récupérer les éléments pour chaque facture
    const invoicesWithItems: InvoiceWithItems[] = [];
    for (const invoice of invoices) {
      const items = await InvoiceRepository.getInvoiceItems(invoice.id);
      invoicesWithItems.push({
        ...invoice,
        items
      });
    }

    return {
      invoices: invoicesWithItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Récupère une facture par ID
   */
  static async getInvoice(user: any, invoiceId: string): Promise<InvoiceWithItems | null> {
    // Validation de l'ID facture
    const idValidation = InvoiceValidation.validateInvoiceId(invoiceId);
    if (idValidation.error) {
      throw new Error(idValidation.error);
    }
    
    const invoice = await InvoiceRepository.findById(invoiceId, user.company_id);
    if(!invoice) {
      throw new Error('Facture non trouvée');
      return null;
    }
    const client = await ClientRepository.getClientById(invoice.client_id, user.company_id);
    if(!client) {
      throw new Error('Client non trouvé');
      return null;
    }
    if (!invoice) {
        throw new Error('Facture non trouvée');
        return null;
    }

    const items = await InvoiceRepository.getInvoiceItems(invoice.id);
    return {
      ...invoice,
      client_name: client.company_name || client.first_name + ' ' + client.last_name,
      items
    };
  }

  /**
   * Crée une nouvelle facture
   */
  static async createInvoice(userId: string, data: CreateInvoiceRequest): Promise<InvoiceWithItems> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Validation des données avec règles métier
    const validation = InvoiceValidation.validateCreateWithBusinessRules(data);
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

    // Générer le numéro de facture
    const invoiceNumber = await InvoiceRepository.generateInvoiceNumber(user.company_id);

    const invoiceData: CreateInvoiceData = {
      client_id: validatedData.client_id,
      company_id: user.company_id,
      status: validatedData.status || 'draft',
      total,
      tax,
      subtotal,
      due_date: new Date(validatedData.due_date),
      issue_date: new Date(),
      notes: validatedData.notes
    };

    const invoice = await InvoiceRepository.create(invoiceData);

    // Créer les éléments de la facture
    const items = [];
    for (const itemData of validatedData.items) {
      const itemTotal = itemData.quantity * itemData.unit_price;
      const discount = itemData.discount_percent ? (itemTotal * itemData.discount_percent / 100) : 0;
      
      const invoiceItemData: CreateInvoiceItemData = {
        invoice_id: invoice.id,
        description: itemData.description,
        quantity: itemData.quantity,
        unit_price: itemData.unit_price,
        total: itemTotal - discount,
        discount_percent: itemData.discount_percent,
        vat_number: itemData.vat_number || 20
      };

      const item = await InvoiceRepository.createInvoiceItem(invoiceItemData);
      items.push(item);
    }

    return {
      ...invoice,
      items
    };
  }

  /**
   * Met à jour une facture
   */
  static async updateInvoice(userId: string, invoiceId: string, data: UpdateInvoiceRequest): Promise<InvoiceWithItems | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si des éléments sont fournis, recalculer les totaux
    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0;
        return sum + (itemTotal - discount);
      }, 0);

      const tax = subtotal * 0.2; // 20% TVA par défaut
      const total = subtotal + tax;

      data.subtotal = subtotal;
      data.tax = tax;
      data.total = total;
    }

    const updateData: UpdateInvoiceData = {
      client_id: data.client_id,
      status: data.status,
      total: data.total,
      tax: data.tax,
      subtotal: data.subtotal,
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      notes: data.notes
    };

    const invoice = await InvoiceRepository.update(invoiceId, updateData, user.company_id);
    if (!invoice) {
      return null;
    }

    // Si des éléments sont fournis, les mettre à jour
    if (data.items) {
      // Supprimer les anciens éléments
      await InvoiceRepository.deleteInvoiceItems(invoice.id);

      // Créer les nouveaux éléments
      for (const itemData of data.items) {
        const itemTotal = itemData.quantity * itemData.unit_price;
        const discount = itemData.discount_percent ? (itemTotal * itemData.discount_percent / 100) : 0;
        
        const invoiceItemData: CreateInvoiceItemData = {
          invoice_id: invoice.id,
          description: itemData.description,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total: itemTotal - discount,
          discount_percent: itemData.discount_percent,
          vat_number: itemData.vat_number || 20
        };

        await InvoiceRepository.createInvoiceItem(invoiceItemData);
      }
    }

    const items = await InvoiceRepository.getInvoiceItems(invoice.id);
    return {
      ...invoice,
      items
    };
  }

  /**
   * Supprime une facture
   */
  static async deleteInvoice(userId: string, invoiceId: string): Promise<boolean> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return await InvoiceRepository.delete(invoiceId, user.company_id);
  }

  /**
   * Met à jour le statut d'une facture
   */
  static async updateInvoiceStatus(userId: string, invoiceId: string, status: string): Promise<InvoiceWithItems | null> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const invoice = await InvoiceRepository.updateStatus(invoiceId, status, user.company_id);
    if (!invoice) {
      return null;
    }

    const items = await InvoiceRepository.getInvoiceItems(invoice.id);
    return {
      ...invoice,
      items
    };
  }

  /**
   * Récupère les statistiques des factures
   */
  static async getInvoiceStats(userId: string): Promise<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalRevenue: number;
    averageInvoice: number;
  }> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return await InvoiceRepository.getStats(user.company_id);
  }

  /**
   * Marque une facture comme payée
   */
  static async markAsPaid(userId: string, invoiceId: string): Promise<InvoiceWithItems | null> {
    return await this.updateInvoiceStatus(userId, invoiceId, 'paid');
  }

  /**
   * Marque une facture comme envoyée
   */
  static async markAsSent(userId: string, invoiceId: string): Promise<InvoiceWithItems | null> {
    return await this.updateInvoiceStatus(userId, invoiceId, 'sent');
  }

  /**
   * Annule une facture
   */
  static async cancelInvoice(userId: string, invoiceId: string): Promise<InvoiceWithItems | null> {
    return await this.updateInvoiceStatus(userId, invoiceId, 'cancelled');
  }

  /**
   * Marque les factures en retard
   */
  static async markOverdueInvoices(userId: string): Promise<number> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return await InvoiceRepository.markOverdueInvoices(user.company_id);
  }

  /**
   * Crée une facture à partir d'un devis
   */
  static async createFromQuote(userId: string, quoteId: string): Promise<InvoiceWithItems> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // TODO: Récupérer le devis depuis le service des devis
    // Pour l'instant, on simule la création
    const invoiceData: CreateInvoiceData = {
      client_id: 'temp_client_id', // À remplacer par l'ID du client du devis
      company_id: user.company_id,
      status: 'draft',
      total: 0, // À calculer à partir du devis
      tax: 0,
      subtotal: 0,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      issue_date: new Date(),
      notes: `Facture créée à partir du devis ${quoteId}`
    };

    const invoice = await InvoiceRepository.create(invoiceData);
    return {
      ...invoice,
      items: []
    };
  }
}
