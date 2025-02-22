<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Profit & Loss Statement</h1>
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
            Period
          </label>
          <select 
            v-model="filters.period"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="updateDateRange"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="this_year">This Year</option>
            <option value="last_year">Last Year</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input 
            type="date" 
            v-model="filters.startDate"
            :disabled="filters.period !== 'custom'"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input 
            type="date" 
            v-model="filters.endDate"
            :disabled="filters.period !== 'custom'"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6">
        <!-- Company Info -->
        <div class="text-center mb-8">
          <h2 class="text-xl font-bold">{{ companyName }}</h2>
          <p class="text-gray-600">Profit & Loss Statement</p>
          <p class="text-gray-600">
            For the period {{ formatDate(filters.startDate) }} to {{ formatDate(filters.endDate) }}
          </p>
        </div>

        <!-- Revenue Section -->
        <div class="mb-8">
          <h3 class="text-lg font-bold mb-4">Revenue</h3>
          <div class="space-y-2">
            <div v-for="item in report.revenue" :key="item.accountId" class="grid grid-cols-12 gap-4">
              <div class="col-span-8 pl-4">{{ item.accountName }}</div>
              <div class="col-span-4 text-right">{{ formatCurrency(item.amount) }}</div>
            </div>
            <div class="grid grid-cols-12 gap-4 font-bold border-t pt-2">
              <div class="col-span-8 pl-4">Total Revenue</div>
              <div class="col-span-4 text-right">{{ formatCurrency(report.totalRevenue) }}</div>
            </div>
          </div>
        </div>

        <!-- Expenses Section -->
        <div class="mb-8">
          <h3 class="text-lg font-bold mb-4">Expenses</h3>
          <div class="space-y-2">
            <div v-for="item in report.expenses" :key="item.accountId" class="grid grid-cols-12 gap-4">
              <div class="col-span-8 pl-4">{{ item.accountName }}</div>
              <div class="col-span-4 text-right">{{ formatCurrency(item.amount) }}</div>
            </div>
            <div class="grid grid-cols-12 gap-4 font-bold border-t pt-2">
              <div class="col-span-8 pl-4">Total Expenses</div>
              <div class="col-span-4 text-right">{{ formatCurrency(report.totalExpenses) }}</div>
            </div>
          </div>
        </div>

        <!-- Net Income -->
        <div class="border-t-2 pt-4">
          <div class="grid grid-cols-12 gap-4 font-bold text-lg">
            <div class="col-span-8 pl-4">Net Income</div>
            <div 
              :class="[
                'col-span-4 text-right',
                report.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              ]"
            >
              {{ formatCurrency(report.netIncome) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const auth = useAuthStore()
const companyName = ref('Your Company Name')

const filters = ref({
  period: 'this_month',
  startDate: '',
  endDate: ''
})

const report = ref({
  revenue: [],
  expenses: [],
  totalRevenue: 0,
  totalExpenses: 0,
  netIncome: 0
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

const updateDateRange = () => {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  switch (filters.value.period) {
    case 'this_month':
      filters.value.startDate = firstDayOfMonth.toISOString().split('T')[0]
      filters.value.endDate = lastDayOfMonth.toISOString().split('T')[0]
      break
    case 'last_month':
      filters.value.startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      filters.value.endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
      break
    case 'this_quarter':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3
      filters.value.startDate = new Date(now.getFullYear(), quarterMonth, 1).toISOString().split('T')[0]
      filters.value.endDate = new Date(now.getFullYear(), quarterMonth + 3, 0).toISOString().split('T')[0]
      break
    case 'last_quarter':
      const lastQuarterMonth = Math.floor((now.getMonth() - 3) / 3) * 3
      filters.value.startDate = new Date(now.getFullYear(), lastQuarterMonth, 1).toISOString().split('T')[0]
      filters.value.endDate = new Date(now.getFullYear(), lastQuarterMonth + 3, 0).toISOString().split('T')[0]
      break
    case 'this_year':
      filters.value.startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      filters.value.endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
      break
    case 'last_year':
      filters.value.startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0]
      filters.value.endDate = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0]
      break
  }
}

const fetchReport = async () => {
  try {
    const response = await axios.get('/api/reports/profit-and-loss', {
      params: {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    report.value = response.data
  } catch (error) {
    console.error('Error fetching profit and loss report:', error)
  }
}

const printReport = () => {
  window.print()
}

const exportToPdf = async () => {
  try {
    const response = await axios.get('/api/reports/profit-and-loss/pdf', {
      params: {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `profit-and-loss-${filters.value.startDate}-${filters.value.endDate}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error exporting PDF:', error)
  }
}

// Watch for filter changes
watch(filters, () => {
  fetchReport()
}, { deep: true })

// Initialize
onMounted(() => {
  updateDateRange()
  fetchReport()
})
</script>

<style>
@media print {
  .no-print {
    display: none;
  }
}
</style>
