// Export all services for easy importing
export { default as apiService } from './api'
export { default as userService } from './users'
export { default as productService } from './products'
export { default as invoiceService } from './invoices'
export { default as quoteService } from './quotes'
export { default as clientService } from './persons'
export { default as messageService } from './messages'
export { default as publicationService } from './publications'
export { default as emailService } from './emails'
export { default as calendarService } from './calendar'
export { default as announcementService } from './announcements'
export { default as dashboardService } from './dashboard'
export { default as accountingService } from './accounting'
export { default as orderService } from './orders'
export { default as settingsService } from './settings'

// Export types
export type { ApiResponse, LoginRequest, RegisterRequest, LoginResponse, User } from './api'
export type { 
  User as UserType, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserStats, 
  UsersListResponse 
} from './users'
export type { 
  Product, 
  ProductCategory, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductStats, 
  ProductsListResponse 
} from './products'
export type { 
  Invoice, 
  InvoiceItem, 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest, 
  InvoiceStats, 
  InvoicesListResponse 
} from './invoices'
export type { 
  Quote, 
  QuoteItem, 
  CreateQuoteRequest, 
  UpdateQuoteRequest, 
  QuoteStats, 
  QuotesListResponse, 
  ConvertQuoteResponse 
} from './quotes'
