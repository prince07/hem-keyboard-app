<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">General Ledger</h1>
      <button 
        @click="printReport" 
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Print Report
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div class="flex space-x-2">
            <input 
              type="date" 
              v-model="filters.startDate"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <input 
              type="date" 
              v-model="filters.endDate"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Account
          </label>
          <select 
            v-model="filters.accountId"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Accounts</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.code }} - {{ account.name }}
            </option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input 
            type="text" 
            v-model="filters.search"
            placeholder="Search transactions..."
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
    </div>

    <!-- Ledger Content -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-for="account in filteredAccounts" :key="account.id" class="mb-8">
        <div class="bg-gray-50 px-6 py-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">
            {{ account.code }} - {{ account.name }}
          </h3>
        </div>

        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Party
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Debit
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr class="bg-gray-50">
              <td colspan="5" class="px-6 py-4 text-sm font-medium text-gray-900">
                Opening Balance
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {{ formatCurrency(account.openingBalance) }}
              </td>
            </tr>
            <tr v-for="entry in account.entries" :key="entry.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(entry.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ entry.party || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ entry.referenceType }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <a 
                  v-if="entry.referenceName"
                  @click="viewReference(entry.referenceType, entry.referenceName)"
                  class="text-blue-600 hover:text-blue-900 cursor-pointer"
                >
                  {{ entry.referenceName }}
                </a>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 text-right text-sm text-gray-900">
                {{ formatCurrency(entry.debit) }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-gray-900">
                {{ formatCurrency(entry.credit) }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-gray-900">
                {{ formatCurrency(entry.balance) }}
              </td>
              <td class="px-6 py-4 text-center text-sm">
                <span 
                  v-if="entry.reverted"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                >
                  Reverted
                </span>
                <a 
                  v-if="entry.reverts"
                  @click="viewEntry(entry.reverts)"
                  class="text-blue-600 hover:text-blue-900 cursor-pointer text-xs"
                >
                  Reverts Entry #{{ entry.reverts }}
                </a>
              </td>
            </tr>
            <tr class="bg-gray-50">
              <td colspan="3" class="px-6 py-4 text-sm font-medium text-gray-900">
                Period Totals
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {{ formatCurrency(account.totalDebit) }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {{ formatCurrency(account.totalCredit) }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                {{ formatCurrency(account.closingBalance) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const router = useRouter()
const auth = useAuthStore()

const filters = ref({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  accountId: '',
  search: ''
})

const accounts = ref([])
const ledgerData = ref([])

// Computed
const filteredAccounts = computed(() => {
  return ledgerData.value.filter(account => {
    if (filters.value.accountId && account.id !== filters.value.accountId) {
      return false
    }

    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      return account.entries.some(entry => 
        entry.reference.toLowerCase().includes(searchTerm) ||
        entry.description.toLowerCase().includes(searchTerm)
      )
    }

    return true
  })
})

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

const viewEntry = (journalEntryId: string) => {
  router.push(`/journal-entries/${journalEntryId}`)
}

const viewReference = (type: string, name: string) => {
  switch (type) {
    case 'JournalEntry':
      router.push(`/journal-entries/${name}`)
      break
    case 'Payment':
      router.push(`/payments/${name}`)
      break
    case 'Invoice':
      router.push(`/invoices/${name}`)
      break
    case 'Bill':
      router.push(`/bills/${name}`)
      break
    default:
      console.warn(`Unknown reference type: ${type}`)
  }
}

const printReport = () => {
  window.print()
}

// Fetch data
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

const fetchLedgerData = async () => {
  try {
    const response = await axios.get('/api/reports/general-ledger', {
      params: {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        accountId: filters.value.accountId || undefined
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    ledgerData.value = response.data
  } catch (error) {
    console.error('Error fetching ledger data:', error)
  }
}

// Watch filters
watch(filters, () => {
  fetchLedgerData()
}, { deep: true })

// Initialize
onMounted(() => {
  fetchAccounts()
  fetchLedgerData()
})
</script>

<style>
@media print {
  .no-print {
    display: none;
  }
}
</style>
