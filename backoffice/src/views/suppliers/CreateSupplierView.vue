<template>
  <div class="space-y-6" data-cy="create-supplier-page">
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Nouveau fournisseur</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ajoutez un nouveau fournisseur à votre base de données
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
            <label class="form-label">Type de fournisseur</label>
            <select v-model="form.type_label" class="form-input" required>
              <option value="Particulier">Particulier</option>
              <option value="Entreprise">Entreprise</option>
            </select>
          </div>

          <div v-if="form.type_label === 'Entreprise'" class="md:col-span-2">
            <label class="form-label">Nom de l'entreprise *</label>
            <input
              v-model="form.company_name"
              type="text"
              class="form-input"
              data-cy="supplier-company-name-input"
              :required="form.type_label === 'Entreprise'"
              placeholder="Nom de l'entreprise"
            />
          </div>
          
          <div>
            <label class="form-label">Prénom *</label>
            <input
              v-model="form.first_name"
              type="text"
              class="form-input"
              required
              placeholder="Prénom"
              data-cy="supplier-firstname-input"
            />
          </div>

          <div>
            <label class="form-label">Nom *</label>
            <input
              v-model="form.last_name"
              type="text"
              class="form-input"
              required
              placeholder="Nom de famille"
              data-cy="supplier-lastname-input"
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
              data-cy="supplier-email-input"
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
            <label class="form-label">Mobile</label>
            <input
              v-model="form.mobile"
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
              v-model="form.address_line1"
              type="text"
              class="form-input"
              placeholder="123 rue de la Paix"
            />
          </div>

          <div class="md:col-span-2">
            <label class="form-label">Adresse ligne 2</label>
            <input
              v-model="form.address_line2"
              type="text"
              class="form-input"
              placeholder="Complément d'adresse"
            />
          </div>
          
          <div>
            <label class="form-label">Code postal</label>
            <input
              v-model="form.postal_code"
              type="text"
              class="form-input"
              placeholder="75000"
            />
          </div>
          
          <div>
            <label class="form-label">Ville</label>
            <input
              v-model="form.city"
              type="text"
              class="form-input"
              placeholder="Paris"
            />
          </div>
          
          <div>
            <label class="form-label">Pays</label>
            <select v-model="form.country" class="form-input">
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="form.type_label === 'Entreprise'" class="card">
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
              v-model="form.vat_number"
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
              placeholder="Notes internes sur le fournisseur"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <router-link to="/fournisseurs" class="btn-secondary">
          Annuler
        </router-link>
        <button
          type="submit"
          data-cy="submit-create-supplier"
          :disabled="loading"
          class="btn-primary"
        >
          {{ loading ? 'Création...' : 'Créer le fournisseur' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { personsService, type CreatePersonRequest } from '../../services/persons'
import { useRouter } from 'vue-router'

interface SupplierFormState {
  type_label: 'Particulier' | 'Entreprise'
  first_name: string
  last_name: string
  company_name: string
  email: string
  phone: string
  mobile: string
  website: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
  country: string
  siret: string
  vat_number: string
  status: 'active' | 'inactive' | 'prospect'
  source: string
  notes: string
}

const router = useRouter()
const loading = ref(false)

const form = reactive<SupplierFormState>({
  type_label: 'Entreprise',
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
  phone: '',
  mobile: '',
  website: '',
  address_line1: '',
  address_line2: '',
  city: '',
  postal_code: '',
  country: 'France',
  siret: '',
  vat_number: '',
  status: 'active',
  source: '',
  notes: '',
})

function buildCreatePayload(): CreatePersonRequest {
  const typeClient = form.type_label === 'Entreprise' ? 'company' : 'individual'
  return {
    type: 'supplier',
    typeClient,
    firstName: form.first_name.trim(),
    lastName: form.last_name.trim(),
    companyName: typeClient === 'company' ? form.company_name.trim() || undefined : undefined,
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    mobile: form.mobile.trim() || undefined,
    website: form.website.trim() || undefined,
    addressLine1: form.address_line1.trim() || undefined,
    addressLine2: form.address_line2.trim() || undefined,
    city: form.city.trim() || undefined,
    postalCode: form.postal_code.trim() || undefined,
    country: form.country || 'France',
    siret: form.siret.trim() || undefined,
    vatNumber: form.vat_number.trim() || undefined,
    status: form.status,
    source: form.source.trim() || undefined,
    notes: form.notes.trim() || undefined,
  }
}

function extractCreatedPersonId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined
  const o = body as Record<string, unknown>
  if (typeof o.id === 'string' && o.id.length > 0) return o.id
  const data = o.data
  if (data && typeof data === 'object') {
    const inner = (data as Record<string, unknown>).id
    if (typeof inner === 'string' && inner.length > 0) return inner
  }
  return undefined
}

const handleSubmit = async () => {
  if (loading.value) return

  loading.value = true

  try {
    const response = await personsService.createPerson(buildCreatePayload())
    const id = extractCreatedPersonId(response)
    if (id) {
      await router.push('/fournisseurs')
    } else {
      console.error('Erreur lors de la création: réponse invalide', response)
    }
  } catch (error) {
    console.error('Erreur lors de la création:', error)
  } finally {
    loading.value = false
  }
}
</script>


