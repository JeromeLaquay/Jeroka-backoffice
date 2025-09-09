# Services API - Documentation

Ce dossier contient tous les services pour interagir avec l'API backend. Chaque service est spécialisé dans un domaine métier spécifique.

## Structure des services

### Services principaux

- **`api.ts`** - Service principal avec configuration axios et méthodes d'authentification
- **`users.ts`** - Gestion des utilisateurs
- **`products.ts`** - Gestion des produits
- **`invoices.ts`** - Gestion des factures
- **`quotes.ts`** - Gestion des devis
- **`clients.ts`** - Gestion des clients
- **`messages.ts`** - Gestion des messages
- **`publications.ts`** - Gestion des publications
- **`emails.ts`** - Gestion des emails
- **`calendar.ts`** - Gestion du calendrier
- **`announcements.ts`** - Gestion des annonces
- **`dashboard.ts`** - Données du tableau de bord
- **`accounting.ts`** - Gestion comptable
- **`orders.ts`** - Gestion des commandes
- **`settings.ts`** - Gestion des paramètres

## Utilisation

### Import des services

```typescript
// Import d'un service spécifique
import { userService } from '@/services/users'
import { productService } from '@/services/products'

// Import de tous les services
import { 
  userService, 
  productService, 
  invoiceService, 
  quoteService 
} from '@/services'
```

### Exemples d'utilisation

#### Gestion des utilisateurs

```typescript
import { userService } from '@/services/users'

// Récupérer la liste des utilisateurs
const response = await userService.getUsers({ page: 1, limit: 10 })
if (response.success) {
  console.log(response.data.users)
}

// Créer un nouvel utilisateur
const newUser = await userService.createUser({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user'
})

// Mettre à jour un utilisateur
await userService.updateUser('1', {
  firstName: 'Jane',
  lastName: 'Smith'
})

// Activer/désactiver un utilisateur
await userService.updateUserStatus('1', false)
```

#### Gestion des produits

```typescript
import { productService } from '@/services/products'

// Récupérer les produits
const products = await productService.getProducts({ 
  category: 'electronics',
  limit: 20 
})

// Créer un produit
const newProduct = await productService.createProduct({
  name: 'Nouveau produit',
  description: 'Description du produit',
  price: 99.99,
  stock: 10,
  category: 'electronics'
})

// Mettre à jour le stock
await productService.addStock('1', 5) // Ajouter 5 unités
await productService.removeStock('1', 2) // Retirer 2 unités
await productService.setStock('1', 15) // Définir le stock à 15
```

#### Gestion des factures

```typescript
import { invoiceService } from '@/services/invoices'

// Récupérer les factures
const invoices = await invoiceService.getInvoices({ 
  status: 'pending',
  limit: 10 
})

// Créer une facture
const newInvoice = await invoiceService.createInvoice({
  clientId: 1,
  items: [
    {
      description: 'Service de développement',
      quantity: 1,
      unitPrice: 500.00,
      total: 500.00
    }
  ],
  dueDate: '2024-02-15',
  notes: 'Facture pour services rendus'
})

// Marquer comme payée
await invoiceService.markAsPaid('1')
```

#### Gestion des devis

```typescript
import { quoteService } from '@/services/quotes'

// Récupérer les devis
const quotes = await quoteService.getQuotes({ 
  status: 'sent',
  limit: 10 
})

// Créer un devis
const newQuote = await quoteService.createQuote({
  clientId: 1,
  items: [
    {
      description: 'Service de développement',
      quantity: 1,
      unitPrice: 500.00,
      total: 500.00
    }
  ],
  validUntil: '2024-03-15',
  notes: 'Devis valable 30 jours'
})

// Envoyer un devis
await quoteService.sendQuote('1')

// Convertir en facture
await quoteService.convertQuoteToInvoice('1')
```

## Gestion des erreurs

Tous les services retournent une réponse standardisée :

```typescript
interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: {
    message: string
    code: string
    statusCode: number
  }
}
```

### Exemple de gestion d'erreur

```typescript
try {
  const response = await userService.getUsers()
  if (response.success) {
    // Traitement du succès
    console.log(response.data)
  } else {
    // Erreur API
    console.error(response.error?.message)
  }
} catch (error: any) {
  // Erreur réseau ou autre
  console.error('Erreur:', error.message)
}
```

## Configuration

### Variables d'environnement

Les services utilisent les variables d'environnement suivantes :

- `VITE_API_URL` - URL de base de l'API (défaut: `http://localhost:3002/api/v1`)

### Authentification

L'authentification est gérée automatiquement par le service `api.ts`. Le token JWT est stocké dans le localStorage et ajouté automatiquement aux requêtes.

### Intercepteurs

Le service principal inclut des intercepteurs pour :
- Ajouter automatiquement le token d'authentification
- Gérer le refresh automatique des tokens
- Standardiser les erreurs
- Rediriger vers la page de connexion en cas d'expiration

## Types TypeScript

Tous les services incluent des types TypeScript complets pour une meilleure expérience de développement :

```typescript
import type { 
  User, 
  Product, 
  Invoice, 
  Quote,
  CreateUserRequest,
  UpdateProductRequest 
} from '@/services'
```

## Exemple complet

Voir le fichier `components/examples/ServiceUsageExample.vue` pour un exemple complet d'utilisation de tous les services.
