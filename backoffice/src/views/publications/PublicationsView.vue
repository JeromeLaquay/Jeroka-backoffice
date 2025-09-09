<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Publications</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Créez et gérez vos publications pour les réseaux sociaux et les actualités du site
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="openAIGenerationModal"
          class="btn-secondary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Générer avec IA
        </button>
        <button
          @click="openCreateModal"
          class="btn-primary inline-flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouvelle publication
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-4">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DocumentTextIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total publications
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ publications.length }}
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
              <CalendarIcon class="h-6 w-6 text-warning-600" />
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
              <CheckCircleIcon class="h-6 w-6 text-success-600" />
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
              <EyeIcon class="h-6 w-6 text-info-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Brouillons
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ draftCount }}
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
          <label class="form-label">Statut</label>
          <select v-model="statusFilter" class="form-input">
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="scheduled">Programmée</option>
            <option value="published">Publiée</option>
          </select>
        </div>
        <div>
          <label class="form-label">Plateforme</label>
          <select v-model="platformFilter" class="form-input">
            <option value="">Toutes les plateformes</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="website">Site web</option>
          </select>
        </div>
        <div>
          <label class="form-label">Date</label>
          <select v-model="dateFilter" class="form-input">
            <option value="">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des publications -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="publication in filteredPublications" 
        :key="publication.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="editPublication(publication)"
      >
        <!-- Image de la publication -->
        <div v-if="publication.image" class="mb-4">
          <img 
            :src="publication.image" 
            :alt="publication.title"
            class="w-full h-48 object-cover rounded-lg"
          />
        </div>
        <div v-else class="mb-4 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <PhotoIcon class="h-12 w-12 text-gray-400" />
        </div>

        <!-- Contenu -->
        <div class="space-y-3">
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              {{ publication.title }}
            </h3>
            <span 
              :class="[
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2',
                publication.status === 'published' ? 'badge-success' : 
                publication.status === 'scheduled' ? 'badge-warning' : 'badge-info'
              ]"
            >
              {{ getStatusLabel(publication.status) }}
            </span>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {{ publication.content }}
          </p>

          <!-- Plateformes -->
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="platform in publication.platforms" 
              :key="platform"
              :class="[
                'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                getPlatformClass(platform)
              ]"
            >
              <component :is="getPlatformIcon()" class="h-3 w-3 mr-1" />
              {{ getPlatformLabel(platform) }}
            </span>
          </div>

          <!-- Dates -->
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Créée le {{ formatDate(publication.createdAt) }}</span>
            <span v-if="publication.scheduledAt">
              Programmée le {{ formatDate(publication.scheduledAt) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <div class="flex space-x-2">
              <button
                @click.stop="duplicatePublication(publication)"
                class="text-primary-600 hover:text-primary-900 text-xs"
              >
                Dupliquer
              </button>
              <button
                @click.stop="deletePublication(publication.id)"
                class="text-danger-600 hover:text-danger-900 text-xs"
              >
                Supprimer
              </button>
            </div>
            <div class="flex space-x-1">
              <button
                v-if="publication.status === 'draft'"
                @click.stop="publishNow(publication)"
                class="btn-sm btn-primary"
              >
                Publier
              </button>
              <button
                @click.stop="editPublication(publication)"
                class="btn-sm btn-secondary"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredPublications.length === 0" class="text-center py-12">
      <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        Aucune publication trouvée
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery || statusFilter || platformFilter ? 'Essayez de modifier vos filtres' : 'Commencez par créer votre première publication' }}
      </p>
      <div class="mt-6">
        <button
          @click="openCreateModal"
          class="btn-primary inline-flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Créer une publication
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de génération IA -->
  <div 
    v-if="showAIModal" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeAIModal"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
      
      <div 
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        @click.stop
      >
        <form @submit.prevent="generateAIContent">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Générer une publication avec IA
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  L'IA va créer du contenu personnalisé pour votre entreprise
                </p>
              </div>
              <button
                type="button"
                @click="closeAIModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="form-label required">Sujet/Thème principal</label>
                <input
                  v-model="aiForm.topic"
                  type="text"
                  class="form-input"
                  placeholder="Ex: Lancement nouveau produit, conseils marketing digital..."
                  required
                />
              </div>

              <div>
                <label class="form-label required">Type de contenu</label>
                <select v-model="aiForm.contentType" class="form-input" required>
                  <option value="">Sélectionner un type</option>
                  <option value="promotional">Promotionnel (vendre un produit/service)</option>
                  <option value="educational">Éducatif (conseils, tutoriels)</option>
                  <option value="engaging">Engagement (questions, sondages)</option>
                  <option value="announcement">Annonce (nouveautés, événements)</option>
                  <option value="inspirational">Inspirant (citations, motivation)</option>
                  <option value="behind-scenes">Coulisses (équipe, processus)</option>
                </select>
              </div>

              <div>
                <label class="form-label required">Public cible</label>
                <select v-model="aiForm.targetAudience" class="form-input" required>
                  <option value="">Sélectionner le public</option>
                  <option value="entrepreneurs">Entrepreneurs et startups</option>
                  <option value="sme">PME et entreprises locales</option>
                  <option value="large-companies">Grandes entreprises</option>
                  <option value="professionals">Professionnels du secteur</option>
                  <option value="general-public">Grand public</option>
                  <option value="students">Étudiants et jeunes</option>
                </select>
              </div>

              <div>
                <label class="form-label required">Ton de communication</label>
                <select v-model="aiForm.tone" class="form-input" required>
                  <option value="">Sélectionner le ton</option>
                  <option value="professional">Professionnel</option>
                  <option value="friendly">Amical et chaleureux</option>
                  <option value="casual">Décontracté</option>
                  <option value="expert">Expert et technique</option>
                  <option value="inspiring">Inspirant et motivant</option>
                  <option value="humorous">Humoristique</option>
                </select>
              </div>

              <div>
                <label class="form-label">Plateformes ciblées</label>
                <div class="space-y-2 mt-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="aiForm.platforms"
                      value="facebook"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Facebook (texte plus long, familial)</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="aiForm.platforms"
                      value="instagram"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Instagram (visuel, hashtags)</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="aiForm.platforms"
                      value="linkedin"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">LinkedIn (professionnel, B2B)</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="aiForm.platforms"
                      value="website"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Site web (article, SEO)</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="form-label">Mots-clés à inclure</label>
                <input
                  v-model="aiForm.keywords"
                  type="text"
                  class="form-input"
                  placeholder="innovation, digital, startup..."
                />
                <p class="text-xs text-gray-500 mt-1">Séparez par des virgules</p>
              </div>

              <div>
                <label class="form-label">Call-to-action souhaité</label>
                <select v-model="aiForm.callToAction" class="form-input">
                  <option value="">Aucun CTA spécifique</option>
                  <option value="visit-website">Visiter le site web</option>
                  <option value="contact-us">Nous contacter</option>
                  <option value="learn-more">En savoir plus</option>
                  <option value="buy-now">Acheter maintenant</option>
                  <option value="book-demo">Réserver une démo</option>
                  <option value="download">Télécharger</option>
                  <option value="subscribe">S'abonner</option>
                  <option value="share">Partager</option>
                </select>
              </div>

              <div>
                <label class="form-label">Longueur du contenu</label>
                <select v-model="aiForm.length" class="form-input">
                  <option value="short">Court (1-2 phrases)</option>
                  <option value="medium">Moyen (1 paragraphe)</option>
                  <option value="long">Long (plusieurs paragraphes)</option>
                </select>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="aiForm.generateImage"
                    class="form-checkbox"
                  />
                  <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Générer une image avec DALL-E
                  </span>
                </label>
                <p class="text-xs text-gray-500 mt-1">
                  L'IA créera une image personnalisée en relation avec le contenu
                </p>
              </div>
            </div>
          </div>
          
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="aiLoading"
              class="btn-primary mb-3 sm:mb-0 sm:ml-3 min-w-[120px]"
            >
              <span v-if="!aiLoading">Générer</span>
              <span v-else class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Génération...
              </span>
            </button>
            <button
              type="button"
              @click="closeAIModal"
              class="btn-secondary"
              :disabled="aiLoading"
            >
              Annuler
            </button>
          </div>
        </form>
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
        <form @submit.prevent="savePublication">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ editingPublication ? 'Modifier la publication' : 'Nouvelle publication' }}
                </h3>
                <div v-if="isAIGenerated" class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Contenu généré par IA
                </div>
              </div>
              <button
                type="button"
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon class="h-6 w-6" />
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
                    placeholder="Titre de la publication"
                    required
                  />
                </div>

                <div>
                  <label class="form-label required">Contenu</label>
                  <textarea
                    v-model="form.content"
                    rows="6"
                    class="form-input"
                    placeholder="Contenu de la publication..."
                    required
                  ></textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ form.content.length }}/500 caractères
                  </p>
                </div>

                <div>
                  <label class="form-label">Hashtags</label>
                  <input
                    v-model="form.hashtags"
                    type="text"
                    class="form-input"
                    placeholder="#jeroka #innovation #digital"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Séparez les hashtags par des espaces
                  </p>
                </div>

                <div>
                  <label class="form-label">Image</label>
                  <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <div class="space-y-1 text-center">
                      <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
                      <div class="flex text-sm text-gray-600 dark:text-gray-400">
                        <label class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Télécharger un fichier</span>
                          <input
                            type="file"
                            class="sr-only"
                            accept="image/*"
                            @change="handleImageUpload"
                          />
                        </label>
                        <p class="pl-1">ou glisser-déposer</p>
                      </div>
                      <p class="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                    </div>
                  </div>
                  <div v-if="form.image" class="mt-2">
                    <div class="relative">
                      <img :src="form.image" alt="Preview" class="h-32 w-auto rounded-lg" />
                      <div v-if="isAIGenerated && aiGeneratedData?.metadata?.imageGenerated" 
                           class="absolute top-1 left-1 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-600 text-white">
                        <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        IA
                      </div>
                    </div>
                    <p v-if="isAIGenerated && aiGeneratedData?.metadata?.imageGenerated" class="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Image générée automatiquement par DALL-E
                    </p>
                  </div>
                </div>
              </div>

              <!-- Configuration de publication -->
              <div class="space-y-4">
                <div>
                  <label class="form-label required">Plateformes de diffusion</label>
                  <div class="space-y-2 mt-2">
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.platforms"
                        value="facebook"
                        class="form-checkbox"
                      />
                      <div class="ml-3 flex items-center">
                        <div class="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                        <span class="text-sm text-gray-700 dark:text-gray-300">Facebook</span>
                      </div>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.platforms"
                        value="instagram"
                        class="form-checkbox"
                      />
                      <div class="ml-3 flex items-center">
                        <div class="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded mr-2"></div>
                        <span class="text-sm text-gray-700 dark:text-gray-300">Instagram</span>
                      </div>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.platforms"
                        value="linkedin"
                        class="form-checkbox"
                      />
                      <div class="ml-3 flex items-center">
                        <div class="w-4 h-4 bg-blue-700 rounded mr-2"></div>
                        <span class="text-sm text-gray-700 dark:text-gray-300">LinkedIn</span>
                      </div>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="checkbox"
                        v-model="form.platforms"
                        value="website"
                        class="form-checkbox"
                      />
                      <div class="ml-3 flex items-center">
                        <div class="w-4 h-4 bg-green-600 rounded mr-2"></div>
                        <span class="text-sm text-gray-700 dark:text-gray-300">Site web (Actualités)</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="form-label">Type de publication</label>
                  <select v-model="form.type" class="form-input">
                    <option value="standard">Standard</option>
                    <option value="promotion">Promotion</option>
                    <option value="event">Événement</option>
                    <option value="announcement">Annonce</option>
                    <option value="tutorial">Tutoriel</option>
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
                  <label class="form-label">Catégorie</label>
                  <select v-model="form.category" class="form-input">
                    <option value="">Sélectionner une catégorie</option>
                    <option value="technology">Technologie</option>
                    <option value="business">Business</option>
                    <option value="innovation">Innovation</option>
                    <option value="tips">Conseils</option>
                    <option value="news">Actualités</option>
                  </select>
                </div>

                <div>
                  <label class="form-label">Mots-clés SEO</label>
                  <input
                    v-model="form.keywords"
                    type="text"
                    class="form-input"
                    placeholder="mots-clés, séparés, par, des, virgules"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Pour le référencement du site web
                  </p>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import publicationsService from '@/services/publications'

