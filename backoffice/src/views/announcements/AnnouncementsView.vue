<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Annonces</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Communiquez les nouveautés, mises à jour et fonctionnalités à venir
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="openCreateModal"
          class="btn-primary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle annonce
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total annonces
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ announcements.length }}
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Publiées
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ publishedCount }}
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Programmées
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ scheduledCount }}
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Vues totales
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ totalViews }}
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
            placeholder="Titre, contenu..."
          />
        </div>
        <div>
          <label class="form-label">Type</label>
          <select v-model="typeFilter" class="form-input">
            <option value="">Tous les types</option>
            <option value="feature">Nouvelle fonctionnalité</option>
            <option value="update">Mise à jour</option>
            <option value="maintenance">Maintenance</option>
            <option value="security">Sécurité</option>
            <option value="announcement">Annonce générale</option>
          </select>
        </div>
        <div>
          <label class="form-label">Statut</label>
          <select v-model="statusFilter" class="form-input">
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="scheduled">Programmée</option>
            <option value="published">Publiée</option>
            <option value="archived">Archivée</option>
          </select>
        </div>
        <div>
          <label class="form-label">Priorité</label>
          <select v-model="priorityFilter" class="form-input">
            <option value="">Toutes les priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="critical">Critique</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des annonces -->
    <div class="space-y-4">
      <div 
        v-for="announcement in filteredAnnouncements" 
        :key="announcement.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="openViewModal(announcement)"
      >
        <div class="flex items-start space-x-4">
          <!-- Icône du type -->
          <div class="flex-shrink-0">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center',
              getTypeColor(announcement.type)
            ]">
              <component :is="getTypeIcon(announcement.type)" class="h-5 w-5" />
            </div>
          </div>

          <!-- Contenu principal -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ announcement.title }}
                </h3>
                <span :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getStatusBadgeClass(announcement.status)
                ]">
                  {{ getStatusLabel(announcement.status) }}
                </span>
                <span :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityBadgeClass(announcement.priority)
                ]">
                  {{ getPriorityLabel(announcement.priority) }}
                </span>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center space-x-2">
                <button
                  @click.stop="editAnnouncement(announcement)"
                  class="text-primary-600 hover:text-primary-900 text-sm"
                >
                  Modifier
                </button>
                <button
                  v-if="announcement.status === 'draft'"
                  @click.stop="publishAnnouncement(announcement.id)"
                  class="text-success-600 hover:text-success-900 text-sm"
                >
                  Publier
                </button>
                <button
                  @click.stop="deleteAnnouncement(announcement.id)"
                  class="text-danger-600 hover:text-danger-900 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {{ announcement.summary }}
            </p>

            <div class="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-4">
                <span>Par {{ announcement.author.name }}</span>
                <span>{{ formatDate(announcement.createdAt) }}</span>
                <span v-if="announcement.scheduledAt && announcement.status === 'scheduled'">
                  Programmée le {{ formatDate(announcement.scheduledAt) }}
                </span>
              </div>
              <div class="flex items-center space-x-4">
                <span class="flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ announcement.views }}
                </span>
                <span class="text-xs">{{ getTypeLabel(announcement.type) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message si aucune annonce -->
    <div v-if="filteredAnnouncements.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        Aucune annonce trouvée
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery || typeFilter || statusFilter ? 'Essayez de modifier vos filtres' : 'Commencez par créer votre première annonce' }}
      </p>
      <div class="mt-6">
        <button
          @click="openCreateModal"
          class="btn-primary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Créer une annonce
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de création/édition -->
  <div 
    v-if="showModal" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
      
      <div 
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        @click.stop
      >
        <form @submit.prevent="saveAnnouncement">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ editingAnnouncement ? 'Modifier l\'annonce' : 'Nouvelle annonce' }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Créez une annonce pour informer les utilisateurs
                </p>
              </div>
              <button
                type="button"
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Formulaire principal -->
              <div class="space-y-4">
                <div>
                  <label class="form-label required">Titre</label>
                  <input
                    v-model="form.title"
                    type="text"
                    class="form-input"
                    placeholder="Titre de l'annonce"
                    required
                  />
                </div>

                <div>
                  <label class="form-label required">Résumé</label>
                  <textarea
                    v-model="form.summary"
                    rows="3"
                    class="form-input"
                    placeholder="Résumé court affiché dans la liste"
                    required
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ form.summary.length }}/200 caractères
                  </p>
                </div>

                <div>
                  <label class="form-label required">Contenu complet</label>
                  <textarea
                    v-model="form.content"
                    rows="8"
                    class="form-input"
                    placeholder="Contenu détaillé de l'annonce (Markdown supporté)"
                    required
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    Vous pouvez utiliser du Markdown pour le formatage
                  </p>
                </div>
              </div>

              <!-- Configuration -->
              <div class="space-y-4">
                <div>
                  <label class="form-label required">Type d'annonce</label>
                  <select v-model="form.type" class="form-input" required>
                    <option value="">Sélectionner un type</option>
                    <option value="feature">Nouvelle fonctionnalité</option>
                    <option value="update">Mise à jour</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="security">Sécurité</option>
                    <option value="announcement">Annonce générale</option>
                  </select>
                </div>

                <div>
                  <label class="form-label required">Priorité</label>
                  <select v-model="form.priority" class="form-input" required>
                    <option value="">Sélectionner une priorité</option>
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>

                <div>
                  <label class="form-label">Statut</label>
                  <select v-model="form.status" class="form-input">
                    <option value="draft">Brouillon</option>
                    <option value="scheduled">Programmer</option>
                    <option value="published">Publier maintenant</option>
                  </select>
                </div>

                <div v-if="form.status === 'scheduled'">
                  <label class="form-label">Date et heure de publication</label>
                  <input
                    v-model="form.scheduledAt"
                    type="datetime-local"
                    class="form-input"
                    :min="new Date().toISOString().slice(0, 16)"
                  />
                </div>

                <div>
                  <label class="form-label">Version associée</label>
                  <input
                    v-model="form.version"
                    type="text"
                    class="form-input"
                    placeholder="v1.2.3"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Version de l'application concernée par cette annonce
                  </p>
                </div>

                <div>
                  <label class="form-label">Public cible</label>
                  <div class="space-y-2 mt-2">
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.targetAudience"
                        value="all"
                        class="form-checkbox"
                      />
                      <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Tous les utilisateurs</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.targetAudience"
                        value="admins"
                        class="form-checkbox"
                      />
                      <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Administrateurs uniquement</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.targetAudience"
                        value="developers"
                        class="form-checkbox"
                      />
                      <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Développeurs</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="form.isPinned"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Épingler en haut de la liste
                    </span>
                  </label>
                </div>

                <div>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="form.sendNotification"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Envoyer une notification push
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              class="btn-primary mb-3 sm:mb-0 sm:ml-3"
            >
              {{ form.status === 'published' ? 'Publier' : 'Enregistrer' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal de visualisation -->
  <div 
    v-if="showViewModal" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeViewModal"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
      
      <div 
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
        @click.stop
      >
        <div class="px-4 pt-5 pb-4 sm:p-6" v-if="viewingAnnouncement">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center',
                getTypeColor(viewingAnnouncement.type)
              ]">
                <component :is="getTypeIcon(viewingAnnouncement.type)" class="h-4 w-4" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ viewingAnnouncement.title }}
                </h3>
                <div class="flex items-center space-x-2 mt-1">
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getStatusBadgeClass(viewingAnnouncement.status)
                  ]">
                    {{ getStatusLabel(viewingAnnouncement.status) }}
                  </span>
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getPriorityBadgeClass(viewingAnnouncement.priority)
                  ]">
                    {{ getPriorityLabel(viewingAnnouncement.priority) }}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="closeViewModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="prose dark:prose-invert max-w-none">
            <div v-html="formatContent(viewingAnnouncement.content)"></div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-4">
                <span>Par {{ viewingAnnouncement.author.name }}</span>
                <span>{{ formatDate(viewingAnnouncement.createdAt) }}</span>
                <span v-if="viewingAnnouncement.version">Version {{ viewingAnnouncement.version }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{{ viewingAnnouncement.views }} vues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import announcementsService from './services/announcements'
import type { Announcement } from './services/announcements'

const authStore = useAuthStore()

// État de base
const announcements = ref<Announcement[]>([])
const loading = ref(false)

// Filtres
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

// Modals
const showModal = ref(false)
const showViewModal = ref(false)
const editingAnnouncement = ref<Announcement | null>(null)
const viewingAnnouncement = ref<Announcement | null>(null)

// Formulaire
const form = ref({
  title: '',
  summary: '',
  content: '',
  type: '',
  priority: '',
  status: 'draft',
  scheduledAt: '',
  version: '',
  targetAudience: [] as string[],
  isPinned: false,
  sendNotification: false
})

// Computed
const filteredAnnouncements = computed(() => {
  return announcements.value.filter(announcement => {
    const matchesSearch = !searchQuery.value || 
      announcement.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      announcement.summary.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = !typeFilter.value || announcement.type === typeFilter.value
    const matchesStatus = !statusFilter.value || announcement.status === statusFilter.value
    const matchesPriority = !priorityFilter.value || announcement.priority === priorityFilter.value
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority
  }).sort((a, b) => {
    // Épinglées en premier
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    
    // Puis par date de création (plus récentes en premier)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const publishedCount = computed(() => 
  announcements.value.filter(a => a.status === 'published').length
)

const scheduledCount = computed(() => 
  announcements.value.filter(a => a.status === 'scheduled').length
)

const totalViews = computed(() => 
  announcements.value.reduce((sum, a) => sum + (a.views || 0), 0)
)

// Méthodes
const loadAnnouncements = async () => {
  try {
    loading.value = true
    const response = await announcementsService.getAnnouncements()
    if (response.success && response.data) {
      announcements.value = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des annonces:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingAnnouncement.value = null
  resetForm()
  showModal.value = true
}

const editAnnouncement = (announcement: Announcement) => {
  editingAnnouncement.value = announcement
  form.value = {
    title: announcement.title,
    summary: announcement.summary,
    content: announcement.content,
    type: announcement.type,
    priority: announcement.priority,
    status: announcement.status,
    scheduledAt: announcement.scheduledAt || '',
    version: announcement.version || '',
    targetAudience: [...(announcement.targetAudience || [])],
    isPinned: announcement.isPinned || false,
    sendNotification: false
  }
  showModal.value = true
}

const openViewModal = (announcement: Announcement) => {
  viewingAnnouncement.value = announcement
  showViewModal.value = true
  // Incrémenter le compteur de vues
  incrementViews(announcement.id)
}

const closeModal = () => {
  showModal.value = false
  editingAnnouncement.value = null
  resetForm()
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingAnnouncement.value = null
}

const resetForm = () => {
  form.value = {
    title: '',
    summary: '',
    content: '',
    type: '',
    priority: '',
    status: 'draft',
    scheduledAt: '',
    version: '',
    targetAudience: [],
    isPinned: false,
    sendNotification: false
  }
}

const saveAnnouncement = async () => {
  try {
    const announcementData = {
      ...form.value,
      authorId: authStore.user?.id,
      publishedAt: form.value.status === 'published' ? new Date().toISOString() : undefined
    }

    if (editingAnnouncement.value) {
      const response = await announcementsService.updateAnnouncement({
        id: editingAnnouncement.value.id,
        ...announcementData
      })
      
      if (response.success && response.data) {
        const index = announcements.value.findIndex(a => a.id === editingAnnouncement.value!.id)
        announcements.value[index] = response.data
      }
    } else {
      const response = await announcementsService.createAnnouncement(announcementData)
      
      if (response.success && response.data) {
        announcements.value.unshift(response.data)
      }
    }

    closeModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

const publishAnnouncement = async (id: string) => {
  try {
    const response = await announcementsService.publishAnnouncement(id)
    if (response.success) {
      const announcement = announcements.value.find(a => a.id === id)
      if (announcement) {
        announcement.status = 'published'
        announcement.publishedAt = new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Erreur lors de la publication:', error)
  }
}

const deleteAnnouncement = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
    try {
      const response = await announcementsService.deleteAnnouncement(id)
      if (response.success) {
        const index = announcements.value.findIndex(a => a.id === id)
        announcements.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const incrementViews = async (id: string) => {
  try {
    await announcementsService.incrementViews(id)
    const announcement = announcements.value.find(a => a.id === id)
    if (announcement) {
      announcement.views = (announcement.views || 0) + 1
    }
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error)
  }
}

// Fonctions utilitaires
const getTypeIcon = (type: string) => {
  const icons = {
    feature: 'svg', // Étoile ou icône de fonctionnalité
    update: 'svg', // Flèche vers le haut
    maintenance: 'svg', // Outil
    security: 'svg', // Bouclier
    announcement: 'svg' // Mégaphone
  }
  // Pour simplifier, on utilise des SVG basiques
  return 'svg'
}

const getTypeColor = (type: string) => {
  const colors = {
    feature: 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-200',
    update: 'bg-info-100 text-info-600 dark:bg-info-900 dark:text-info-200',
    maintenance: 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-200',
    security: 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-200',
    announcement: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200'
  }
  return colors[type as keyof typeof colors] || colors.announcement
}

const getTypeLabel = (type: string) => {
  const labels = {
    feature: 'Fonctionnalité',
    update: 'Mise à jour',
    maintenance: 'Maintenance',
    security: 'Sécurité',
    announcement: 'Annonce'
  }
  return labels[type as keyof typeof labels] || type
}

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Brouillon',
    scheduled: 'Programmée',
    published: 'Publiée',
    archived: 'Archivée'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    draft: 'badge-secondary',
    scheduled: 'badge-warning',
    published: 'badge-success',
    archived: 'badge-gray'
  }
  return classes[status as keyof typeof classes] || 'badge-secondary'
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Faible',
    medium: 'Moyenne',
    high: 'Élevée',
    critical: 'Critique'
  }
  return labels[priority as keyof typeof labels] || priority
}

const getPriorityBadgeClass = (priority: string) => {
  const classes = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content: string) => {
  // Simple conversion Markdown vers HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// Lifecycle
onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.form-label.required::after {
  content: " *";
  color: #ef4444;
}
</style>
