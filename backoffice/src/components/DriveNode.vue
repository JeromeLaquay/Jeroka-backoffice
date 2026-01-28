<template>
  <li>
    <div 
      class="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-1"
      @click="$emit('select', node)"
    >
      <button 
        v-if="node.type === 'folder'"
        class="text-xs border rounded px-1 w-6"
        @click.stop="$emit('toggle', node)"
      >
        {{ node.expanded ? '-' : '+' }}
      </button>
      <span v-else class="w-6 text-center">•</span>
      <span>{{ node.name }}</span>
    </div>
    
    <ul v-if="node.expanded && node.children && node.children.length > 0" class="ml-5">
      <DriveNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </ul>
  </li>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export interface DriveItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType?: string
}

export interface TreeNode extends DriveItem {
  children?: TreeNode[]
  expanded?: boolean
}

export default defineComponent({
  name: 'DriveNode',
  props: {
    node: {
      type: Object as PropType<TreeNode>,
      required: true
    }
  },
  emits: ['select', 'toggle']
})
</script>
