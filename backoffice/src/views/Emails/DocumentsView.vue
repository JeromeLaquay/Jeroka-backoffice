<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents Email</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les documents extraits et analysés depuis vos emails
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="showUploadModal = true"
          class="btn-secondary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Importer un document
        </button>
        <button
          @click="analyzeAllDocuments"
          :disabled="analyzing"
          class="btn-primary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ analyzing ? 'Analyse en cours...' : 'Analyser tous' }}
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-4">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total documents
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ documents.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Analysés
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ analyzedCount }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  En attente
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ pendingCount }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Factures détectées
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ invoiceCount }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="form-label">Rechercher</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-input"
            placeholder="Nom du fichier, contenu..."
          />
        </div>
        <div>
          <label class="form-label">Type de document</label>
          <select v-model="typeFilter" class="form-input">
            <option value="">Tous les types</option>
            <option value="invoice">Facture</option>
            <option value="quote">Devis</option>
            <option value="contract">Contrat</option>
            <option value="receipt">Reçu</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label class="form-label">Statut d'analyse</label>
          <select v-model="statusFilter" class="form-input">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="analyzing">En cours</option>
            <option value="analyzed">Analysé</option>
            <option value="error">Erreur</option>
          </select>
        </div>
        <div>
          <label class="form-label">Date</label>
          <input
            v-model="dateFilter"
            type="date"
            class="form-input"
          />
        </div>
      </div>
    </div>

    <!-- Liste des documents -->
    <div class="space-y-4" v-if="filteredDocuments.length > 0">
      <div 
        v-for="document in filteredDocuments" 
        :key="document.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start space-x-4">
          <!-- Icône du type de document -->
          <div class="flex-shrink-0">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center',
              getDocumentTypeColor(document.type)
            ]">
              <component :is="getDocumentTypeIcon(document.type)" class="h-5 w-5" />
            </div>
          </div>

          <!-- Contenu principal -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ document.filename }}
                </h3>
                <span :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getStatusBadgeClass(document.analysisStatus)
                ]">
                  {{ getStatusLabel(document.analysisStatus) }}
                </span>
                <span v-if="document.type" :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getTypeBadgeClass(document.type)
                ]">
                  {{ getTypeLabel(document.type) }}
                </span>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center space-x-2">
                <button
                  @click="downloadDocument(document.id)"
                  class="text-primary-600 hover:text-primary-900 text-sm"
                >
                  Télécharger
                </button>
                <button
                  v-if="document.analysisStatus === 'pending'"
                  @click="analyzeDocument(document.id)"
                  class="text-success-600 hover:text-success-900 text-sm"
                >
                  Analyser
                </button>
                <button
                  v-if="document.analysisStatus === 'analyzed' && document.analysis"
                  @click="viewAnalysis(document)"
                  class="text-info-600 hover:text-info-900 text-sm"
                >
                  Voir l'analyse
                </button>
                <button
                  @click="deleteDocument(document.id)"
                  class="text-danger-600 hover:text-danger-900 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ formatFileSize(document.size) }}</span>
              <span>{{ formatDate(document.createdAt) }}</span>
              <span v-if="document.extractedFrom">
                Extrait de l'email : {{ document.extractedFrom.subject }}
              </span>
            </div>

            <!-- Aperçu de l'analyse -->
            <div v-if="document.analysisStatus === 'analyzed' && document.analysis" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div v-if="document.analysis.amount">
                  <span class="font-medium text-gray-700 dark:text-gray-300">Montant :</span>
                  <span class="text-gray-900 dark:text-gray-100 ml-1">{{ document.analysis.amount }} €</span>
                </div>
                <div v-if="document.analysis.supplier">
                  <span class="font-medium text-gray-700 dark:text-gray-300">Fournisseur :</span>
                  <span class="text-gray-900 dark:text-gray-100 ml-1">{{ document.analysis.supplier }}</span>
                </div>
                <div v-if="document.analysis.date">
                  <span class="font-medium text-gray-700 dark:text-gray-300">Date :</span>
                  <span class="text-gray-900 dark:text-gray-100 ml-1">{{ formatDate(document.analysis.date) }}</span>
                </div>
                <div v-if="document.analysis.invoiceNumber">
                  <span class="font-medium text-gray-700 dark:text-gray-300">N° :</span>
                  <span class="text-gray-900 dark:text-gray-100 ml-1">{{ document.analysis.invoiceNumber }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucun document -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        Aucun document trouvé
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery || typeFilter || statusFilter ? 'Essayez de modifier vos filtres' : 'Les documents extraits des emails apparaîtront ici' }}
      </p>
      <div class="mt-6">
        <button
          @click="showUploadModal = true"
          class="btn-primary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Importer un document
        </button>
      </div>
    </div>
  </div>

  <!-- Modal d'upload -->
  <div 
    v-if="showUploadModal" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeUploadModal"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
      
      <div 
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <form @submit.prevent="uploadDocument">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Importer un document
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ajoutez un document pour analyse automatique
                </p>
              </div>
              <button
                type="button"
                @click="closeUploadModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="form-label required">Fichier</label>
                <input
                  type="file"
                  ref="fileInput"
                  accept=".pdf,.jpg,.jpeg,.png"
                  class="form-input"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">
                  Formats acceptés : PDF, JPG, PNG (max 10MB)
                </p>
              </div>

              <div>
                <label class="form-label">Type de document (optionnel)</label>
                <select v-model="uploadForm.type" class="form-input">
                  <option value="">Détection automatique</option>
                  <option value="invoice">Facture</option>
                  <option value="quote">Devis</option>
                  <option value="contract">Contrat</option>
                  <option value="receipt">Reçu</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="uploadForm.autoAnalyze"
                    class="form-checkbox"
                  />
                  <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Analyser automatiquement après l'upload
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="uploading"
              class="btn-primary mb-3 sm:mb-0 sm:ml-3"
            >
              {{ uploading ? 'Upload en cours...' : 'Importer' }}
            </button>
            <button
              type="button"
              @click="closeUploadModal"
              class="btn-secondary"
              :disabled="uploading"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal d'analyse -->
  <div 
    v-if="showAnalysisModal" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeAnalysisModal"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
      
      <div 
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
        @click.stop
      >
        <div class="px-4 pt-5 pb-4 sm:p-6" v-if="currentAnalysis">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Analyse du document
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ currentDocument?.filename }}
              </p>
            </div>
            <button
              type="button"
              @click="closeAnalysisModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Informations principales -->
            <div class="space-y-4">
              <div v-if="currentAnalysis.type">
                <label class="font-medium text-gray-700 dark:text-gray-300">Type de document</label>
                <p class="text-gray-900 dark:text-gray-100">{{ getTypeLabel(currentAnalysis.type) }}</p>
              </div>
              
              <div v-if="currentAnalysis.supplier">
                <label class="font-medium text-gray-700 dark:text-gray-300">Fournisseur/Émetteur</label>
                <p class="text-gray-900 dark:text-gray-100">{{ currentAnalysis.supplier }}</p>
              </div>
              
              <div v-if="currentAnalysis.amount">
                <label class="font-medium text-gray-700 dark:text-gray-300">Montant total</label>
                <p class="text-gray-900 dark:text-gray-100 text-xl font-semibold">{{ currentAnalysis.amount }} €</p>
              </div>
              
              <div v-if="currentAnalysis.date">
                <label class="font-medium text-gray-700 dark:text-gray-300">Date du document</label>
                <p class="text-gray-900 dark:text-gray-100">{{ formatDate(currentAnalysis.date) }}</p>
              </div>
            </div>

            <!-- Détails supplémentaires -->
            <div class="space-y-4">
              <div v-if="currentAnalysis.invoiceNumber">
                <label class="font-medium text-gray-700 dark:text-gray-300">Numéro</label>
                <p class="text-gray-900 dark:text-gray-100">{{ currentAnalysis.invoiceNumber }}</p>
              </div>
              
              <div v-if="currentAnalysis.dueDate">
                <label class="font-medium text-gray-700 dark:text-gray-300">Date d'échéance</label>
                <p class="text-gray-900 dark:text-gray-100">{{ formatDate(currentAnalysis.dueDate) }}</p>
              </div>
              
              <div v-if="currentAnalysis.taxAmount">
                <label class="font-medium text-gray-700 dark:text-gray-300">Montant TVA</label>
                <p class="text-gray-900 dark:text-gray-100">{{ currentAnalysis.taxAmount }} €</p>
              </div>
              
              <div v-if="currentAnalysis.confidence">
                <label class="font-medium text-gray-700 dark:text-gray-300">Confiance de l'analyse</label>
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-primary-600 h-2 rounded-full" 
                      :style="{ width: currentAnalysis.confidence + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ currentAnalysis.confidence }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
            <button
              v-if="currentAnalysis.type === 'invoice'"
              @click="convertToInvoice"
              class="btn-success"
            >
              Créer une facture
            </button>
            <button
              v-if="currentAnalysis.type === 'quote'"
              @click="convertToQuote"
              class="btn-info"
            >
              Créer un devis
            </button>
            <button
              @click="exportAnalysis"
              class="btn-secondary"
            >
              Exporter l'analyse
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Types
interface DocumentAnalysis {
  type?: string
  supplier?: string
  amount?: number
  date?: string
  invoiceNumber?: string
  dueDate?: string
  taxAmount?: number
  confidence?: number
}

