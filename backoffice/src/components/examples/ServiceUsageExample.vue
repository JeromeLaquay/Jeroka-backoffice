<template>
  <div class="service-usage-example">
    <h2>Exemple d'utilisation des services</h2>
    
    <!-- Utilisateurs -->
    <div class="section">
      <h3>Gestion des utilisateurs</h3>
      <button @click="loadUsers">Charger les utilisateurs</button>
      <button @click="loadUserStats">Charger les statistiques</button>
      <div v-if="users.length > 0">
        <h4>Utilisateurs ({{ users.length }})</h4>
        <ul>
          <li v-for="user in users" :key="user.id">
            {{ user.firstName }} {{ user.lastName }} - {{ user.email }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Produits -->
    <div class="section">
      <h3>Gestion des produits</h3>
      <button @click="loadProducts">Charger les produits</button>
      <button @click="loadProductStats">Charger les statistiques</button>
      <div v-if="products.length > 0">
        <h4>Produits ({{ products.length }})</h4>
        <ul>
          <li v-for="product in products" :key="product.id">
            {{ product.name }} - {{ product.price }}€ (Stock: {{ product.stock }})
          </li>
        </ul>
      </div>
    </div>

    <!-- Factures -->
    <div class="section">
      <h3>Gestion des factures</h3>
      <button @click="loadInvoices">Charger les factures</button>
      <button @click="loadInvoiceStats">Charger les statistiques</button>
      <div v-if="invoices.length > 0">
        <h4>Factures ({{ invoices.length }})</h4>
        <ul>
          <li v-for="invoice in invoices" :key="invoice.id">
            {{ invoice.invoiceNumber }} - {{ invoice.total }}€ ({{ invoice.status }})
          </li>
        </ul>
      </div>
    </div>

    <!-- Devis -->
    <div class="section">
      <h3>Gestion des devis</h3>
      <button @click="loadQuotes">Charger les devis</button>
      <button @click="loadQuoteStats">Charger les statistiques</button>
      <div v-if="quotes.length > 0">
        <h4>Devis ({{ quotes.length }})</h4>
        <ul>
          <li v-for="quote in quotes" :key="quote.id">
            {{ quote.quoteNumber }} - {{ quote.total }}€ ({{ quote.status }})
          </li>
        </ul>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="error" class="error">
      <h4>Erreur:</h4>
      <p>{{ error }}</p>
    </div>

    <!-- Messages de succès -->
    <div v-if="success" class="success">
      <h4>Succès:</h4>
      <p>{{ success }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  userService, 
  productService, 
  invoiceService, 
  quoteService,
  type User,
  type Product,
  type Invoice,
  type Quote
} from '@/services'

// État réactif
const users = ref<User[]>([])
const products = ref<Product[]>([])
const invoices = ref<Invoice[]>([])
const quotes = ref<Quote[]>([])
const error = ref<string>('')
const success = ref<string>('')

// Méthodes pour charger les données
const loadUsers = async () => {
  try {
    error.value = ''
    const response = await userService.getUsers({ limit: 10 })
    if (response.success && response.data) {
      users.value = response.data.users
      success.value = `Utilisateurs chargés: ${response.data.total} trouvés`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des utilisateurs'
  }
}

const loadUserStats = async () => {
  try {
    error.value = ''
    const response = await userService.getUserStats()
    if (response.success && response.data) {
      success.value = `Statistiques utilisateurs: ${response.data.total} total, ${response.data.active} actifs`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des statistiques utilisateurs'
  }
}

const loadProducts = async () => {
  try {
    error.value = ''
    const response = await productService.getProducts({ limit: 10 })
    if (response.success && response.data) {
      products.value = response.data.products
      success.value = `Produits chargés: ${response.data.total} trouvés`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des produits'
  }
}

const loadProductStats = async () => {
  try {
    error.value = ''
    const response = await productService.getProductStats()
    if (response.success && response.data) {
      success.value = `Statistiques produits: ${response.data.total} total, ${response.data.lowStock} en rupture`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des statistiques produits'
  }
}

const loadInvoices = async () => {
  try {
    error.value = ''
    const response = await invoiceService.getInvoices({ limit: 10 })
    if (response.success && response.data) {
      invoices.value = response.data.invoices
      success.value = `Factures chargées: ${response.data.total} trouvées`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des factures'
  }
}

const loadInvoiceStats = async () => {
  try {
    error.value = ''
    const response = await invoiceService.getInvoiceStats()
    if (response.success && response.data) {
      success.value = `Statistiques factures: ${response.data.total} total, ${response.data.totalRevenue}€ de revenus`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des statistiques factures'
  }
}

const loadQuotes = async () => {
  try {
    error.value = ''
    const response = await quoteService.getQuotes({ limit: 10 })
    if (response.success && response.data) {
      quotes.value = response.data.quotes
      success.value = `Devis chargés: ${response.data.total} trouvés`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des devis'
  }
}

const loadQuoteStats = async () => {
  try {
    error.value = ''
    const response = await quoteService.getQuoteStats()
    if (response.success && response.data) {
      success.value = `Statistiques devis: ${response.data.total} total, ${response.data.accepted} acceptés`
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des statistiques devis'
  }
}

// Charger les données au montage du composant
onMounted(() => {
  loadUsers()
  loadProducts()
  loadInvoices()
  loadQuotes()
})
</script>

<style scoped>
.service-usage-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.section h3 {
  margin-top: 0;
  color: #333;
}

.section h4 {
  margin-bottom: 10px;
  color: #666;
}

button {
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px;
  margin-bottom: 5px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}
</style>
