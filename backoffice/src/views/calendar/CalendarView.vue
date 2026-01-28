<template>
  <div class="calendar-view min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header principal -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-6 lg:space-y-0">
          <!-- Titre et description -->
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Gestion du calendrier
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-lg">
              Organisez vos rendez-vous et gérez vos créneaux de disponibilité
            </p>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              @click="showGenerateModal = true"
              class="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Générer avec IA
            </button>
            <button
              @click="showGenerateModal = true"
              class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nouveaux créneaux
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <!-- Cartes de résumé -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total rendez-vous -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total rendez-vous</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ appointments.length }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- En attente -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ getAppointmentsByStatus('pending').length }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Réservés -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Réservés</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ getAppointmentsByStatus('reserved').length }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Confirmés -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmés</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ getAppointmentsByStatus('confirmed').length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Prochain rendez-vous réservé en évidence -->
      <div v-if="nextReservedAppointment" class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Prochain rendez-vous</h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ formatDateAndTime(nextReservedAppointment.start_time || '') }} à {{ formatTime(nextReservedAppointment.start_time || '') }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-500">
              {{ nextReservedAppointment.first_name }} {{ nextReservedAppointment.last_name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Section de filtres et recherche -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Recherche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rechercher</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Client, heure..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="reserved">Réservé</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
            <input
              v-model="appointmentDateFilter"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Période -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Période</label>
            <select
              v-model="periodFilter"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="tomorrow">Demain</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-end">
            <button
              @click="refreshAppointments"
              class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowPathIcon class="w-4 h-4 inline mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des rendez-vous -->
      <div v-if="filteredAppointments.length > 0" class="space-y-4">
        <div v-for="(appointments, date) in appointmentsByDate" :key="date" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <!-- En-tête de date -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ formatDateHeader(String(date)) }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ appointments.length }} rendez-vous</p>
                </div>
              </div>
            </div>
          </div>
        
          <!-- Rendez-vous du jour -->
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="appointment in appointments"
              :key="appointment.id"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-center justify-between flex-col md:flex-row">
                <div class="flex items-center space-x-4 ">
                  <!-- Icône de statut -->
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                       :class="{
                         'bg-green-100 dark:bg-green-900': appointment.status === 'confirmed',
                         'bg-purple-100 dark:bg-purple-900': appointment.status === 'reserved',
                         'bg-orange-100 dark:bg-orange-900': appointment.status === 'pending',
                         'bg-red-100 dark:bg-red-900': appointment.status === 'cancelled'
                       }">
                    <UserIcon class="w-5 h-5"
                             :class="{
                               'text-green-600 dark:text-green-400': appointment.status === 'confirmed',
                               'text-purple-600 dark:text-purple-400': appointment.status === 'reserved',
                               'text-orange-600 dark:text-orange-400': appointment.status === 'pending',
                               'text-red-600 dark:text-red-400': appointment.status === 'cancelled'
                             }" />
                  </div>

                  <!-- Informations -->
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-gray-100">
                          {{ formatTime(appointment.start_time || '') }} - {{ formatTime(appointment.end_time || '') }}
                        </p>
                        <div class="flex items-center space-x-2 mt-1">
                          <span class="px-2 py-1 rounded-full text-xs font-medium"
                                :class="{
                                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': appointment.status === 'confirmed',
                                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': appointment.status === 'reserved',
                                  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': appointment.status === 'pending',
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': appointment.status === 'cancelled'
                                }">
                            {{ appointment.status === 'reserved' ? 'Réservé' : 
                               appointment.status === 'confirmed' ? 'Confirmé' :
                               appointment.status === 'pending' ? 'En attente' : 'Annulé' }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="flex items-center space-x-4 "></div>
                      <!-- Informations client -->
                      <div v-if="appointment.status === 'reserved' && appointment.first_name" 
                           class="text-sm text-gray-600 dark:text-gray-400">
                        <p class="font-medium">{{ appointment.first_name }} {{ appointment.last_name }}</p>
                        <p>{{ appointment.email }}</p>
                      </div>
                      
                      <!-- Statut disponible -->
                      <div v-else-if="appointment.status === 'pending'" 
                           class="text-sm text-gray-600 dark:text-gray-400">
                        Créneau disponible
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <!-- Bouton Voir client -->
                  <button v-if="appointment.status === 'reserved' && appointment.person_id" 
                          @click="goToClient(appointment.person_id)" 
                          class="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                    Voir client
                  </button>

                  <!-- Select de statut -->
                  <select v-model="appointment.status" 
                          @change="updateAppointment(appointment.id)" 
                          class="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="pending">En attente</option>
                    <option value="reserved">Réservé</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="cancelled">Annulé</option>
                    <option value="cancelled_by_client">Annulé par le client</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun rendez-vous trouvé</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Commencez par créer vos premiers créneaux de disponibilité</p>
        <button
          @click="showGenerateModal = true"
          class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Créer des créneaux
        </button>
      </div>
      
      <!-- Section Google Calendar -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Vue calendrier Google</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Calendrier intégré en temps réel</p>
              </div>
            </div>
            <button
              @click="reloadCalendarIframe"
              class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowPathIcon class="w-4 h-4 inline mr-2" />
              Actualiser
            </button>
          </div>
        </div>
        
        <div class="p-4">
          <iframe 
            ref="iframe"
            src="https://calendar.google.com/calendar/embed?src=c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa%40group.calendar.google.com&ctz=Europe%2FParis" 
            class="w-full h-[600px] md:h-[700px] lg:h-[800px] border-0 rounded-lg"
            frameborder="0" 
            scrolling="no"
            title="Calendrier Google intégré"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Modal de génération de créneaux -->
    <div v-if="showGenerateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Générer des créneaux</h3>
          <button @click="closeGenerateModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitGenerateSlots" class="space-y-4">
          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Heure de début -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heure de début</label>
            <input
              v-model="form.startTime"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Heure de fin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heure de fin</label>
            <input
              v-model="form.endTime"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- Durée des créneaux -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Durée des créneaux (minutes)</label>
            <select
              v-model="form.slotDurationMinutes"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 heure</option>
            </select>
          </div>

          <!-- Boutons d'action -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeGenerateModal"
              class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="submitting">Génération...</span>
              <span v-else>Générer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowPathIcon, UserIcon } from '@heroicons/vue/24/outline'
