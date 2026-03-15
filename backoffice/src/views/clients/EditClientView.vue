<template>
  <div class="space-y-6">
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Modifier le client</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Modifiez les informations du client
        </p>
      </div>
      <router-link :to="`/clients/${clientId}`" class="btn-secondary">
        Retour au détail
      </router-link>
    </div>

    <div v-if="loadError" class="text-red-600 dark:text-red-400 py-4">
      {{ loadError }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          Informations personnelles
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">Type de client</label>
            <select v-model="form.type" class="form-input" required>
              <option value="individual">Particulier</option>
              <option value="company">Entreprise</option>
            </select>
          </div>

          <div v-if="form.type === 'company'" class="md:col-span-2">
            <label class="form-label">Nom de l'entreprise *</label>
            <input
              v-model="form.companyName"
              type="text"
              class="form-input"
              :required="form.type === 'company'"
              placeholder="Nom de l'entreprise"
            />
          </div>

          <div>
            <label class="form-label">Prénom *</label>
            <input v-model="form.firstName" type="text" class="form-input" required placeholder="Prénom" />
          </div>
          <div>
            <label class="form-label">Nom *</label>
            <input v-model="form.lastName" type="text" class="form-input" required placeholder="Nom de famille" />
          </div>
          <div>
            <label class="form-label">Email *</label>
            <input v-model="form.email" type="email" class="form-input" required placeholder="email@exemple.fr" />
          </div>
          <div>
            <label class="form-label">Téléphone</label>
            <input v-model="form.phone" type="tel" class="form-input" placeholder="06 12 34 56 78" />
          </div>
          <div>
            <label class="form-label">Site web</label>
            <input v-model="form.website" type="url" class="form-input" placeholder="https://exemple.fr" />
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Adresse</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="form-label">Adresse</label>
            <input v-model="form.address.line1" type="text" class="form-input" placeholder="123 rue de la Paix" />
          </div>
          <div>
            <label class="form-label">Code postal</label>
            <input v-model="form.address.postalCode" type="text" class="form-input" placeholder="75000" />
          </div>
          <div>
            <label class="form-label">Ville</label>
            <input v-model="form.address.city" type="text" class="form-input" placeholder="Paris" />
          </div>
          <div>
            <label class="form-label">Pays</label>
            <select v-model="form.address.country" class="form-input">
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="form.type === 'company'" class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Informations entreprise</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">SIRET</label>
            <input v-model="form.siret" type="text" class="form-input" placeholder="12345678901234" />
          </div>
          <div>
            <label class="form-label">TVA Intracommunautaire</label>
            <input v-model="form.vatNumber" type="text" class="form-input" placeholder="FR12345678901" />
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Paramètres</h3>
        <div class="space-y-4">
          <div>
            <label class="form-label">Statut</label>
            <select v-model="form.status" class="form-input">
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
          <div>
            <label class="form-label">Source</label>
            <input v-model="form.source" type="text" class="form-input" placeholder="Comment nous a-t-il trouvé ?" />
          </div>
          <div>
            <label class="form-label">Notes</label>
            <textarea v-model="form.notes" rows="3" class="form-input" placeholder="Notes internes sur le client" />
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <router-link :to="`/clients/${clientId}`" class="btn-secondary">Annuler</router-link>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { personsService, type UpdatePersonRequest } from '../../services/persons'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const loadError = ref('')

const clientId = computed(() => route.params.id as string)

const form = reactive({
  type: 'individual' as 'individual' | 'company',
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  mobile: '',
  website: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'France'
  },
  siret: '',
  vatNumber: '',
  status: 'active' as 'active' | 'inactive' | 'prospect',
  source: '',
  notes: ''
})

const fillFormFromClient = (data: any) => {
  form.type = (data.typeClient === 'company' ? 'company' : 'individual') as 'individual' | 'company'
  form.firstName = data.firstName ?? ''
  form.lastName = data.lastName ?? ''
  form.companyName = data.companyName ?? ''
  form.email = data.email ?? ''
  form.phone = data.phone ?? ''
  form.mobile = data.mobile ?? ''
  form.website = data.website ?? ''
  form.address.city = data.city ?? ''
  form.address.postalCode = data.postalCode ?? ''
  form.address.country = data.country ?? 'France'
  form.status = (data.status ?? 'active') as 'active' | 'inactive' | 'prospect'
  form.source = data.source ?? ''
  form.notes = data.notes ?? ''
}

const loadClient = async () => {
  if (!clientId.value) return
  try {
    loadError.value = ''
    const response = await personsService.getPerson(clientId.value)
    if (response?.id) {
      fillFormFromClient(response)
    } else {
      loadError.value = 'Client introuvable'
    }
  } catch (err) {
    console.error('Erreur chargement client:', err)
    loadError.value = 'Erreur lors du chargement du client'
  }
}

const handleSubmit = async () => {
  if (loading.value || !clientId.value) return
  loading.value = true
  try {
    const data: UpdatePersonRequest = {
      typeClient: form.type,
      firstName: form.firstName,
      lastName: form.lastName,
      companyName: form.companyName || undefined,
      email: form.email,
      phone: form.phone || undefined,
      mobile: form.mobile || undefined,
      website: form.website || undefined,
      addressLine1: form.address.line1 || undefined,
      addressLine2: form.address.line2 || undefined,
      city: form.address.city || undefined,
      postalCode: form.address.postalCode || undefined,
      country: form.address.country || 'France',
      siret: form.siret || undefined,
      vatNumber: form.vatNumber || undefined,
      status: form.status,
      source: form.source || undefined,
      notes: form.notes || undefined
    }
    await personsService.updatePerson(clientId.value, data)
    router.push(`/clients/${clientId.value}`)
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadClient()
})
</script>
