<template>
  <div class="space-y-6">
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Nouveau client</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ajoutez un nouveau client à votre base de données
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
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
            <input
              v-model="form.firstName"
              type="text"
              class="form-input"
              required
              placeholder="Prénom"
            />
          </div>

          <div>
            <label class="form-label">Nom *</label>
            <input
              v-model="form.lastName"
              type="text"
              class="form-input"
              required
              placeholder="Nom de famille"
            />
          </div>
          
          <div>
            <label class="form-label">Email *</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              required
              placeholder="email@exemple.fr"
            />
          </div>
          
          <div>
            <label class="form-label">Téléphone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="form-input"
              placeholder="06 12 34 56 78"
            />
          </div>
          
          <div>
            <label class="form-label">Site web</label>
            <input
              v-model="form.website"
              type="url"
              class="form-input"
              placeholder="https://exemple.fr"
            />
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          Adresse
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="form-label">Adresse</label>
            <input
              v-model="form.address.line1"
              type="text"
              class="form-input"
              placeholder="123 rue de la Paix"
            />
          </div>
          
          <div>
            <label class="form-label">Code postal</label>
            <input
              v-model="form.address.postalCode"
              type="text"
              class="form-input"
              placeholder="75000"
            />
          </div>
          
          <div>
            <label class="form-label">Ville</label>
            <input
              v-model="form.address.city"
              type="text"
              class="form-input"
              placeholder="Paris"
            />
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
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          Informations entreprise
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">SIRET</label>
            <input
              v-model="form.siret"
              type="text"
              class="form-input"
              placeholder="12345678901234"
            />
          </div>
          
          <div>
            <label class="form-label">TVA Intracommunautaire</label>
            <input
              v-model="form.vatNumber"
              type="text"
              class="form-input"
              placeholder="FR12345678901"
            />
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
          Paramètres
        </h3>
        
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
            <input
              v-model="form.source"
              type="text"
              class="form-input"
              placeholder="Comment nous a-t-il trouvé ?"
            />
          </div>

          <div>
            <label class="form-label">Notes</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="form-input"
              placeholder="Notes internes sur le client"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <router-link to="/clients" class="btn-secondary">
          Annuler
        </router-link>
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary"
        >
          {{ loading ? 'Création...' : 'Créer le client' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { clientsService, type CreateClientRequest } from '@/services/clients'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// Détermine si on est en mode édition
const isEdit = computed(() => !!route.params.id)

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

const handleSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const clientData: CreateClientRequest = {
      type: form.type,
      firstName: form.firstName,
      lastName: form.lastName,
      companyName: form.companyName || undefined,
      email: form.email,
      phone: form.phone || undefined,
      mobile: form.mobile || undefined,
      website: form.website || undefined,
      address: {
        line1: form.address.line1 || undefined,
        line2: form.address.line2 || undefined,
        city: form.address.city || undefined,
        postalCode: form.address.postalCode || undefined,
        country: form.address.country || 'France'
      },
      siret: form.siret || undefined,
      vatNumber: form.vatNumber || undefined,
      status: form.status,
      source: form.source || undefined,
      notes: form.notes || undefined
    }

    const response = await clientsService.createClient(clientData)
    
    if (response.success) {
      // Redirection vers la liste des clients
      router.push('/clients')
    } else {
      console.error('Erreur lors de la création:', response.error)
    }
  } catch (error) {
    console.error('Erreur lors de la création:', error)
  } finally {
    loading.value = false
  }
}
</script>