import calendarApi, { Appointment } from '../../services/calendar' 

const router = useRouter()
const appointmentDateFilter = ref('')
const appointments = ref(Array<Appointment>())

// Filtres
const searchQuery = ref('')
const statusFilter = ref('')
const periodFilter = ref('')

// Modal état
const showGenerateModal = ref(false)
const submitting = ref(false)
const form = ref({
  date: '',
  startTime: '09:00',
  endTime: '18:00',
  slotDurationMinutes: 30
})

const iframe = ref<HTMLIFrameElement | null>(null)

// Fonction utilitaire pour recharger l'iframe Google Calendar
const reloadCalendarIframe = () => {
  if (iframe.value) {
    // Forcer le rechargement de l'iframe en ajoutant un timestamp
    const currentSrc = iframe.value.src;
    const separator = currentSrc.includes('?') ? '&' : '?';
    console.log('resultat', currentSrc + separator + 't=' + Date.now());
    iframe.value.src = currentSrc + separator + 't=' + Date.now();
  }
}

// Fonctions pour le modal de génération de créneaux
const closeGenerateModal = () => {
  showGenerateModal.value = false
}

const submitGenerateSlots = async () => {
  try {
    submitting.value = true
    // Appel backend
    await calendarApi.availability.create({
      day: form.value.date,
      startTime: form.value.startTime,
      endTime: form.value.endTime,
      appointmentTime: form.value.slotDurationMinutes
    })
    // Mettre à jour l'iframe Google Calendar
    reloadCalendarIframe()
    // Rafraîchir les rendez-vous
    await refreshAppointments()
    showGenerateModal.value = false
  } catch (e) {
    console.error('Erreur génération créneaux', e)
  } finally {
    submitting.value = false
  }
}

