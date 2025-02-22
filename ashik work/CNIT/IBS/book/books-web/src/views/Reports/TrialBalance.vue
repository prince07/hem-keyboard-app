<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Trial Balance</h1>
      <div class="space-x-4">
        <button 
          @click="exportToPdf" 
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Export PDF
        </button>
        <button 
          @click="printReport" 
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Print Report
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            As of Date
          </label>
          <input 
            type="date" 
            v-model="asOfDate"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <select 
            v-model="filters.accountType"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="asset">Assets</option>
            <option value="liability">Liabilities</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Show Zero Balances
          </label>
          <div class="mt-2">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="filters.showZeroBalances"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span class="ml-3 text-sm font-medium text-gray-700">Include accounts with zero balance</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6">
        <!-- Company Info -->
        <div class="text-center mb-8">
          <h2 class="text-xl font-bold">{{ companyName }}</h2>
          <p class="text-gray-600">Trial Balance</p>
          <p class="text-gray-600">As of {{ formatDate(asOfDate) }}</p>
        </div>

        <!-- Accounts Table -->
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Code
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
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
            <template v-for="(accounts, type) in groupedAccounts" :key="type">
              <!-- Type Header -->
              <tr class="bg-gray-50">
                <td colspan="5" class="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  {{ capitalizeFirstLetter(type) }}
                </td>
              </tr>
              <!-- Accounts -->
              <tr 
                v-for="account in accounts" 
                :key="account.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ account.code }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ account.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ capitalizeFirstLetter(account.type) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ account.debit > 0 ? formatCurrency(account.debit) : '' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ account.credit > 0 ? formatCurrency(account.credit) : '' }}
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot class="bg-gray-50">
            <tr class="font-bold">
              <td colspan="3" class="px-6 py-4 text-sm text-gray-900">
                Total
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 text-right">
                {{ formatCurrency(totals.debit) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 text-right">
                {{ formatCurrency(totals.credit) }}
              </td>
            </tr>
            <tr v-if="!isBalanced" class="text-red-600">
              <td colspan="5" class="px-6 py-4 text-sm font-medium">
                Warning: Trial Balance is not balanced. Difference: {{ formatCurrency(Math.abs(totals.debit - totals.credit)) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const auth = useAuthStore()
const companyName = ref('Your Company Name')

const asOfDate = ref(new Date().toISOString().split('T')[0])
const filters = ref({
  accountType: '',
  showZeroBalances: false
})

const accounts = ref([])

// Computed Properties
const groupedAccounts = computed(() => {
  const filtered = accounts.value.filter(account => {
    if (!filters.value.showZeroBalances && account.debit === 0 && account.credit === 0) {
      return false
    }
    if (filters.value.accountType && account.type !== filters.value.accountType) {
      return false
    }
    return true
  })

  return filtered.reduce((groups, account) => {
    const type = account.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(account)
    return groups
  }, {})
})

const totals = computed(() => {
  return Object.values(groupedAccounts.value).flat().reduce((total, account) => {
    total.debit += account.debit
    total.credit += account.credit
    return total
  }, { debit: 0, credit: 0 })
})

const isBalanced = computed(() => {
  return Math.abs(totals.value.debit - totals.value.credit) < 0.01
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

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const fetchTrialBalance = async () => {
  try {
    const response = await axios.get('/api/reports/trial-balance', {
      params: {
        asOfDate: asOfDate.value
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    accounts.value = response.data
  } catch (error) {
    console.error('Error fetching trial balance:', error)
  }
}

const printReport = () => {
  window.print()
}

const exportToPdf = async () => {
  try {
    const response = await axios.get('/api/reports/trial-balance/pdf', {
      params: {
        asOfDate: asOfDate.value,
        accountType: filters.value.accountType,
        showZeroBalances: filters.value.showZeroBalances
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trial-balance-${asOfDate.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error exporting PDF:', error)
  }
}

// Watch for changes
watch([asOfDate, filters], () => {
  fetchTrialBalance()
}, { deep: true })

// Initialize
onMounted(() => {
  fetchTrialBalance()
})
</script>

<style>
@media print {
  .no-print {
    display: none;
  }
}
</style>