interface EmailDocument {
  id: string
  filename: string
  size: number
  type?: string
  analysisStatus: 'pending' | 'analyzing' | 'analyzed' | 'error'
  analysis?: DocumentAnalysis
  createdAt: string
  extractedFrom?: {
    emailId: string
    subject: string
  }
}

// État de base
const documents = ref<EmailDocument[]>([
  {
    id: '1',
    filename: 'Facture_EDF_202401.pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    type: 'invoice',
    analysisStatus: 'analyzed',
    analysis: {
      type: 'invoice',
      supplier: 'EDF',
      amount: 234.56,
      date: '2024-01-15',
      invoiceNumber: 'FAC-2024-001234',
      dueDate: '2024-02-15',
      taxAmount: 47.12,
      confidence: 95
    },
    createdAt: '2024-01-16T10:30:00Z',
    extractedFrom: {
      emailId: 'email1',
      subject: 'Votre facture EDF de janvier 2024'
    }
  },
  {
    id: '2',
    filename: 'Devis_Plombier_Jean.pdf',
    size: 1024 * 500, // 500KB
    type: 'quote',
    analysisStatus: 'analyzed',
    analysis: {
      type: 'quote',
      supplier: 'Plomberie Jean Dupont',
      amount: 1250.00,
      date: '2024-01-10',
      invoiceNumber: 'DEV-2024-0056',
      confidence: 88
    },
    createdAt: '2024-01-11T14:20:00Z',
    extractedFrom: {
      emailId: 'email2',
      subject: 'Devis réparation plomberie'
    }
  },
  {
    id: '3',
    filename: 'Contrat_Assurance.pdf',
    size: 1024 * 1024 * 5.2, // 5.2MB
    type: 'contract',
    analysisStatus: 'pending',
    createdAt: '2024-01-20T09:15:00Z',
    extractedFrom: {
      emailId: 'email3',
      subject: 'Votre nouveau contrat d\'assurance'
    }
  }
])

