<template>
  <div class="p-4 max-w-3xl">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Éditer fournisseur</h1>
    </div>

    <form v-if="loaded" class="bg-white rounded shadow p-4" @submit.prevent="submit">
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
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Enregistrer</button>
        <router-link :to="`/fournisseurs/${id}`" class="px-4 py-2 border rounded">Annuler</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { suppliersService, type CreateSupplierRequest } from '../../services/suppliers'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id)
const loaded = ref(false)
const form = reactive<CreateSupplierRequest>({ name: '', status: 'active' })

async function load() {
  const s = await suppliersService.getSupplier(id)
  form.name = s.name
  form.contactName = s.contact_name
  form.email = s.email
  form.phone = s.phone
  form.status = s.status
  loaded.value = true
}

async function submit() {
  await suppliersService.updateSupplier(id, form)
  router.push(`/fournisseurs/${id}`)
}

onMounted(load)
</script>


