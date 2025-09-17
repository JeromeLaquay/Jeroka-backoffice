<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Fournisseurs</h1>
      <router-link
        to="/fournisseurs/create"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Nouveau fournisseur
      </router-link>
    </div>

    <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-white rounded shadow">
        <div class="text-gray-500 text-sm">Total</div>
        <div class="text-2xl font-bold">{{ stats.total }}</div>
      </div>
      <div class="p-4 bg-white rounded shadow">
        <div class="text-gray-500 text-sm">Actifs</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.active }}</div>
      </div>
      <div class="p-4 bg-white rounded shadow">
        <div class="text-gray-500 text-sm">Inactifs</div>
        <div class="text-2xl font-bold text-gray-600">{{ stats.inactive }}</div>
      </div>
    </div>

    <div class="bg-white rounded shadow">
      <div class="p-4 flex flex-col md:flex-row gap-4 md:items-center">
        <input v-model="search" type="text" placeholder="Rechercher..." class="border rounded px-3 py-2 w-full md:w-64" />
        <select v-model="status" class="border rounded px-3 py-2 w-full md:w-48">
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-3 text-sm font-medium text-gray-500">Nom</th>
              <th class="text-left p-3 text-sm font-medium text-gray-500">Contact</th>
              <th class="text-left p-3 text-sm font-medium text-gray-500">Email</th>
              <th class="text-left p-3 text-sm font-medium text-gray-500">Téléphone</th>
              <th class="text-left p-3 text-sm font-medium text-gray-500">Statut</th>
              <th class="text-right p-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in suppliers" :key="s.id" class="border-t">
              <td class="p-3 font-medium">{{ s.name }}</td>
              <td class="p-3">{{ s.contact_name || '-' }}</td>
              <td class="p-3">{{ s.email || '-' }}</td>
              <td class="p-3">{{ s.phone || '-' }}</td>
              <td class="p-3">
                <span :class="s.status === 'active' ? 'text-green-600' : 'text-gray-600'">{{ s.status }}</span>
              </td>
              <td class="p-3 text-right">
                <router-link :to="`/fournisseurs/${s.id}`" class="text-blue-600 hover:underline mr-3">Voir</router-link>
                <router-link :to="`/fournisseurs/${s.id}/edit`" class="text-indigo-600 hover:underline mr-3">Éditer</router-link>
                <button @click="remove(s.id)" class="text-red-600 hover:underline">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-4 flex justify-end gap-2">
        <button @click="prev" :disabled="page===1" class="px-3 py-1 border rounded">Précédent</button>
        <button @click="next" class="px-3 py-1 border rounded">Suivant</button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { suppliersService, type Supplier, type SupplierStats } from '../../services/suppliers'

const suppliers = ref<Supplier[]>([])
const stats = ref<SupplierStats>({ total: 0, active: 0, inactive: 0 })
const search = ref('')
const status = ref('')
const page = ref(1)
const limit = ref(10)

async function load() {
  const list = await suppliersService.getSuppliers({ page: page.value, limit: limit.value, search: search.value || undefined, status: (status.value as any) || undefined })
  suppliers.value = list?.items || list || []
  const s = await suppliersService.getSupplierStats().catch(() => ({ total: 0, active: 0, inactive: 0 }))
  stats.value = s
}

function next() { page.value += 1; load() }
function prev() { if (page.value > 1) { page.value -= 1; load() } }

async function remove(id: string) {
  await suppliersService.deleteSupplier(id)
  await load()
}

onMounted(load)
watch([search, status], () => { page.value = 1; load() })
</script>


