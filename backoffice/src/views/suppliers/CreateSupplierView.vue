<template>
  <div class="p-4 max-w-3xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Nouveau fournisseur</h1>
    </div>

    <form class="bg-white rounded shadow p-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Nom</label>
          <input v-model="form.name" required class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Contact</label>
          <input v-model="form.contactName" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Email</label>
          <input v-model="form.email" type="email" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Téléphone</label>
          <input v-model="form.phone" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Statut</label>
          <select v-model="form.status" class="border rounded px-3 py-2 w-full">
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex items-center gap-3">
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Créer</button>
        <router-link to="/fournisseurs" class="px-4 py-2 border rounded">Annuler</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { suppliersService, type CreateSupplierRequest } from '../../services/suppliers'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive<CreateSupplierRequest>({ name: '', status: 'active' })

async function submit() {
  await suppliersService.createSupplier(form)
  router.push('/fournisseurs')
}
</script>


