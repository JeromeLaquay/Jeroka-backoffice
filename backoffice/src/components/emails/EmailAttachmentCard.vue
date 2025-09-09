<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
    <!-- En-tête du fichier -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="text-2xl">{{ emailsService.getFileIcon(attachment.mimeType) }}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900 dark:text-white truncate" :title="attachment.originalName">
            {{ attachment.originalName }}
          </h3>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ emailsService.formatFileSize(attachment.size) }}</span>
            <span>•</span>
            <span>{{ emailsService.formatDate(attachment.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Menu d'actions rapides -->
      <div class="flex gap-1">
        <button
          @click="$emit('download', attachment.id)"
          class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Télécharger"
        >
          ⬇️
        </button>
        <button
          v-if="!attachment.analyzed"
          @click="$emit('analyze', attachment.id)"
          :disabled="analyzing"
          class="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
          title="Analyser avec IA"
        >
          🤖
        </button>
        <button
          v-else
          @click="$emit('view-analysis', attachment)"
          class="p-1 text-gray-400 hover:text-purple-600 transition-colors"
          title="Voir l'analyse"
        >
          👁️
        </button>
      </div>
    </div>

    <!-- Statut et badges -->
    <div class="flex items-center gap-2 mb-3">
      <!-- Statut d'analyse -->
      <span
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          attachment.analyzed
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        ]"
      >
        {{ emailsService.getAnalysisStatusText(attachment.analyzed) }}
      </span>
      
      <!-- Type de document détecté -->
      <span
        v-if="attachment.analyzed && attachment.analysisResult"
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          `bg-${emailsService.getDocumentTypeColor(attachment.analysisResult.type)}-100`,
          `text-${emailsService.getDocumentTypeColor(attachment.analysisResult.type)}-800`
        ]"
      >
        {{ emailsService.getDocumentTypeText(attachment.analysisResult.type) }}
      </span>
      
      <!-- Indicateur PDF -->
      <span
        v-if="emailsService.isPDF(attachment.mimeType)"
        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      >
        PDF
      </span>
    </div>

    <!-- Résultats d'analyse si disponibles -->
    <div v-if="attachment.analyzed && attachment.analysisResult && showAnalysisPreview" class="border-t border-gray-200 dark:border-gray-600 pt-3">
      <div class="space-y-2">
        <!-- Montant détecté -->
        <div v-if="attachment.analysisResult.amount > 0" class="flex justify-between items-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">Montant détecté:</span>
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ attachment.analysisResult.amount.toFixed(2) }} {{ attachment.analysisResult.currency }}
          </span>
        </div>
        
        <!-- Confiance -->
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">Confiance:</span>
          <span class="text-sm text-gray-900 dark:text-white">
            {{ (attachment.analysisResult.confidence * 100).toFixed(1) }}%
          </span>
        </div>
        
        <!-- Informations extraites -->
        <div v-if="attachment.analysisResult.extractedData" class="text-xs text-gray-500 dark:text-gray-400">
          <div v-if="attachment.analysisResult.extractedData.supplier">
            Fournisseur: {{ attachment.analysisResult.extractedData.supplier }}
          </div>
          <div v-if="attachment.analysisResult.extractedData.client">
            Client: {{ attachment.analysisResult.extractedData.client }}
          </div>
          <div v-if="attachment.analysisResult.extractedData.invoiceNumber">
            N° Facture: {{ attachment.analysisResult.extractedData.invoiceNumber }}
          </div>
          <div v-if="attachment.analysisResult.extractedData.quoteNumber">
            N° Devis: {{ attachment.analysisResult.extractedData.quoteNumber }}
          </div>
        </div>
      </div>
    </div>

    <!-- Actions détaillées -->
    <div v-if="showActions" class="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
      <div class="flex gap-2">
        <button
          @click="$emit('download', attachment.id)"
          class="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 transition-colors"
        >
          ⬇️ Télécharger
        </button>
        
        <button
          v-if="!attachment.analyzed"
          @click="$emit('analyze', attachment.id)"
          :disabled="analyzing"
          class="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 disabled:opacity-50 transition-colors"
        >
          🤖 {{ analyzing ? 'Analyse...' : 'Analyser' }}
        </button>
        
        <template v-else>
          <button
            @click="$emit('view-analysis', attachment)"
            class="flex-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 transition-colors"
          >
            👁️ Détails
          </button>
          
          <button
            v-if="attachment.analysisResult?.suggestions.createInvoice"
            @click="$emit('convert-to-invoice', attachment)"
            class="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 transition-colors"
          >
            📄 Facture
          </button>
          
          <button
            v-if="attachment.analysisResult?.suggestions.createQuote"
            @click="$emit('convert-to-quote', attachment)"
            class="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-200 transition-colors"
          >
            📝 Devis
          </button>
        </template>
      </div>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="analyzing" class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        Analyse en cours...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import emailsService, { type EmailAttachment } from '@/services/emails'

interface Props {
  attachment: EmailAttachment
  showAnalysisPreview?: boolean
  showActions?: boolean
  analyzing?: boolean
}

withDefaults(defineProps<Props>(), {
  showAnalysisPreview: true,
  showActions: true,
  analyzing: false
})

defineEmits<{
  download: [attachmentId: string]
  analyze: [attachmentId: string]
  'view-analysis': [attachment: EmailAttachment]
  'convert-to-invoice': [attachment: EmailAttachment]
  'convert-to-quote': [attachment: EmailAttachment]
}>()
</script>

<style scoped>
.relative {
  position: relative;
}
</style>
