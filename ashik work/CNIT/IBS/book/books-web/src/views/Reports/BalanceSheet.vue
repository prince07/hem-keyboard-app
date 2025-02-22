<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Balance Sheet</h1>
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

    <!-- Date Selection -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div class="flex items-end">
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="showComparison"
              class="sr-only peer"
            >
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-700">Show Comparison</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6">
        <!-- Company Info -->
        <div class="text-center mb-8">
          <h2 class="text-xl font-bold">{{ companyName }}</h2>
          <p class="text-gray-600">Balance Sheet</p>
          <p class="text-gray-600">As of {{ formatDate(asOfDate) }}</p>
        </div>

        <!-- Assets -->
        <div class="mb-8">
          <h3 class="text-lg font-bold mb-4">Assets</h3>
          
          <!-- Current Assets -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-700 mb-2">Current Assets</h4>
            <div class="space-y-2">
              <div v-for="asset in report.currentAssets" :key="asset.accountId" class="grid grid-cols-12 gap-4">
                <div class="col-span-6 pl-4">{{ asset.accountName }}</div>
                <div class="col-span-3 text-right">{{ formatCurrency(asset.amount) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(asset.previousAmount) }}
                </div>
              </div>
              <div class="grid grid-cols-12 gap-4 font-medium border-t pt-2">
                <div class="col-span-6 pl-4">Total Current Assets</div>
                <div class="col-span-3 text-right">{{ formatCurrency(report.totalCurrentAssets) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(report.previousTotalCurrentAssets) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Fixed Assets -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-700 mb-2">Fixed Assets</h4>
            <div class="space-y-2">
              <div v-for="asset in report.fixedAssets" :key="asset.accountId" class="grid grid-cols-12 gap-4">
                <div class="col-span-6 pl-4">{{ asset.accountName }}</div>
                <div class="col-span-3 text-right">{{ formatCurrency(asset.amount) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(asset.previousAmount) }}
                </div>
              </div>
              <div class="grid grid-cols-12 gap-4 font-medium border-t pt-2">
                <div class="col-span-6 pl-4">Total Fixed Assets</div>
                <div class="col-span-3 text-right">{{ formatCurrency(report.totalFixedAssets) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(report.previousTotalFixedAssets) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Total Assets -->
          <div class="grid grid-cols-12 gap-4 font-bold border-t-2 pt-2">
            <div class="col-span-6 pl-4">Total Assets</div>
            <div class="col-span-3 text-right">{{ formatCurrency(report.totalAssets) }}</div>
            <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
              {{ formatCurrency(report.previousTotalAssets) }}
            </div>
          </div>
        </div>

        <!-- Liabilities and Equity -->
        <div>
          <h3 class="text-lg font-bold mb-4">Liabilities and Equity</h3>

          <!-- Current Liabilities -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-700 mb-2">Current Liabilities</h4>
            <div class="space-y-2">
              <div v-for="liability in report.currentLiabilities" :key="liability.accountId" class="grid grid-cols-12 gap-4">
                <div class="col-span-6 pl-4">{{ liability.accountName }}</div>
                <div class="col-span-3 text-right">{{ formatCurrency(liability.amount) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(liability.previousAmount) }}
                </div>
              </div>
              <div class="grid grid-cols-12 gap-4 font-medium border-t pt-2">
                <div class="col-span-6 pl-4">Total Current Liabilities</div>
                <div class="col-span-3 text-right">{{ formatCurrency(report.totalCurrentLiabilities) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(report.previousTotalCurrentLiabilities) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Long-term Liabilities -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-700 mb-2">Long-term Liabilities</h4>
            <div class="space-y-2">
              <div v-for="liability in report.longTermLiabilities" :key="liability.accountId" class="grid grid-cols-12 gap-4">
                <div class="col-span-6 pl-4">{{ liability.accountName }}</div>
                <div class="col-span-3 text-right">{{ formatCurrency(liability.amount) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(liability.previousAmount) }}
                </div>
              </div>
              <div class="grid grid-cols-12 gap-4 font-medium border-t pt-2">
                <div class="col-span-6 pl-4">Total Long-term Liabilities</div>
                <div class="col-span-3 text-right">{{ formatCurrency(report.totalLongTermLiabilities) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(report.previousTotalLongTermLiabilities) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Equity -->
          <div class="mb-4">
            <h4 class="font-medium text-gray-700 mb-2">Equity</h4>
            <div class="space-y-2">
              <div v-for="equity in report.equity" :key="equity.accountId" class="grid grid-cols-12 gap-4">
                <div class="col-span-6 pl-4">{{ equity.accountName }}</div>
                <div class="col-span-3 text-right">{{ formatCurrency(equity.amount) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(equity.previousAmount) }}
                </div>
              </div>
              <div class="grid grid-cols-12 gap-4 font-medium border-t pt-2">
                <div class="col-span-6 pl-4">Total Equity</div>
                <div class="col-span-3 text-right">{{ formatCurrency(report.totalEquity) }}</div>
                <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
                  {{ formatCurrency(report.previousTotalEquity) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Total Liabilities and Equity -->
          <div class="grid grid-cols-12 gap-4 font-bold border-t-2 pt-2">
            <div class="col-span-6 pl-4">Total Liabilities and Equity</div>
            <div class="col-span-3 text-right">{{ formatCurrency(report.totalLiabilitiesAndEquity) }}</div>
            <div v-if="showComparison" class="col-span-3 text-right text-gray-600">
              {{ formatCurrency(report.previousTotalLiabilitiesAndEquity) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const auth = useAuthStore()
const companyName = ref('Your Company Name')

const asOfDate = ref(new Date().toISOString().split('T')[0])
const showComparison = ref(false)

const report = ref({
  currentAssets: [],
  fixedAssets: [],
  totalCurrentAssets: 0,
  totalFixedAssets: 0,
  totalAssets: 0,
  currentLiabilities: [],
  longTermLiabilities: [],
  equity: [],
  totalCurrentLiabilities: 0,
  totalLongTermLiabilities: 0,
  totalEquity: 0,
  totalLiabilitiesAndEquity: 0,
  // Previous period amounts for comparison
  previousTotalCurrentAssets: 0,
  previousTotalFixedAssets: 0,
  previousTotalAssets: 0,
  previousTotalCurrentLiabilities: 0,
  previousTotalLongTermLiabilities: 0,
  previousTotalEquity: 0,
  previousTotalLiabilitiesAndEquity: 0
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

const fetchReport = async () => {
  try {
    const response = await axios.get('/api/reports/balance-sheet', {
      params: {
        asOfDate: asOfDate.value,
        showComparison: showComparison.value
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    report.value = response.data
  } catch (error) {
    console.error('Error fetching balance sheet:', error)
  }
}

const printReport = () => {
  window.print()
}

const exportToPdf = async () => {
  try {
    const response = await axios.get('/api/reports/balance-sheet/pdf', {
      params: {
        asOfDate: asOfDate.value,
        showComparison: showComparison.value
      },
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `balance-sheet-${asOfDate.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error exporting PDF:', error)
  }
}

// Watch for changes
watch([asOfDate, showComparison], () => {
  fetchReport()
})

// Initialize
onMounted(() => {
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