interface Publication {
  id: string
  title: string
  content: string
  hashtags: string
  image?: string
  platforms: string[]
  type: 'standard' | 'promotion' | 'event' | 'announcement' | 'tutorial'
  status: 'draft' | 'scheduled' | 'published'
  category: string
  keywords: string
  createdAt: string
  scheduledAt?: string
  publishedAt?: string
}

const searchQuery = ref('')
const statusFilter = ref('')
const platformFilter = ref('')
const dateFilter = ref('')
const showModal = ref(false)
const showAIModal = ref(false)
const editingPublication = ref<Publication | null>(null)
const aiLoading = ref(false)
const isAIGenerated = ref(false)
const aiGeneratedData = ref<any>(null)

const form = ref({
  title: '',
  content: '',
  hashtags: '',
  image: '',
  platforms: [] as string[],
  type: 'standard' as Publication['type'],
  status: 'draft' as Publication['status'],
  category: '',
  keywords: '',
  scheduledAt: ''
})

const aiForm = ref({
  topic: '',
  contentType: '',
  targetAudience: '',
  tone: '',
  platforms: [] as string[],
  keywords: '',
  callToAction: '',
  length: 'medium',
  generateImage: true
})

// État de chargement et données
const publications = ref<Publication[]>([])
const loading = ref(false)
const error = ref('')

