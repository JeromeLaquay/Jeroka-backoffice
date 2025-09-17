<template>
  <div class="p-4 max-w-4xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Fournisseur</h1>
      <div class="flex gap-2">
        <router-link :to="`/fournisseurs/${id}/edit`" class="px-3 py-2 bg-indigo-600 text-white rounded">Éditer</router-link>
        <router-link to="/fournisseurs" class="px-3 py-2 border rounded">Retour</router-link>
      </div>
    </div>

    <div v-if="supplier" class="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div class="text-sm text-gray-500">Nom</div>
        <div class="font-medium">{{ supplier.name }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Contact</div>
        <div class="font-medium">{{ supplier.contact_name || '-' }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Email</div>
        <div class="font-medium">{{ supplier.email || '-' }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Téléphone</div>
        <div class="font-medium">{{ supplier.phone || '-' }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Statut</div>
        <div class="font-medium">{{ supplier.status }}</div>
      </div>
      <div class="md:col-span-2">
        <div class="text-sm text-gray-500">Notes</div>
        <div class="font-medium whitespace-pre-wrap">{{ supplier.notes || '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { suppliersService, type Supplier } from '../../services/suppliers'

const route = useRoute()
const id = String(route.params.id)
const supplier = ref<Supplier | null>(null)

async function load() {
  supplier.value = await suppliersService.getSupplier(id)
}

onMounted(load)
</script>


