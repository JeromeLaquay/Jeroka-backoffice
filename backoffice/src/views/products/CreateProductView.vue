<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <router-link
          to="/produits"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ isEdit ? 'Modifier le produit' : 'Nouveau produit' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ isEdit ? `Modification du produit ${product?.name}` : 'Ajoutez un nouveau produit à votre catalogue' }}
          </p>
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button
          type="button"
          @click="$router.go(-1)"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          type="submit"
          form="product-form"
          :disabled="loading || !isFormValid"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="mr-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </span>
          {{ isEdit ? 'Mettre à jour' : 'Créer le produit' }}
        </button>
      </div>
    </div>

    <form id="product-form" @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informations générales -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Informations générales
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du produit *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Entrez le nom du produit"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Description du produit"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU *
                  </label>
                  <div class="flex">
                    <input
                      v-model="form.sku"
                      type="text"
                      required
                      class="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="SKU du produit"
                    />
                    <button
                      type="button"
                      @click="generateSKU"
                      class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-500"
                    >
                      <ArrowPathIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code-barres
                  </label>
                  <input
                    v-model="form.barcode"
                    type="text"
                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Code-barres"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie *
                  </label>
                  <select
                    v-model="form.categoryId"
                    required
                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Marque
                  </label>
                  <input
                    v-model="form.brand"
                    type="text"
                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Marque du produit"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.isService"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Il s'agit d'un service (pas de stock physique)
                </label>
              </div>
            </div>
          </div>

          <!-- Prix et TVA -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Prix et TVA
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix unitaire HT *
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="block w-full pr-8 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="0.00"
                  />
                  <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">€</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix d'achat HT
                </label>
                <div class="relative">
                  <input
                    v-model.number="form.costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    class="block w-full pr-8 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="0.00"
                  />
                  <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">€</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taux de TVA
                </label>
                <select
                  v-model.number="form.vatRate"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option :value="0">0%</option>
                  <option :value="5.5">5,5%</option>
                  <option :value="10">10%</option>
                  <option :value="20">20%</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Stock (si produit physique) -->
          <div v-if="!form.isService" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Gestion du stock
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unité *
                </label>
                <select
                  v-model="form.unit"
                  required
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="pièce">Pièce</option>
                  <option value="kg">Kilogramme</option>
                  <option value="g">Gramme</option>
                  <option value="l">Litre</option>
                  <option value="ml">Millilitre</option>
                  <option value="m">Mètre</option>
                  <option value="cm">Centimètre</option>
                  <option value="m²">Mètre carré</option>
                  <option value="m³">Mètre cube</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock actuel
                </label>
                <input
                  v-model.number="form.stock.current"
                  type="number"
                  min="0"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock minimum
                </label>
                <input
                  v-model.number="form.stock.minimum"
                  type="number"
                  min="0"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock maximum
                </label>
                <input
                  v-model.number="form.stock.maximum"
                  type="number"
                  min="0"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <!-- Statut et options -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Statut et options
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  v-model="form.status"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="discontinued">Arrêté</option>
                </select>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Produit vedette
                </label>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Tags
            </h3>
            
            <div class="space-y-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="Ajouter un tag"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                @keyup.enter="addTag"
              />
              
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon class="h-3 w-3" />
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeftIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { productService } from '@/services/products'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const product = ref(null)
const categories = ref([])
const newTag = ref('')

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  description: '',
  sku: '',
  barcode: '',
  categoryId: '',
  brand: '',
  unitPrice: 0,
  costPrice: 0,
  vatRate: 20,
  unit: 'pièce',
  stock: {
    current: 0,
    minimum: 0,
    maximum: null
  },
  status: 'active',
  featured: false,
  isService: false,
  tags: []
})

const isFormValid = computed(() => {
  return form.name && form.sku && form.categoryId && form.unitPrice > 0
})

// Méthodes
const loadCategories = async () => {
  try {
    const response = await productService.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
  }
}

const loadProduct = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    const response = await productService.getProduct(route.params.id as string)
    product.value = response.data
    
    // Remplir le formulaire
    Object.assign(form, {
      name: product.value.name,
      description: product.value.description || '',
      sku: product.value.sku,
      barcode: product.value.barcode || '',
      categoryId: product.value.category,
      brand: product.value.brand || '',
      unitPrice: product.value.unitPrice,
      costPrice: product.value.costPrice || 0,
      vatRate: product.value.vatRate || 20,
      unit: product.value.unit,
      stock: {
        current: product.value.stock?.current || 0,
        minimum: product.value.stock?.minimum || 0,
        maximum: product.value.stock?.maximum || null
      },
      status: product.value.status,
      featured: product.value.featured,
      isService: product.value.isService,
      tags: [...(product.value.tags || [])]
    })
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error)
    router.push('/produits')
  } finally {
    loading.value = false
  }
}

const generateSKU = async () => {
  try {
    const response = await productService.generateSKU(form.categoryId)
    form.sku = response.data.sku
  } catch (error) {
    console.error('Erreur lors de la génération du SKU:', error)
    // Générer un SKU simple en fallback
    form.sku = `PRD-${Date.now()}`
  }
}

const addTag = () => {
  if (newTag.value && !form.tags.includes(newTag.value)) {
    form.tags.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return

  try {
    loading.value = true
    
    const data = {
      ...form,
      stock: form.isService ? undefined : form.stock
    }

    if (isEdit.value) {
      await productService.updateProduct(route.params.id as string, data)
    } else {
      await productService.createProduct(data)
    }

    router.push('/produits')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadCategories()
  loadProduct()
})
</script>