const loading = ref(false)
const analyzing = ref(false)
const uploading = ref(false)

// Filtres
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dateFilter = ref('')

// Modals
const showUploadModal = ref(false)
const showAnalysisModal = ref(false)
const currentDocument = ref<EmailDocument | null>(null)
const currentAnalysis = ref<DocumentAnalysis | null>(null)

// Formulaire d'upload
const uploadForm = ref({
  type: '',
  autoAnalyze: true
})

const fileInput = ref<HTMLInputElement>()

// Computed
const filteredDocuments = computed(() => {
  return documents.value.filter(doc => {
    const matchesSearch = !searchQuery.value || 
      doc.filename.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = !typeFilter.value || doc.type === typeFilter.value
    const matchesStatus = !statusFilter.value || doc.analysisStatus === statusFilter.value
    const matchesDate = !dateFilter.value || doc.createdAt.startsWith(dateFilter.value)
    
    return matchesSearch && matchesType && matchesStatus && matchesDate
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const analyzedCount = computed(() => 
  documents.value.filter(d => d.analysisStatus === 'analyzed').length
)

const pendingCount = computed(() => 
  documents.value.filter(d => d.analysisStatus === 'pending').length
)

const invoiceCount = computed(() => 
  documents.value.filter(d => d.type === 'invoice').length
)

// Méthodes
const analyzeDocument = async (id: string) => {
  const doc = documents.value.find(d => d.id === id)
  if (!doc) return

  doc.analysisStatus = 'analyzing'
  
  // Simulation de l'analyse
  setTimeout(() => {
    doc.analysisStatus = 'analyzed'
    doc.analysis = {
      type: 'invoice',
      supplier: 'Fournisseur Example',
      amount: Math.floor(Math.random() * 1000) + 100,
      date: new Date().toISOString().split('T')[0],
      confidence: Math.floor(Math.random() * 20) + 80
    }
  }, 2000)
}

const analyzeAllDocuments = async () => {
  analyzing.value = true
  const pendingDocs = documents.value.filter(d => d.analysisStatus === 'pending')
  
  for (const doc of pendingDocs) {
    await analyzeDocument(doc.id)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Délai entre les analyses
  }
  
  analyzing.value = false
}

const viewAnalysis = (document: EmailDocument) => {
  currentDocument.value = document
  currentAnalysis.value = document.analysis || null
  showAnalysisModal.value = true
}

const downloadDocument = async (id: string) => {
  // Simulation du téléchargement
  console.log('Téléchargement du document:', id)
}

const deleteDocument = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
    const index = documents.value.findIndex(d => d.id === id)
    if (index > -1) {
      documents.value.splice(index, 1)
    }
  }
}

const uploadDocument = async () => {
  if (!fileInput.value?.files?.[0]) return

  uploading.value = true
  const file = fileInput.value.files[0]

  // Simulation de l'upload
  setTimeout(() => {
    const newDoc: EmailDocument = {
      id: `doc_${Date.now()}`,
      filename: file.name,
      size: file.size,
      type: uploadForm.value.type || 'other',
      analysisStatus: uploadForm.value.autoAnalyze ? 'analyzing' : 'pending',
      createdAt: new Date().toISOString()
    }

    documents.value.unshift(newDoc)

    if (uploadForm.value.autoAnalyze) {
      setTimeout(() => {
        analyzeDocument(newDoc.id)
      }, 1000)
    }

    uploading.value = false
    closeUploadModal()
  }, 2000)
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = { type: '', autoAnalyze: true }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const closeAnalysisModal = () => {
  showAnalysisModal.value = false
  currentDocument.value = null
  currentAnalysis.value = null
}

const convertToInvoice = () => {
  router.push('/factures/nouveau')
  closeAnalysisModal()
}

const convertToQuote = () => {
  router.push('/devis/nouveau')
  closeAnalysisModal()
}

const exportAnalysis = () => {
  if (!currentAnalysis.value) return
  
  const data = JSON.stringify(currentAnalysis.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `analysis_${currentDocument.value?.filename || 'document'}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}

// Fonctions utilitaires
const getDocumentTypeIcon = (type?: string) => 'svg'
const getDocumentTypeColor = (type?: string) => {
  const colors = {
    invoice: 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-200',
    quote: 'bg-info-100 text-info-600 dark:bg-info-900 dark:text-info-200',
    contract: 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-200',
    receipt: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200',
    other: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  }
  return colors[type as keyof typeof colors] || colors.other
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    analyzing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    analyzed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

const getTypeBadgeClass = (type: string) => {
  const classes = {
    invoice: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    quote: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    contract: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    receipt: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return classes[type as keyof typeof classes] || classes.other
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'En attente',
    analyzing: 'En cours',
    analyzed: 'Analysé',
    error: 'Erreur'
  }
  return labels[status as keyof typeof labels] || status
}

const getTypeLabel = (type: string) => {
  const labels = {
    invoice: 'Facture',
    quote: 'Devis',
    contract: 'Contrat',
    receipt: 'Reçu',
    other: 'Autre'
  }
  return labels[type as keyof typeof labels] || type
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Charger les documents depuis l'API
})
</script>

<style scoped>
.form-label.required::after {
  content: " *";
  color: #ef4444;
}
</style>
