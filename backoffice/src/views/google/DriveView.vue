<template>
  <div class="p-4 h-full flex flex-col">
    <div class="mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <label class="text-sm text-gray-600 whitespace-nowrap">Dossier racine (ID)</label>
      <input 
        v-model="rootId" 
        @keyup.enter="loadRoot" 
        class="border rounded px-3 py-2 w-full sm:w-96" 
        placeholder="root ou ID dossier" 
      />
      <button @click="loadRoot" class="px-3 py-2 bg-blue-600 text-white rounded whitespace-nowrap w-full sm:w-auto">
        Charger
      </button>
    </div>

    <div class="flex-1 flex flex-col gap-4 min-h-0">
      <!-- Arbre des fichiers - Toujours pleine largeur -->
      <div class="bg-white rounded border overflow-auto p-2 w-full">
        <ul class="text-sm">
          <DriveNode
            v-for="node in tree"
            :key="node.id"
            :node="node"
            @select="onSelect"
            @toggle="toggle"
          />
        </ul>
      </div>

      <!-- Zone de prévisualisation - Toujours pleine largeur -->
      <div class="bg-white rounded border p-3 overflow-auto w-full">
        <div v-if="selected">
          <h2 class="text-lg font-semibold mb-2">{{ selected.name }}</h2>
          <p class="text-xs text-gray-500 mb-3">{{ selected.mimeType }} · {{ selected.id }}</p>
          <div v-if="previewUrl" class="h-[300px] flex justify-center">
            <iframe 
              :src="previewUrl" 
              class="w-full max-w-[400px] h-[300px] border rounded shadow-sm" 
              allow="autoplay"
            ></iframe>
          </div>
          <div v-else class="text-gray-500">Aucune prévisualisation disponible.</div>
        </div>
        <div v-else class="text-gray-500">Sélectionnez un élément dans l'arbre.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import googleDriveService, { type DriveItem } from '../../services/drive'
import DriveNode from '../../components/DriveNode.vue'

type TreeNode = DriveItem & { children?: TreeNode[]; expanded?: boolean }

export default defineComponent({
  name: 'DriveView',
  components: {
    DriveNode
  },
  setup() {
    const rootId = ref<string>('root')
    const tree = ref<TreeNode[]>([])
    const selected = ref<DriveItem | null>(null)
    
    const previewUrl = computed(() => 
      selected.value ? googleDriveService.getPreviewUrl(selected.value) : null
    )

    async function loadRoot() {
      try {
        const children = await googleDriveService.listChildren(rootId.value)
        tree.value = children.map(toNode)
        selected.value = null
      } catch (error) {
        console.error('Erreur lors du chargement du dossier racine:', error)
      }
    }

    function toNode(item: DriveItem): TreeNode {
      return { 
        ...item, 
        children: item.type === 'folder' ? [] : undefined, 
        expanded: false 
      }
    }

    async function toggle(node: TreeNode) {
      if (node.type !== 'folder') return
      
      node.expanded = !node.expanded
      
      if (node.expanded && node.children && node.children.length === 0) {
        try {
          const children = await googleDriveService.listChildren(node.id)
          node.children = children.map(toNode)
        } catch (error) {
          console.error('Erreur lors du chargement des enfants:', error)
        }
      }
    }

    function onSelect(node: TreeNode) {
      selected.value = node
    }

    onMounted(() => {
      loadRoot()
    })

    return {
      rootId,
      tree,
      selected,
      previewUrl,
      loadRoot,
      toggle,
      onSelect
    }
  }
})
</script>


