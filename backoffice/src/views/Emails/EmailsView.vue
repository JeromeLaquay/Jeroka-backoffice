<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Emails</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez vos emails, catégories et analysez automatiquement vos documents
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="showCategoryModal = true"
          class="btn-secondary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle Catégorie
        </button>
        <button
          @click="showSyncModal = true"
          :disabled="syncing"
          class="btn-primary inline-flex items-center"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ syncing ? 'Synchronisation...' : 'Synchroniser' }}
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Emails
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ emailStats.total }}
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Avec Pièces Jointes
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ emailStats.withAttachments }}
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Catégorisés
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ emailStats.categorized }}
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
              <svg class="h-6 w-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Non Catégorisés
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ emailStats.uncategorized }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          {{ tab.icon }} {{ tab.name }}
          <span v-if="tab.count" class="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="card">
      
      <!-- Onglet Catégories -->
      <div v-if="activeTab === 'categories'" class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Catégories d'Emails
          </h2>
        </div>
        
        <div v-if="loading.categories" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="categories.length === 0" class="text-center py-12">
          <span class="text-6xl mb-4 block">📂</span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune catégorie
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Créez votre première catégorie pour organiser vos emails
          </p>
          <button
            @click="showCategoryModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer une catégorie
          </button>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="category in categories"
            :key="category.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ category.name }}
              </h3>
              <div class="flex gap-2">
                <button
                  @click="editCategory(category)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ✏️
                </button>
                <button
                  @click="deleteCategory(category.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span :class="category.downloadAttachments ? 'text-green-600' : 'text-gray-400'">
                {{ category.downloadAttachments ? '📎 Télécharge les PJ' : '🚫 Ignore les PJ' }}
              </span>
            </div>
            
            <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Créée le {{ emailsService.formatDate(category.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet Expéditeurs -->
      <div v-if="activeTab === 'senders'" class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Expéditeurs d'Emails
          </h2>
          <div class="flex gap-2">
            <select
              v-model="senderFilter"
              class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Tous les expéditeurs</option>
              <option value="categorized">Catégorisés</option>
              <option value="uncategorized">Non catégorisés</option>
            </select>
          </div>
        </div>
        
        <div v-if="loading.senders" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="filteredSenders.length === 0" class="text-center py-12">
          <span class="text-6xl mb-4 block">📮</span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun expéditeur
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Synchronisez vos emails pour voir les expéditeurs
          </p>
        </div>
        
        <div v-else class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expéditeur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Catégorie
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="sender in filteredSenders" :key="sender.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ sender.name || sender.email }}
                    </div>
                    <div v-if="sender.name" class="text-sm text-gray-500 dark:text-gray-400">
                      {{ sender.email }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    :value="sender.categoryId || ''"
                    @change="assignSenderToCategory(sender.id, $event.target.value)"
                    class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Aucune catégorie</option>
                    <option
                      v-for="category in categories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span v-if="sender.categoryId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Catégorisé
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Non catégorisé
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Onglet Emails -->
      <div v-if="activeTab === 'emails'" class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Liste des Emails
          </h2>
          <div class="flex gap-2">
            <select
              v-model="emailFilter"
              class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Toutes les catégories</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                v-model="onlyWithAttachments"
                type="checkbox"
                class="rounded border-gray-300"
              >
              Avec pièces jointes uniquement
            </label>
          </div>
        </div>
        
        <div v-if="loading.emails" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="emails.length === 0" class="text-center py-12">
          <span class="text-6xl mb-4 block">📧</span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun email
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Synchronisez votre boîte mail pour voir vos emails
          </p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="email in emails"
            :key="email.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ email.subject }}
                  </h3>
                  <span v-if="email.hasAttachments" class="text-gray-400">📎</span>
                  <span
                    v-if="email.categoryId"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {{ getCategoryName(email.categoryId) }}
                  </span>
                </div>
                
                <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>De: {{ email.from }}</span>
                  <span>{{ emailsService.formatDate(email.date) }}</span>
                  <span v-if="email.hasAttachments">
                    {{ email.attachments.length }} pièce(s) jointe(s)
                  </span>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  v-if="email.hasAttachments"
                  @click="viewAttachments(email)"
                  class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                >
                  Voir PJ
                </button>
              </div>
            </div>
            
            <!-- Pièces jointes -->
            <div v-if="email.hasAttachments && email.showAttachments" class="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pièces jointes:
              </h4>
              <div class="space-y-2">
                <div
                  v-for="attachment in email.attachments"
                  :key="attachment.id"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div class="flex items-center gap-3">
                    <span>{{ emailsService.getFileIcon(attachment.mimeType) }}</span>
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ attachment.originalName }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ emailsService.formatFileSize(attachment.size) }}
                      </div>
                    </div>
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        attachment.analyzed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      ]"
                    >
                      {{ emailsService.getAnalysisStatusText(attachment.analyzed) }}
                    </span>
                  </div>
                  
                  <div class="flex gap-2">
                    <button
                      @click="downloadAttachment(attachment.id)"
                      class="text-blue-600 hover:text-blue-800 text-sm"
                      title="Télécharger"
                    >
                      ⬇️
                    </button>
                    <button
                      v-if="!attachment.analyzed"
                      @click="analyzeAttachment(attachment.id)"
                      class="text-green-600 hover:text-green-800 text-sm"
                      title="Analyser avec IA"
                    >
                      🤖
                    </button>
                    <button
                      v-if="attachment.analyzed"
                      @click="viewAnalysis(attachment)"
                      class="text-purple-600 hover:text-purple-800 text-sm"
                      title="Voir l'analyse"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="emailPagination.totalPages > 1" class="flex justify-center mt-6">
            <nav class="flex items-center gap-2">
              <button
                @click="loadEmails(emailPagination.page - 1)"
                :disabled="emailPagination.page <= 1"
                class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Précédent
              </button>
              
              <span class="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                Page {{ emailPagination.page }} sur {{ emailPagination.totalPages }}
              </span>
              
              <button
                @click="loadEmails(emailPagination.page + 1)"
                :disabled="emailPagination.page >= emailPagination.totalPages"
                class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Catégorie -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
        </h3>
        
        <form @submit.prevent="saveCategory">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom de la catégorie
            </label>
            <input
              v-model="categoryForm.name"
              type="text"
              required
              class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Fournisseurs, Clients..."
            >
          </div>
          
          <div class="mb-6">
            <label class="flex items-center gap-2">
              <input
                v-model="categoryForm.downloadAttachments"
                type="checkbox"
                class="rounded border-gray-300"
              >
              <span class="text-sm text-gray-700 dark:text-gray-300">
                Télécharger automatiquement les pièces jointes (PDF)
              </span>
            </label>
          </div>
          
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="closeCategoryModal"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? 'Enregistrement...' : (editingCategory ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Analyse -->
    <div v-if="showAnalysisModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Résultat de l'analyse IA
        </h3>
        
        <div v-if="currentAnalysis" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type détecté:</label>
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium',
                `bg-${emailsService.getDocumentTypeColor(currentAnalysis.type)}-100 text-${emailsService.getDocumentTypeColor(currentAnalysis.type)}-800`
              ]">
                {{ emailsService.getDocumentTypeText(currentAnalysis.type) }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confiance:</label>
              <span class="text-sm text-gray-900 dark:text-white">{{ (currentAnalysis.confidence * 100).toFixed(1) }}%</span>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant:</label>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ currentAnalysis.amount.toFixed(2) }} {{ currentAnalysis.currency }}
              </span>
            </div>
          </div>
          
          <div v-if="currentAnalysis.extractedData">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-2">Données extraites:</h4>
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm">
              <pre class="whitespace-pre-wrap text-gray-900 dark:text-white">{{ JSON.stringify(currentAnalysis.extractedData, null, 2) }}</pre>
            </div>
          </div>
          
          <div class="flex justify-end gap-3">
            <button
              @click="closeAnalysisModal"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
            >
              Fermer
            </button>
            <button
              v-if="currentAnalysis.suggestions.createInvoice"
              @click="convertToInvoice"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer une facture
            </button>
            <button
              v-if="currentAnalysis.suggestions.createQuote"
              @click="convertToQuote"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Créer un devis
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Configuration de Synchronisation -->
  <div 
    v-if="showSyncModal" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeSyncModal"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
      
      <div 
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <form @submit.prevent="startSyncWithOptions">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Options de Synchronisation
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configurez les paramètres de synchronisation des emails
                </p>
              </div>
              <button
                type="button"
                @click="closeSyncModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <!-- Mode de synchronisation -->
              <div>
                <label class="form-label required">Mode de synchronisation</label>
                <div class="space-y-2 mt-2">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="syncOptions.mode"
                      value="since_last"
                      class="form-radio"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Depuis la dernière synchronisation
                    </span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="syncOptions.mode"
                      value="count"
                      class="form-radio"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Nombre spécifique d'emails
                    </span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="radio"
                      v-model="syncOptions.mode"
                      value="date_range"
                      class="form-radio"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Période spécifique
                    </span>
                  </label>
                </div>
              </div>

              <!-- Nombre d'emails (si mode count) -->
              <div v-if="syncOptions.mode === 'count'">
                <label class="form-label">Nombre d'emails à synchroniser</label>
                <select v-model="syncOptions.count" class="form-input">
                  <option value="50">50 derniers emails</option>
                  <option value="100">100 derniers emails</option>
                  <option value="200">200 derniers emails</option>
                  <option value="500">500 derniers emails</option>
                  <option value="1000">1000 derniers emails</option>
                </select>
              </div>

              <!-- Période (si mode date_range) -->
              <div v-if="syncOptions.mode === 'date_range'" class="space-y-3">
                <div>
                  <label class="form-label">Date de début</label>
                  <input
                    type="date"
                    v-model="syncOptions.dateFrom"
                    class="form-input"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Date de fin</label>
                  <input
                    type="date"
                    v-model="syncOptions.dateTo"
                    class="form-input"
                    :max="today"
                    required
                  />
                </div>
              </div>

              <!-- Info dernière synchronisation -->
              <div v-if="syncOptions.mode === 'since_last'" class="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-lg p-4">
                <div class="flex">
                  <svg class="h-5 w-5 text-info-600 dark:text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="ml-3">
                    <p class="text-sm text-info-800 dark:text-info-200">
                      <strong>Dernière synchronisation :</strong><br>
                      {{ lastSyncDate ? formatDate(lastSyncDate) : 'Jamais synchronisé' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Options avancées -->
              <div>
                <label class="form-label">Options avancées</label>
                <div class="space-y-2 mt-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="syncOptions.includeAttachments"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Inclure les pièces jointes
                    </span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="syncOptions.autoAnalyze"
                      class="form-checkbox"
                    />
                    <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Analyser automatiquement les nouveaux emails
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="syncing || !isValidSyncConfig"
              class="btn-primary mb-3 sm:mb-0 sm:ml-3"
            >
              <span v-if="!syncing">Démarrer la synchronisation</span>
              <span v-else class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Synchronisation...
              </span>
            </button>
            <button
              type="button"
              @click="closeSyncModal"
              class="btn-secondary"
              :disabled="syncing"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import emailsService, { 
  type EmailCategory, 
  type EmailSender, 
  type Email, 
  type EmailAttachment,
  type AnalysisResult,
  type CreateCategoryRequest,
  type UpdateCategoryRequest
} from '@/services/emails'

const router = useRouter()

// État réactif
const activeTab = ref('categories')
const categories = ref<EmailCategory[]>([])
const senders = ref<EmailSender[]>([])
const emails = ref<Email[]>([])

// Chargement
const loading = ref({
  categories: false,
  senders: false,
  emails: false
})

const syncing = ref(false)
const saving = ref(false)

// Filtres
const senderFilter = ref('')
const emailFilter = ref('')
const onlyWithAttachments = ref(false)

// Pagination
const emailPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// Modals
const showCategoryModal = ref(false)
const showAnalysisModal = ref(false)
const showSyncModal = ref(false)
const editingCategory = ref<EmailCategory | null>(null)
const categoryForm = ref<CreateCategoryRequest>({
  name: '',
  downloadAttachments: true
})

// Options de synchronisation
const syncOptions = ref({
  mode: 'since_last', // 'since_last' | 'count' | 'date_range'
  count: 100,
  dateFrom: '',
  dateTo: '',
  includeAttachments: true,
  autoAnalyze: false
})

const lastSyncDate = ref<string | null>(null)

// Analyse
const currentAnalysis = ref<AnalysisResult | null>(null)
const currentAttachmentId = ref<string | null>(null)

// Computed
const tabs = computed(() => [
  {
    id: 'categories',
    name: 'Catégories',
    icon: '📂',
    count: categories.value.length
  },
  {
    id: 'senders',
    name: 'Expéditeurs',
    icon: '📮',
    count: senders.value.length
  },
  {
    id: 'emails',
    name: 'Emails',
    icon: '📧',
    count: emails.value.length
  }
])

const emailStats = computed(() => {
  return emailsService.getEmailStats(emails.value)
})

const filteredSenders = computed(() => {
  if (!senderFilter.value) return senders.value
  
  if (senderFilter.value === 'categorized') {
    return senders.value.filter(s => s.categoryId)
  }
  
  if (senderFilter.value === 'uncategorized') {
    return senders.value.filter(s => !s.categoryId)
  }
  
  return senders.value
})

// Date d'aujourd'hui pour validation
const today = computed(() => new Date().toISOString().split('T')[0])

// Validation de la configuration de synchronisation
const isValidSyncConfig = computed(() => {
  if (syncOptions.value.mode === 'date_range') {
    return syncOptions.value.dateFrom && syncOptions.value.dateTo && 
           syncOptions.value.dateFrom <= syncOptions.value.dateTo
  }
  return true
})

// Méthodes
const loadCategories = async () => {
  loading.value.categories = true
  try {
    const response = await emailsService.getCategories()
    if (response.success && response.data) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
  } finally {
    loading.value.categories = false
  }
}

const loadSenders = async () => {
  loading.value.senders = true
  try {
    const response = await emailsService.getSenders()
    if (response.success && response.data) {
      senders.value = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des expéditeurs:', error)
  } finally {
    loading.value.senders = false
  }
}

const loadEmails = async (page = 1) => {
  loading.value.emails = true
  try {
    const params = {
      page,
      limit: emailPagination.value.limit,
      categoryId: emailFilter.value || undefined,
      hasAttachments: onlyWithAttachments.value || undefined
    }
    
    const response = await emailsService.getEmails(params)
    if (response.success && response.data) {
      emails.value = response.data.data
      emailPagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Erreur lors du chargement des emails:', error)
  } finally {
    loading.value.emails = false
  }
}

// Fonctions de synchronisation
const closeSyncModal = () => {
  showSyncModal.value = false
  // Réinitialiser les options si nécessaire
}

const startSyncWithOptions = async () => {
  syncing.value = true
  try {
    const syncConfig = {
      mode: syncOptions.value.mode,
      count: syncOptions.value.mode === 'count' ? syncOptions.value.count : undefined,
      dateFrom: syncOptions.value.mode === 'date_range' ? syncOptions.value.dateFrom : undefined,
      dateTo: syncOptions.value.mode === 'date_range' ? syncOptions.value.dateTo : undefined,
      includeAttachments: syncOptions.value.includeAttachments,
      autoAnalyze: syncOptions.value.autoAnalyze
    }

    const response = await emailsService.syncEmails(syncConfig)
    if (response.success) {
      // Mettre à jour la date de dernière synchronisation
      const now = new Date().toISOString()
      lastSyncDate.value = now
      localStorage.setItem('emails_last_sync', now)
      
      // Recharger les données après la synchronisation
      await Promise.all([loadEmails(), loadSenders()])
      
      // Fermer le modal
      closeSyncModal()
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error)
  } finally {
    syncing.value = false
  }
}

// Fonction helper pour formater les dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveCategory = async () => {
  const errors = emailsService.validateCategoryData(categoryForm.value)
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }
  
  saving.value = true
  try {
    if (editingCategory.value) {
      const response = await emailsService.updateCategory(editingCategory.value.id, categoryForm.value)
      if (response.success) {
        await loadCategories()
      }
    } else {
      const response = await emailsService.createCategory(categoryForm.value)
      if (response.success) {
        await loadCategories()
      }
    }
    closeCategoryModal()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    saving.value = false
  }
}

const editCategory = (category: EmailCategory) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    downloadAttachments: category.downloadAttachments
  }
  showCategoryModal.value = true
}

