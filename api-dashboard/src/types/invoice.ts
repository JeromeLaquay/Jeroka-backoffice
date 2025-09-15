export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount_percent?: number;
  vat_number?: number;
  created_at: Date;
}

export interface Invoice {
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
  items?: InvoiceItem[];
}

export interface CreateInvoiceData {
  client_id: string;
  company_id: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  tax: number;
  subtotal: number;
  due_date: Date;
  issue_date: Date;
  notes?: string;
}

export interface UpdateInvoiceData {
  client_id?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total?: number;
  tax?: number;
  subtotal?: number;
  due_date?: Date;
  paid_date?: Date;
  notes?: string;
  updated_at?: Date;
}

export interface CreateInvoiceItemData {
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  discount_percent?: number;
  vat_number?: number;
}

export interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  cancelled: number;
  totalRevenue: number;
  averageInvoice: number;
}

export interface InvoicesListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface ConvertQuoteToInvoiceRequest {
  quote_id: string;
  due_date?: string;
  notes?: string;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}
