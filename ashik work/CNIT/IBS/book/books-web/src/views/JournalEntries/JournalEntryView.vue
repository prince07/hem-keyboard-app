<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <button 
          @click="router.back()" 
          class="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 class="text-2xl font-bold">Journal Entry Details</h1>
      </div>
      <div class="space-x-4">
        <button 
          v-if="entry.status === 'draft'"
          @click="postEntry" 
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Post Entry
        </button>
        <button 
          v-if="entry.status === 'draft'"
          @click="editEntry" 
          class="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
        >
          Edit
        </button>
        <button 
          @click="printEntry" 
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Print
        </button>
      </div>
    </div>

    <!-- Entry Details -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div class="text-lg">{{ formatDate(entry.date) }}</div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Reference
            </label>
            <div class="text-lg">{{ entry.reference }}</div>
          </div>
        </div>
        <div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div>
              <span :class="[
                'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
                entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ entry.status }}
              </span>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Posted Date
            </label>
            <div class="text-lg">{{ entry.postedDate ? formatDate(entry.postedDate) : 'Not Posted' }}</div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <div class="text-lg">{{ entry.description }}</div>
      </div>

      <!-- Line Items -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Line Items
        </label>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Debit
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in entry.items" :key="item.id">
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ getAccountName(item.accountId) }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-gray-900">
                {{ formatCurrency(item.debit) }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-gray-900">
                {{ formatCurrency(item.credit) }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Totals
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {{ formatCurrency(entry.debitTotal) }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {{ formatCurrency(entry.creditTotal) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Audit Trail -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Audit Trail</h2>
      <div class="space-y-4">
        <div v-for="(log, index) in entry.auditLogs" :key="index" class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span class="text-gray-600">{{ log.user.initials }}</span>
            </div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900">
              {{ log.user.name }}
            </div>
            <div class="text-sm text-gray-500">
              {{ log.action }} - {{ formatDate(log.timestamp) }}
            </div>
            <div class="text-sm text-gray-700 mt-1">
              {{ log.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const entry = ref({
  id: '',
  date: '',
  reference: '',
  description: '',
  status: '',
  postedDate: null,
  items: [],
  debitTotal: 0,
  creditTotal: 0,
  auditLogs: []
})

const accounts = ref([])

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const getAccountName = (accountId: string) => {
  const account = accounts.value.find(a => a.id === accountId)
  return account ? `${account.code} - ${account.name}` : 'Unknown Account'
}

const postEntry = async () => {
  try {
    await axios.post(`/api/journal-entries/${entry.value.id}/post`, null, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    await fetchEntry()
  } catch (error) {
    console.error('Error posting journal entry:', error)
  }
}

const editEntry = () => {
  router.push(`/journal-entries/${entry.value.id}/edit`)
}

const printEntry = () => {
  window.print()
}

// Fetch data
const fetchEntry = async () => {
  try {
    const response = await axios.get(`/api/journal-entries/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    entry.value = response.data
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    router.push('/journal-entries')
  }
}

const fetchAccounts = async () => {
  try {
    const response = await axios.get('/api/accounts', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    accounts.value = response.data
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

// Initialize data
onMounted(() => {
  fetchEntry()
  fetchAccounts()
})
</script>

<style>
@media print {
  .no-print {
    display: none;
  }
}
</style>
