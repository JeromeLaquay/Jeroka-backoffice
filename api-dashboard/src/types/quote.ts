export interface Quote {
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
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount_percent?: number;
  vat_number?: number;
  created_at: Date;
}

export interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}

export interface CreateQuoteData {
  client_id: string;
  clientId?: string; // Support camelCase
  company_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  total: number;
  tax: number;
  subtotal: number;
  valid_until: Date;
  validUntil?: Date; // Support camelCase
  issue_date: Date;
  notes?: string;
}

export interface UpdateQuoteData {
  client_id?: string;
  clientId?: string; // Support camelCase
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  total?: number;
  tax?: number;
  subtotal?: number;
  valid_until?: Date;
  validUntil?: Date; // Support camelCase
  notes?: string;
}

export interface CreateQuoteItemData {
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  unitPrice?: number; // Support camelCase
  total: number;
  discount_percent?: number;
  discountPercent?: number; // Support camelCase
  vat_number?: number;
  vatRate?: number; // Support camelCase
}

export interface CreateQuoteRequest {
  client_id: string;
  clientId?: string; // Support camelCase
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    unitPrice?: number; // Support camelCase
    discount_percent?: number;
    discountPercent?: number; // Support camelCase
    vat_number?: number;
    vatRate?: number; // Support camelCase
  }>;
  valid_until: string;
  validUntil?: string; // Support camelCase
  notes?: string;
  status?: 'draft' | 'sent';
}

export interface UpdateQuoteRequest {
  client_id?: string;
  clientId?: string; // Support camelCase
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    unitPrice?: number; // Support camelCase
    discount_percent?: number;
    discountPercent?: number; // Support camelCase
    vat_number?: number;
    vatRate?: number; // Support camelCase
  }>;
  valid_until?: string;
  validUntil?: string; // Support camelCase
  notes?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
}

export interface QuoteStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  converted: number;
  totalValue: number;
  averageQuote: number;
}

export interface QuotesListResponse {
  quotes: QuoteWithItems[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConvertQuoteResponse {
  quote: QuoteWithItems;
  invoice: any; // Invoice type from invoice service
}
