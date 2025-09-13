import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/auth/login',
      redirect: '/login'
    },
    {
      path: '/auth/register',
      redirect: '/register'
    },
    {
      path: '/',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: '/clients',
          name: 'Clients',
          component: () => import('../views/clients/ClientsView.vue')
        },
        {
          path: '/clients/create',
          name: 'CreateClient',
          component: () => import('../views/clients/CreateClientView.vue')
        },
        {
          path: '/clients/:id',
          name: 'ClientDetail',
          component: () => import('../views/clients/ClientDetailView.vue')
        },
        {
          path: '/messages',
          name: 'Messages',
          component: () => import('../views/messages/MessagesView.vue')
        },
        {
          path: '/publications',
          name: 'Publications',
          component: () => import('../views/publications/PublicationsView.vue')
        },
        {
          path: '/factures',
          name: 'Factures',
          component: () => import('../views/invoices/InvoicesView.vue')
        },
        {
          path: '/factures/create',
          name: 'CreateInvoice',
          component: () => import('../views/invoices/CreateInvoiceView.vue')
        },
        {
          path: '/factures/:id',
          name: 'InvoiceDetail',
          component: () => import('../views/invoices/InvoiceDetailView.vue')
        },
        {
          path: '/factures/:id/edit',
          name: 'EditInvoice',
          component: () => import('../views/invoices/CreateInvoiceView.vue')
        },
        {
          path: '/commandes',
          name: 'Orders',
          component: () => import('../views/orders/OrdersView.vue')
        },
        {
          path: '/commandes/create',
          name: 'CreateOrder',
          component: () => import('../views/orders/CreateOrderView.vue')
        },
        {
          path: '/commandes/:id',
          name: 'OrderDetail',
          component: () => import('../views/orders/OrderDetailView.vue')
        },
        {
          path: '/commandes/:id/edit',
          name: 'EditOrder',
          component: () => import('../views/orders/CreateOrderView.vue')
        },
        {
          path: '/devis',
          name: 'Devis',
          component: () => import('../views/quotes/QuotesView.vue')
        },
        {
          path: '/devis/create',
          name: 'CreateQuote',
          component: () => import('../views/quotes/CreateQuoteView.vue')
        },
        {
          path: '/devis/:id',
          name: 'QuoteDetail',
          component: () => import('../views/quotes/QuoteDetailView.vue')
        },
        {
          path: '/devis/:id/edit',
          name: 'EditQuote',
          component: () => import('../views/quotes/CreateQuoteView.vue')
        },
        {
          path: '/produits',
          name: 'Produits',
          component: () => import('../views/products/ProductsView.vue')
        },
        {
          path: '/produits/create',
          name: 'CreateProduct',
          component: () => import('../views/products/CreateProductView.vue')
        },
        {
          path: '/produits/:id',
          name: 'ProductDetail',
          component: () => import('../views/products/ProductDetailView.vue')
        },
        {
          path: '/produits/:id/edit',
          name: 'EditProduct',
          component: () => import('../views/products/CreateProductView.vue')
        },
        {
          path: '/comptabilite',
          name: 'Comptabilite',
          component: () => import('../views/accounting/AccountingView.vue')
        },
        {
          path: '/comptabilite/transactions',
          name: 'ComptabiliteTransactions',
          component: () => import('../views/accounting/TransactionsView.vue')
        },
        {
          path: '/parametres',
          name: 'Parametres',
          component: () => import('../views/settings/SettingsView.vue')
        },
        {
          path: '/emails',
          name: 'Emails',
          component: () => import('../views/Emails/EmailsView.vue')
        },
        {
          path: '/emails/documents',
          name: 'EmailDocuments',
          component: () => import('../views/Emails/DocumentsView.vue')
        },
        {
          path: '/annonces',
          name: 'Annonces',
          component: () => import('../views/announcements/AnnouncementsView.vue')
        },
        {
          path: '/calendrier',
          name: 'Calendrier',
          component: () => import('../views/calendar/CalendarView.vue')
        }
      ]
    }
  ]
})
// Guard de navigation pour l'authentification
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Si on est en train de charger l'auth, attendre
  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve(void 0)
        }
      })
    })
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
