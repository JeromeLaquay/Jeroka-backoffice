<template>
  <div class="p-4 h-full flex flex-col">
    <div class="mb-3 flex items-center gap-2">
      <label class="text-sm text-gray-600">Dossier racine (ID)</label>
      <input v-model="rootId" @keyup.enter="loadRoot" class="border rounded px-3 py-2 w-96" placeholder="root ou ID dossier" />
      <button @click="loadRoot" class="px-3 py-2 bg-blue-600 text-white rounded">Charger</button>
    </div>

    <div class="flex-1 grid grid-cols-12 gap-4 min-h-0">
      <div class="col-span-4 bg-white rounded border overflow-auto p-2">
        <ul class="text-sm">
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
import { ref, computed } from 'vue'
import googleDriveService, { type DriveItem } from '../../services/drive'

type TreeNode = DriveItem & { children?: TreeNode[]; expanded?: boolean }

const rootId = ref<string>('root')
const tree = ref<TreeNode[]>([])
const selected = ref<DriveItem | null>(null)
const previewUrl = computed(() => (selected.value ? googleDriveService.getPreviewUrl(selected.value) : null))

async function loadRoot() {
  const children = await googleDriveService.listChildren(rootId.value)
  tree.value = children.map(toNode)
  selected.value = null
}

function toNode(item: DriveItem): TreeNode {
  return { ...item, children: item.type === 'folder' ? [] : undefined, expanded: false }
}

async function toggle(node: TreeNode) {
  if (node.type !== 'folder') return
  node.expanded = !node.expanded
  if (node.expanded && node.children && node.children.length === 0) {
    const children = await googleDriveService.listChildren(node.id)
    node.children = children.map(toNode)
  }
}

function onSelect(node: TreeNode) {
  selected.value = node
}

loadRoot()
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import googleDriveService, { type DriveItem } from '../../services/drive'

export default defineComponent({
  name: 'DriveNode',
  props: {
    node: { type: Object as () => (DriveItem & { children?: any[]; expanded?: boolean }), required: true }
  },
  emits: ['select'],
  methods: {
    async toggleNode() {
      const n: any = this.node
      if (n.type !== 'folder') return
      n.expanded = !n.expanded
      if (n.expanded && (!n.children || n.children.length === 0)) {
        const kids = await googleDriveService.listChildren(n.id)
        n.children = kids.map((k) => ({ ...k, children: k.type === 'folder' ? [] : undefined, expanded: false }))
        this.$forceUpdate()
      }
    }
  },
  render() {
    const n: any = this.node
    return (
      <li>
        <div class={['flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-1']}
             onClick={() => this.$emit('select', n)}>
          {n.type === 'folder' ? (
            <button class="text-xs border rounded px-1 w-6" onClick={(e:any)=>{e.stopPropagation(); this.toggleNode()}}>
              {n.expanded ? '-' : '+'}
            </button>
          ) : (
            <span class="w-6 text-center">•</span>
          )}
          <span>{n.name}</span>
        </div>
        {n.expanded && n.children && n.children.length > 0 ? (
          <ul class="ml-5">
            {n.children.map((c:any) => (
              // @ts-ignore
              <DriveNode node={c} onSelect={(node:any)=>this.$emit('select', node)} />
            ))}
          </ul>
        ) : null}
      </li>
    )
  }
})
</script>