// Fonction pour obtenir les rendez-vous par statut
const getAppointmentsByStatus = (status: string) => {
  return appointments.value.filter((appointment: any) => appointment.status === status)
}

const filteredAppointments = computed(() => {
  let filtered = appointments.value
  
  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((a: any) => {
      const clientName = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase()
      const email = (a.email || '').toLowerCase()
      const time = formatTime(a.start_time || '').toLowerCase()
      return clientName.includes(query) || email.includes(query) || time.includes(query)
    })
  }
  
  // Filtrer par statut
  if (statusFilter.value) {
    filtered = filtered.filter((a: any) => a.status === statusFilter.value)
  }
  
  // Filtrer par date
  if (appointmentDateFilter.value) {
    filtered = filtered.filter((a: any) => {
      const appointmentDate = new Date(a.start_time).toISOString().split('T')[0]
      return appointmentDate === appointmentDateFilter.value
    })
  }
  
  // Filtrer par période
  if (periodFilter.value) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    filtered = filtered.filter((a: any) => {
      const appointmentDate = new Date(a.start_time)
      switch (periodFilter.value) {
        case 'today':
          return appointmentDate >= today && appointmentDate < tomorrow
        case 'tomorrow':
          const dayAfterTomorrow = new Date(tomorrow)
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
          return appointmentDate >= tomorrow && appointmentDate < dayAfterTomorrow
        case 'week':
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 7)
          return appointmentDate >= weekStart && appointmentDate < weekEnd
        case 'month':
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          return appointmentDate >= monthStart && appointmentDate < monthEnd
        default:
          return true
      }
    })
  }
  
  // Trier par date et heure
  return filtered.sort((a: any, b: any) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  })
})

// Grouper les rendez-vous par date
const appointmentsByDate = computed(() => {
  const grouped: { [key: string]: any[] } = {}
  
  filteredAppointments.value.forEach((appointment: any) => {
    const date = new Date(appointment.start_time).toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(appointment)
  })
  
  return grouped
})

// Trouver le prochain rendez-vous réservé
const nextReservedAppointment = computed(() => {
  const now = new Date()
  const reservedAppointments = appointments.value.filter((a: any) => 
    a.status === 'reserved' && new Date(a.start_time) > now
  )
  
  if (reservedAppointments.length === 0) return null
  
  return reservedAppointments.sort((a: any, b: any) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )[0]
})

const refreshAppointments = async () => {
  appointments.value = await calendarApi.appointments.getAll()
  console.log('appointments.value', appointments.value)
}

const updateAppointment = async (appointmentId: string) => {
  try {
    // Trouver le rendez-vous à mettre à jour
    const appointment = appointments.value.find(a => a.id === appointmentId)
    if (!appointment) {
      console.error('Rendez-vous non trouvé')
      return
    }

    console.log('Mise à jour du rendez-vous:', appointmentId, 'vers le statut:', appointment.status)

    // Appeler le service pour mettre à jour le rendez-vous
    await calendarApi.appointments.update(appointmentId, {
      status: appointment.status
    })
    
    // Rafraîchir la liste des rendez-vous
    await refreshAppointments()
    
    // Mettre à jour l'iframe Google Calendar si nécessaire
    reloadCalendarIframe()
    
    console.log('Rendez-vous mis à jour avec succès')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error)
    // Optionnel: Afficher une notification d'erreur à l'utilisateur
  }
}

const goToClient = (personId: string) => {
  if (personId) {
    router.push(`/clients/${personId}`)
  }
}


const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateAndTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Aujourd\'hui'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Demain'
  } else {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }
}


// Initialiser la date par défaut
const initializeDefaultDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  form.value.date = `${year}-${month}-${day}`
}

onMounted(() => {
  refreshAppointments()
  initializeDefaultDate()
})
</script>

<style scoped>
/* Transitions pour les changements de thème */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

/* Animation d'entrée pour les éléments */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Styles pour les scrollbars personnalisées */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #8b5cf6;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #7c3aed;
}

/* Dark mode scrollbars */
@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-track {
    background: #374151;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #8b5cf6;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #7c3aed;
  }
}
</style>
