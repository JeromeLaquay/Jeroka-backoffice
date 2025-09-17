<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Rendez-vous</h2>
      <div class="flex space-x-2">
        <input
          v-model="appointmentDateFilter"
          type="date"
          class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2"
        />
        <button
          @click="refreshAppointments"
          class="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
        >
          <ArrowPathIcon class="w-4 h-4 inline mr-2" />
          Actualiser
        </button>
      </div>
    </div>

    <!-- Liste des rendez-vous -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Rendez-vous à venir</h3>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="appointment in filteredAppointments"
          :key="appointment.id"
          class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ appointment.client_first_name }} {{ appointment.client_last_name }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(appointment.created_at) }} - {{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ appointment.clientEmail }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="editAppointment(appointment)"
              class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              @click="deleteAppointment(appointment.id)"
              class="text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowPathIcon, UserIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import calendarApi, { Appointment } from '../../services/calendar' 

const appointmentDateFilter = ref('')
const appointments = ref(Array<Appointment>())

const filteredAppointments = computed(() => {
  if (!appointmentDateFilter.value) return appointments.value
  return appointments.value.filter((a: any) => a.createdAt.toISOString().split('T')[0] === appointmentDateFilter.value)
})

const refreshAppointments = async () => {
  appointments.value = await calendarApi.appointments.getAll()
  console.log('appointments.value', appointments.value)
}

const editAppointment = (appointment: any) => {
  // À brancher sur un modal si nécessaire via un event/emit
  console.log('Edit appointment', appointment)
}

const deleteAppointment = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
    await calendarApi.appointments.delete(id)
    await refreshAppointments()
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

const formatTime = (time: string) => {
  return time ? time.substring(0, 5) : '' // Remove seconds if present
}

onMounted(() => {
  refreshAppointments()
})
</script>

<style scoped>
</style>


