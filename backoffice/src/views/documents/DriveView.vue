<template>
  <div class="p-4 h-full flex flex-col">
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-4">
      <div class="p-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Documents Google Drive</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Gérez vos dossiers et fichiers, et prévisualisez les documents extraits.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="loadRoot" :disabled="loadingTree" class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <span v-if="loadingTree" class="inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></span>
            Rafraîchir
          </button>
        </div>
      </div>
    </div>
    <div class="flex-1 grid grid-cols-12 gap-4 min-h-0">
      <div class="col-span-4 bg-white rounded border overflow-auto p-2">
        <ul class="text-sm relative">
          <div v-if="loadingTree" class="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center z-10">
            <div class="w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
          <DriveNode
            v-for="node in tree"
            :key="node.id"
            :node="node"
            @select="onSelect"
          />
        </ul>
      </div>

      <div class="col-span-8 bg-white rounded border p-3 overflow-auto">
        <div v-if="selected">
          <h2 class="text-lg font-semibold mb-2">{{ selected.name }}</h2>
          <p class="text-xs text-gray-500 mb-3">{{ selected.mimeType }} · {{ selected.id }}</p>
          <div class="flex items-center gap-2 mb-3">
            <!-- Dropdown Analyser -->
            <div class="relative" v-if="isFile(selected)">
              <button
                @click="showAnalyzeDropdown = !showAnalyzeDropdown"
                class="px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-1"
              >
                Analyser
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div v-if="showAnalyzeDropdown" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                <button
                  @click="analyze('client_invoice'); showAnalyzeDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Facture client
                </button>
                <button
                  @click="analyze('supplier_invoice'); showAnalyzeDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Facture fournisseur
                </button>
                <button
                  @click="analyze('quote'); showAnalyzeDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Devis
                </button>
              </div>
            </div>

            <!-- Dropdown Créer -->
            <div class="relative" v-if="isFile(selected)">
              <button
                @click="showCreateDropdown = !showCreateDropdown"
                class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1"
              >
                Créer
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div v-if="showCreateDropdown" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                <button
                  @click="create('client_invoice'); showCreateDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Facture client
                </button>
                <button
                  @click="create('supplier_invoice'); showCreateDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Facture fournisseur
                </button>
                <button
                  @click="create('quote'); showCreateDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Devis
                </button>
              </div>
            </div>

            <span class="mx-2 text-gray-300">|</span>
            <button
              class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              :disabled="!isFile(selected)"
              @click="openDocument()"
            >
              Ouvrir
            </button>
            <button
              class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              :disabled="!isFile(selected)"
              @click="downloadDocument()"
            >
              Télécharger
            </button>
          </div>
          <div v-if="previewUrl" class="h-[70vh]">
            <iframe :src="previewUrl" class="w-full h-full" allow="autoplay"></iframe>
          </div>
          <div v-else class="text-gray-500">Aucune prévisualisation disponible.</div>
        </div>
        <div v-else class="text-gray-500">Sélectionnez un élément à droite.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h, type PropType } from 'vue'
import googleDriveService, { type DriveItem } from '../../services/drive'


type TreeNode = DriveItem & { children?: TreeNode[]; expanded?: boolean }
const tree = ref<TreeNode[]>([])
const selected = ref<DriveItem | null>(null)
const previewUrl = computed(() => (selected.value ? googleDriveService.getPreviewUrl(selected.value) : null))
const loadingTree = ref(false)
const loadingFolders = ref<Set<string>>(new Set())
const showAnalyzeDropdown = ref(false)
const showCreateDropdown = ref(false)

async function loadRoot(): Promise<void> {
  loadingTree.value = true
  const data = await googleDriveService.listChildren()
  // Ouvrir tous les dossiers par défaut
  const expandAll = (nodes: any[]): any[] => {
    return (nodes || []).map((n: any) => ({
      ...n,
      expanded: true,
      children: n?.children ? expandAll(n.children) : n.children
    }))
  }
  tree.value = expandAll(data)
  selected.value = null
  loadingTree.value = false
}

function onSelect(node: TreeNode): void {
  selected.value = node
  // Fermer les dropdowns quand on sélectionne un nouvel élément
  showAnalyzeDropdown.value = false
  showCreateDropdown.value = false
}

loadRoot()

// Composant récursif pour afficher l'arborescence
const FOLDER_MIME = 'application/vnd.google-apps.folder'
const isFolder = (n: { mimeType?: string | null }) => n.mimeType === FOLDER_MIME
const isFile = (n: { mimeType?: string | null } | null) => !!n && n.mimeType !== FOLDER_MIME

function analyze(mode: 'client_invoice' | 'supplier_invoice' | 'quote'): void {
  if (!selected.value || !isFile(selected.value)) return
  console.log('analyze request', { id: selected.value.id, name: selected.value.name, mode })
  // À connecter plus tard au backend (POST /drive/analyze)
}

function create(mode: 'client_invoice' | 'supplier_invoice' | 'quote'): void {
  if (!selected.value || !isFile(selected.value)) return
  console.log('create request', { id: selected.value.id, name: selected.value.name, mode })
  // À connecter plus tard au backend (POST /drive/create)
}

function openDocument(): void {
  if (!selected.value || !isFile(selected.value)) return
  const url = `https://drive.google.com/file/d/${selected.value.id}`
  window.open(url, '_blank')
}

function downloadDocument(): void {
  if (!selected.value || !isFile(selected.value)) return
  const url = `https://drive.google.com/file/d/${selected.value.id}/view`
  const a = document.createElement('a')
  a.href = url
  a.download = selected.value.name || 'document'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const DriveNode = defineComponent({
  name: 'DriveNode',
  props: { node: { type: Object as PropType<TreeNode>, required: true } },
  emits: ['select'],
  setup(props, { emit }): any {
    const toggleNode = async (e: Event): Promise<void> => {
      e.stopPropagation()
      const n = props.node
      if (!isFolder(n)) return
      n.expanded = !n.expanded
      if (n.expanded && (!n.children || n.children.length === 0)) {
        loadingFolders.value.add(n.id)
        try {
          const children = await googleDriveService.listChildren()
          n.children = (children || []).map((c: any) => ({ ...c, expanded: true }))
        } finally {
          loadingFolders.value.delete(n.id)
        }
      }
    }

    const selectOrToggle = (e: Event): void => {
      if (isFolder(props.node)) {
        toggleNode(e)
      } else {
        emit('select', props.node)
      }
    }

    return (): any => h('li', [
      h(
        'div',
        { class: 'flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-1', onClick: selectOrToggle },
        [
          isFolder(props.node)
            ? h(
                'span',
                { class: 'w-6 text-center inline-flex items-center justify-center' },
                loadingFolders.value.has(props.node.id)
                  ? h('span', { class: 'w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin inline-block' })
                  : (props.node.expanded ? '📂' : '📁')
              )
            : h('span', { class: 'w-6 text-center' }, '📄'),
          h('span', { class: isFolder(props.node) ? 'font-medium' : '' }, props.node.name)
        ]
      ),
      props.node.expanded && props.node.children && props.node.children.length > 0
        ? h('ul', { class: 'ml-5' }, props.node.children.map((c: any) => h(DriveNode, { node: c, onSelect: (node: any) => emit('select', node) })))
        : null
    ])
  }
})
</script>