const filteredPublications = computed(() => {
  return publications.value.filter(publication => {
    const matchesSearch = !searchQuery.value || 
      publication.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      publication.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || publication.status === statusFilter.value
    const matchesPlatform = !platformFilter.value || publication.platforms.includes(platformFilter.value)
    
    return matchesSearch && matchesStatus && matchesPlatform
  })
})

const pendingCount = computed(() => publications.value.filter(p => p.status === 'scheduled').length)
const publishedCount = computed(() => publications.value.filter(p => p.status === 'published').length)
const draftCount = computed(() => publications.value.filter(p => p.status === 'draft').length)

const getStatusLabel = (status: string) => {
  const labels = {
    'draft': 'Brouillon',
    'scheduled': 'Programmée',
    'published': 'Publiée'
  }
  return labels[status as keyof typeof labels] || status
}

const getPlatformLabel = (platform: string) => {
  const labels = {
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'linkedin': 'LinkedIn',
    'website': 'Site web'
  }
  return labels[platform as keyof typeof labels] || platform
}

const getPlatformClass = (platform: string) => {
  const classes = {
    'facebook': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'instagram': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'linkedin': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'website': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
  return classes[platform as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getPlatformIcon = () => {
  // Retourne des composants d'icônes basiques
  return DocumentTextIcon
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

const openCreateModal = () => {
  editingPublication.value = null
  resetForm()
  showModal.value = true
}

const openAIGenerationModal = () => {
  resetAIForm()
  showAIModal.value = true
}

const closeAIModal = () => {
  showAIModal.value = false
  resetAIForm()
}

const editPublication = (publication: Publication) => {
  editingPublication.value = publication
  form.value = {
    title: publication.title,
    content: publication.content,
    hashtags: publication.hashtags,
    image: publication.image || '',
    platforms: [...publication.platforms],
    type: publication.type,
    status: publication.status,
    category: publication.category,
    keywords: publication.keywords,
    scheduledAt: publication.scheduledAt || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingPublication.value = null
  isAIGenerated.value = false
  aiGeneratedData.value = null
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    content: '',
    hashtags: '',
    image: '',
    platforms: [],
    type: 'standard',
    status: 'draft',
    category: '',
    keywords: '',
    scheduledAt: ''
  }
}

const resetAIForm = () => {
  aiForm.value = {
    topic: '',
    contentType: '',
    targetAudience: '',
    tone: '',
    platforms: [],
    keywords: '',
    callToAction: '',
    length: 'medium',
    generateImage: true
  }
}

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    try {
      // Upload vers le serveur
      const imageUrl = await publicationsService.uploadImage(file)
      form.value.image = imageUrl
      
      // Preview local pour l'interface
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.image = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      // Fallback vers preview local
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.image = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
}

const generateAIContent = async () => {
  try {
    aiLoading.value = true
    
    // Appeler le service d'IA pour générer le contenu
    const response = await publicationsService.generateContent({
      topic: aiForm.value.topic,
      contentType: aiForm.value.contentType,
      targetAudience: aiForm.value.targetAudience,
      tone: aiForm.value.tone,
      platforms: aiForm.value.platforms,
      keywords: aiForm.value.keywords,
      callToAction: aiForm.value.callToAction,
      length: aiForm.value.length,
      generateImage: aiForm.value.generateImage
    })
    
    if (response.success && response.data) {
      const { title, content, hashtags, image, suggestedKeywords } = response.data
      
      // Stocker les données générées par IA
      aiGeneratedData.value = response.data
      isAIGenerated.value = true
      
      // Pré-remplir le formulaire de création avec le contenu généré
      form.value = {
        title: title,
        content: content,
        hashtags: hashtags,
        image: image || '',
        platforms: [...aiForm.value.platforms],
        type: aiForm.value.contentType === 'promotional' ? 'promotion' : 
              aiForm.value.contentType === 'educational' ? 'tutorial' : 'standard',
        status: 'draft',
        category: '',
        keywords: suggestedKeywords || aiForm.value.keywords,
        scheduledAt: ''
      }
      
      // Fermer le modal IA et ouvrir le modal de création
      closeAIModal()
      showModal.value = true
    }
  } catch (error) {
    console.error('Erreur lors de la génération IA:', error)
    // TODO: Afficher un message d'erreur à l'utilisateur
  } finally {
    aiLoading.value = false
  }
}

const savePublication = async () => {
  try {

    if (editingPublication.value) {
      // Mise à jour d'une publication existante
      const response = await publicationsService.updatePublication({
        id: editingPublication.value.id,
        ...form.value
      })
      
      if (response.success && response.data) {
        const index = publications.value.findIndex(p => p.id === editingPublication.value!.id)
        publications.value[index] = response.data
      }
    } else {
      // Création d'une nouvelle publication
      const response = await publicationsService.createPublication(form.value)
      
      if (response.success && response.data) {
        publications.value.unshift(response.data)
      }
    }

    closeModal()
    
    // Actualiser les statistiques
    await loadPublications()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    // TODO: Afficher un message d'erreur à l'utilisateur
  }
}

const duplicatePublication = async (publication: Publication) => {
  try {
    const response = await publicationsService.duplicatePublication({
      id: publication.id,
      title: `${publication.title} (Copie)`
    })
    
    if (response.success && response.data) {
      publications.value.unshift(response.data)
    }
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
  }
}

const deletePublication = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
    try {
      const response = await publicationsService.deletePublication(id)
      
      if (response.success) {
        const index = publications.value.findIndex(p => p.id === id)
        publications.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const publishNow = async (publication: Publication) => {
  try {
    const response = await publicationsService.publishPublication(publication.id)
    
    if (response.success) {
      publication.status = 'published'
      publication.publishedAt = new Date().toISOString()
    }
  } catch (error) {
    console.error('Erreur lors de la publication:', error)
  }
}

// Fonctions de chargement des données
const loadPublications = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const filters = {
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      platform: platformFilter.value || undefined
    }
    
    const response = await publicationsService.getPublications(filters)
    
    if (response.success && response.data) {
      publications.value = response.data.publications || []
    }
  } catch (err) {
    console.error('Erreur lors du chargement des publications:', err)
    error.value = 'Erreur lors du chargement des publications'
  } finally {
    loading.value = false
  }
}

// Charger les publications au montage du composant
onMounted(() => {
  loadPublications()
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.form-label.required::after {
  content: " *";
  color: #ef4444;
}
</style>


