<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Payments</h1>
      <div class="flex space-x-4">
        <button
          @click="exportPayments"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <i class="fas fa-download mr-2"></i> Export
        </button>
        <router-link 
          to="/payments/new" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          New Payment
        </router-link>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="Search by payment no or party..." 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Party
          </label>
          <select 
            v-model="filters.party" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Parties</option>
            <option v-for="party in parties" :key="party.id" :value="party.id">
              {{ party.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Payment Type
          </label>
          <select 
            v-model="filters.paymentType" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Pay">Pay</option>
            <option value="Receive">Receive</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div class="flex space-x-2">
            <input 
              type="date" 
              v-model="filters.dateFrom" 
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <input 
              type="date" 
              v-model="filters.dateTo" 
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select 
            v-model="filters.status" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select 
            v-model="filters.paymentMethod" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Card">Card</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Amount Range
          </label>
          <div class="flex space-x-2">
            <input 
              type="number" 
              v-model="filters.amountFrom" 
              placeholder="Min"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <input 
              type="number" 
              v-model="filters.amountTo" 
              placeholder="Max"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedPayments.length > 0" class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-700">
          {{ selectedPayments.length }} payment(s) selected
        </div>
        <div class="flex space-x-4">
          <button
            @click="bulkSubmit"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Submit Selected
          </button>
          <button
            @click="bulkCancel"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cancel Selected
          </button>
          <button
            @click="bulkPrint"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Print Selected
          </button>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left">
              <input
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment No
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Party
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <input
                type="checkbox"
                v-model="selectedPayments"
                :value="payment.id"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
              <router-link :to="`/payments/${payment.id}`">
                {{ payment.name }}
              </router-link>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ payment.party }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(payment.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-green-100 text-green-800': payment.paymentType === 'Receive',
                'bg-blue-100 text-blue-800': payment.paymentType === 'Pay'
              }">
                {{ payment.paymentType }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
              {{ formatCurrency(payment.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
              <span :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-yellow-100 text-yellow-800': payment.status === 'Draft',
                'bg-green-100 text-green-800': payment.status === 'Submitted',
                'bg-red-100 text-red-800': payment.status === 'Cancelled'
              }">
                {{ payment.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
              {{ payment.paymentMethod }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="showActions(payment)"
                class="text-gray-400 hover:text-gray-600"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-700">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalRecords }} entries
          </div>
          <div class="flex space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="endIndex >= totalRecords"
              class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Modal -->
    <div v-if="selectedPayment" class="fixed inset-0 z-10 overflow-y-auto" @click.self="closeActions">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Payment Actions
                </h3>
                <div class="space-y-2">
                  <button
                    v-if="selectedPayment.status === 'Draft'"
                    @click="submitPayment"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Submit Payment
                  </button>
                  <button
                    v-if="selectedPayment.status === 'Submitted'"
                    @click="cancelPayment"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-red-600"
                  >
                    Cancel Payment
                  </button>
                  <button
                    @click="printPayment"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Print Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeActions"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { useAuth } from '@/composables/auth'

const auth = useAuth()
const router = useRouter()

// State
const payments = ref([])
const parties = ref([])
const selectedPayment = ref(null)
const totalRecords = ref(0)
const currentPage = ref(1)
const pageSize = 10
const selectedPayments = ref([])
const selectAll = ref(false)

// Filters
const filters = ref({
  search: '',
  party: '',
  paymentType: '',
  dateFrom: '',
  dateTo: '',
  status: '',
  paymentMethod: '',
  amountFrom: '',
  amountTo: ''
})

// Computed
const startIndex = computed(() => (currentPage.value - 1) * pageSize)
const endIndex = computed(() => Math.min(startIndex.value + pageSize, totalRecords.value))

// Methods
const fetchPayments = async () => {
  try {
    const response = await axios.get('/api/payments', {
      params: {
        page: currentPage.value,
        pageSize,
        ...filters.value
      },
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    payments.value = response.data.payments
    totalRecords.value = response.data.total
  } catch (error) {
    console.error('Error fetching payments:', error)
  }
}

const fetchParties = async () => {
  try {
    const response = await axios.get('/api/parties', {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    parties.value = response.data
  } catch (error) {
    console.error('Error fetching parties:', error)
  }
}

const showActions = (payment) => {
  selectedPayment.value = payment
}

const closeActions = () => {
  selectedPayment.value = null
}

const submitPayment = async () => {
  try {
    await axios.post(`/api/payments/${selectedPayment.value.id}/submit`, null, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    await fetchPayments()
    closeActions()
  } catch (error) {
    console.error('Error submitting payment:', error)
  }
}

const cancelPayment = async () => {
  try {
    await axios.post(`/api/payments/${selectedPayment.value.id}/cancel`, null, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    await fetchPayments()
    closeActions()
  } catch (error) {
    console.error('Error cancelling payment:', error)
  }
}

const printPayment = () => {
  window.open(`/api/payments/${selectedPayment.value.id}/print`, '_blank')
  closeActions()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchPayments()
  }
}

const nextPage = () => {
  if (endIndex.value < totalRecords.value) {
    currentPage.value++
    fetchPayments()
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedPayments.value = payments.value.map(p => p.id)
  } else {
    selectedPayments.value = []
  }
}

const bulkSubmit = async () => {
  try {
    await axios.post('/api/payments/bulk-submit', {
      paymentIds: selectedPayments.value
    })
    await fetchPayments()
    selectedPayments.value = []
    selectAll.value = false
  } catch (error) {
    console.error('Error submitting payments:', error)
  }
}

const bulkCancel = async () => {
  try {
    await axios.post('/api/payments/bulk-cancel', {
      paymentIds: selectedPayments.value
    })
    await fetchPayments()
    selectedPayments.value = []
    selectAll.value = false
  } catch (error) {
    console.error('Error cancelling payments:', error)
  }
}

const bulkPrint = () => {
  const selectedDocs = payments.value.filter(p => selectedPayments.value.includes(p.id))
  selectedDocs.forEach(payment => {
    const printWindow = window.open('', '_blank')
    const content = generatePrintContent(payment)
    printWindow.document.write(content)
    printWindow.document.close()
  })
}

const exportPayments = () => {
  const data = payments.value.map(p => ({
    'Payment No': p.name,
    'Party': p.party,
    'Date': formatDate(p.date),
    'Type': p.paymentType,
    'Amount': p.amount,
    'Status': p.status,
    'Method': p.paymentMethod
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Payments')
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(dataBlob, `payments_${formatDate(new Date())}.xlsx`)
}

const resetFilters = () => {
  filters.value = {
    search: '',
    party: '',
    paymentType: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    paymentMethod: '',
    amountFrom: '',
    amountTo: ''
  }
}

const generatePrintContent = (payment) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment - ${payment.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin-bottom: 30px; }
          .row { display: flex; margin-bottom: 10px; }
          .label { font-weight: bold; width: 150px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Payment Receipt</h1>
          <h2>${payment.name}</h2>
        </div>
        <div class="details">
          <div class="row">
            <span class="label">Party:</span>
            <span>${payment.party}</span>
          </div>
          <div class="row">
            <span class="label">Date:</span>
            <span>${formatDate(payment.date)}</span>
          </div>
          <div class="row">
            <span class="label">Amount:</span>
            <span>${formatCurrency(payment.amount)}</span>
          </div>
          <div class="row">
            <span class="label">Payment Type:</span>
            <span>${payment.paymentType}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method:</span>
            <span>${payment.paymentMethod}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span>${payment.status}</span>
          </div>
        </div>
      </body>
    </html>
  `
}

// Watch filters
watch(filters, () => {
  currentPage.value = 1
  fetchPayments()
}, { deep: true })

// Initial load
onMounted(() => {
  fetchPayments()
  fetchParties()
})
</script>