const deleteCategory = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return
  
  try {
    await emailsService.deleteCategory(id)
    await loadCategories()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    downloadAttachments: true
  }
}

const assignSenderToCategory = async (senderId: string, categoryId: string) => {
  try {
    await emailsService.assignSenderToCategory(senderId, {
      categoryId: categoryId || null
    })
    await loadSenders()
  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error)
  }
}

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || 'Inconnue'
}

const viewAttachments = (email: Email) => {
  email.showAttachments = !email.showAttachments
}

const downloadAttachment = async (attachmentId: string) => {
  try {
    const response = await emailsService.downloadAttachment(attachmentId)
    if (response.success && response.data) {
      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = response.data.filename
      link.click()
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  }
}

const analyzeAttachment = async (attachmentId: string) => {
  try {
    const response = await emailsService.analyzeAttachment(attachmentId, {
      analysisType: 'auto'
    })
    if (response.success && response.data) {
      currentAttachmentId.value = attachmentId
      currentAnalysis.value = response.data.analysisResult
      showAnalysisModal.value = true
      
      // Recharger les emails pour voir le statut mis à jour
      await loadEmails(emailPagination.value.page)
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error)
  }
}

const viewAnalysis = (attachment: EmailAttachment) => {
  if (attachment.analysisResult) {
    currentAttachmentId.value = attachment.id
    currentAnalysis.value = attachment.analysisResult
    showAnalysisModal.value = true
  }
}

const closeAnalysisModal = () => {
  showAnalysisModal.value = false
  currentAnalysis.value = null
  currentAttachmentId.value = null
}

const convertToInvoice = async () => {
  if (!currentAttachmentId.value || !currentAnalysis.value) return
  
  try {
    const response = await emailsService.convertAttachment(currentAttachmentId.value, {
      convertTo: 'invoice',
      analysisData: currentAnalysis.value
    })
    
    if (response.success && response.data) {
      closeAnalysisModal()
      // Rediriger vers la facture créée
      router.push(response.data.redirectUrl)
    }
  } catch (error) {
    console.error('Erreur lors de la conversion:', error)
  }
}

const convertToQuote = async () => {
  if (!currentAttachmentId.value || !currentAnalysis.value) return
  
  try {
    const response = await emailsService.convertAttachment(currentAttachmentId.value, {
      convertTo: 'quote',
      analysisData: currentAnalysis.value
    })
    
    if (response.success && response.data) {
      closeAnalysisModal()
      // Rediriger vers le devis créé
      router.push(response.data.redirectUrl)
    }
  } catch (error) {
    console.error('Erreur lors de la conversion:', error)
  }
}

// Watchers
watch([emailFilter, onlyWithAttachments], () => {
  loadEmails(1)
})

// Lifecycle
onMounted(async () => {
  // Initialiser les dates par défaut pour la synchronisation
  const today = new Date()
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  syncOptions.value.dateTo = today.toISOString().split('T')[0]
  syncOptions.value.dateFrom = lastWeek.toISOString().split('T')[0]
  
  // Charger la date de dernière synchronisation depuis le localStorage
  const savedLastSync = localStorage.getItem('emails_last_sync')
  if (savedLastSync) {
    lastSyncDate.value = savedLastSync
  }
  
  await Promise.all([
    loadCategories(),
    loadSenders(),
    loadEmails()
  ])
})
</script>

<style scoped>
/* Styles personnalisés pour l'affichage cohérent */
.form-label.required::after {
  content: " *";
  color: #ef4444;
}

/* Animation pour les éléments de chargement */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
