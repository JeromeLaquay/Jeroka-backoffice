import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    total: 0,
    itemCount: 0
  }),

  getters: {
    cartItems: (state) => state.items,
    cartTotal: (state) => state.total,
    cartItemCount: (state) => state.itemCount,
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    // Initialiser le panier depuis le localStorage
    initCart() {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        this.items = cart.items || []
        this.calculateTotals()
      }
    },

    // Ajouter un produit au panier
    addToCart(product, quantity = 1) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          stock: product.stock || 0
        })
      }
      
      this.calculateTotals()
      this.saveToLocalStorage()
    },

    // Supprimer un produit du panier
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.calculateTotals()
      this.saveToLocalStorage()
    },

    // Mettre à jour la quantité d'un produit
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = Math.min(quantity, item.stock)
          this.calculateTotals()
          this.saveToLocalStorage()
        }
      }
    },

    // Vider le panier
    clearCart() {
      this.items = []
      this.total = 0
      this.itemCount = 0
      this.saveToLocalStorage()
    },

    // Calculer les totaux
    calculateTotals() {
      this.itemCount = this.items.reduce((total, item) => total + item.quantity, 0)
      this.total = this.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },

    // Sauvegarder dans le localStorage
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify({
        items: this.items,
        total: this.total,
        itemCount: this.itemCount
      }))
    },

    // Vérifier si un produit est dans le panier
    isInCart(productId) {
      return this.items.some(item => item.id === productId)
    },

    // Obtenir la quantité d'un produit dans le panier
    getItemQuantity(productId) {
      const item = this.items.find(item => item.id === productId)
      return item ? item.quantity : 0
    }
  }
})
