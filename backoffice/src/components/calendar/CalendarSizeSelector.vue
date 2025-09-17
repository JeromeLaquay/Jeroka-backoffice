<template>
  <div class="calendar-size-selector">
    <div class="flex items-center space-x-4">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Taille du calendrier:
      </label>
      <div class="flex space-x-2">
        <button
          v-for="size in sizeOptions"
          :key="size.value"
          @click="selectSize(size.value)"
          :class="[
            'px-3 py-1 text-sm rounded-lg border transition-colors',
            selectedSize === size.value
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
          ]"
        >
          {{ size.label }}
        </button>
      </div>
    </div>
    
    <!-- Aperçu de la taille -->
    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
      <span v-if="selectedSize === 'small'">Hauteur: 400px (Mobile)</span>
      <span v-else-if="selectedSize === 'medium'">Hauteur: 600px (Tablette)</span>
      <span v-else-if="selectedSize === 'large'">Hauteur: 700px (Desktop)</span>
      <span v-else-if="selectedSize === 'xlarge'">Hauteur: 800px (Grand écran)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Emits
const emit = defineEmits<{
  sizeChanged: [size: string]
}>()

// Props
interface Props {
  initialSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialSize: 'large'
})

// State
const selectedSize = ref(props.initialSize)

// Options de taille
const sizeOptions = [
  { value: 'small', label: 'Petit' },
  { value: 'medium', label: 'Moyen' },
  { value: 'large', label: 'Grand' },
  { value: 'xlarge', label: 'Très grand' }
]

// Methods
const selectSize = (size: string) => {
  selectedSize.value = size
  emit('sizeChanged', size)
  
  // Sauvegarder la préférence
  localStorage.setItem('calendarSize', size)
}

// Lifecycle
onMounted(() => {
  // Charger la taille sauvegardée
  const savedSize = localStorage.getItem('calendarSize')
  if (savedSize && sizeOptions.some(option => option.value === savedSize)) {
    selectedSize.value = savedSize
  }
})
</script>

<style scoped>
.calendar-size-selector {
  @apply w-full;
}
</style>

