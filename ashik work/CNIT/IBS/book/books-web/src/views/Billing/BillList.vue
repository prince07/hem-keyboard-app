<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Purchase Invoices</h1>
      <router-link 
        :to="{ name: 'NewBill' }"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        New Purchase Invoice
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="Search by invoice no or supplier..." 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Supplier
          </label>
          <select 
            v-model="filters.supplier" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Suppliers</option>
            <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
              {{ supplier.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select 
            v-model="filters.status" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Return">Return</option>
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
      </div>
    </div>

    <!-- Bills Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice No
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Net Total
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grand Total
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock Status
            </th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="bill in bills" :key="bill.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
              <router-link :to="`/bills/${bill.id}`">
                {{ bill.name }}
              </router-link>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ bill.party }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(bill.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
              {{ formatCurrency(bill.netTotal) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
              {{ formatCurrency(bill.grandTotal) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
              <span :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-yellow-100 text-yellow-800': bill.status === 'Draft',
                'bg-green-100 text-green-800': bill.status === 'Submitted',
                'bg-red-100 text-red-800': bill.status === 'Cancelled',
                'bg-purple-100 text-purple-800': bill.status === 'Return'
              }">
                {{ bill.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
              <span v-if="bill.stockNotTransferred > 0" class="text-orange-600">
                Pending ({{ bill.stockNotTransferred }})
              </span>
              <span v-else class="text-green-600">
                Received
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="showActions(bill)"
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
    <div v-if="selectedBill" class="fixed inset-0 z-10 overflow-y-auto" @click.self="closeActions">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Invoice Actions
                </h3>
                <div class="space-y-2">
                  <button
                    v-if="selectedBill.status === 'Draft'"
                    @click="submitBill"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Submit Invoice
                  </button>
                  <button
                    v-if="selectedBill.status === 'Submitted'"
                    @click="cancelBill"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-red-600"
                  >
                    Cancel Invoice
                  </button>
                  <button
                    v-if="selectedBill.status === 'Submitted'"
                    @click="createReturn"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Create Return
                  </button>
                  <button
                    v-if="selectedBill.status === 'Submitted' && selectedBill.stockNotTransferred > 0"
                    @click="createReceipt"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Create Receipt
                  </button>
                  <button
                    @click="printBill"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Print Invoice
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
import api from '@/services/api'

const router = useRouter()

// State
const bills = ref([])
const suppliers = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const selectedBill = ref(null)
const loading = ref(false)
const error = ref(null)

const filters = ref({
  search: '',
  supplier: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

// Methods
const fetchBills = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      page: currentPage.value,
      pageSize: 10,
      ...filters.value
    }
    
    const response = await api.get('/purchase-invoices', { params })
    bills.value = response.data.items
    totalPages.value = Math.ceil(response.data.total / 10)
  } catch (err) {
    console.error('Error fetching bills:', err)
    error.value = err.response?.data?.message || 'Failed to fetch bills'
  } finally {
    loading.value = false
  }
}

const fetchSuppliers = async () => {
  try {
    const response = await api.get('/parties', { params: { type: 'supplier' } })
    suppliers.value = response.data
  } catch (err) {
    console.error('Error fetching suppliers:', err)
  }
}

const showActions = (bill) => {
  selectedBill.value = bill
}

const closeActions = () => {
  selectedBill.value = null
}

const submitBill = async () => {
  try {
    await api.post(`/api/purchase-invoices/${selectedBill.value.id}/submit`, null)
    await fetchBills()
    closeActions()
  } catch (error) {
    console.error('Error submitting bill:', error)
  }
}

const cancelBill = async () => {
  try {
    await api.post(`/api/purchase-invoices/${selectedBill.value.id}/cancel`, null)
    await fetchBills()
    closeActions()
  } catch (error) {
    console.error('Error cancelling bill:', error)
  }
}

const createReturn = () => {
  router.push(`/bills/new?return_against=${selectedBill.value.id}`)
  closeActions()
}

const createReceipt = () => {
  router.push(`/purchase-receipts/new?invoice=${selectedBill.value.id}`)
  closeActions()
}

const printBill = () => {
  window.open(`/api/purchase-invoices/${selectedBill.value.id}/print`, '_blank')
  closeActions()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchBills()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchBills()
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

// Watch filters
watch(filters, () => {
  currentPage.value = 1
  fetchBills()
}, { deep: true })

// Initialize
onMounted(async () => {
  await Promise.all([fetchBills(), fetchSuppliers()])
})
</script>
