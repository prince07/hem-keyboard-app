<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Invoices</h1>
      <router-link 
        to="/invoices/new" 
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Create New Invoice
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Search invoices..." 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select 
          v-model="filters.status" 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <input 
          type="date" 
          v-model="filters.dateFrom" 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <input 
          type="date" 
          v-model="filters.dateTo" 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice #
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ invoice.number }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ invoice.customer }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(invoice.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(invoice.dueDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatCurrency(invoice.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                getStatusClass(invoice.status)
              ]">
                {{ invoice.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="viewInvoice(invoice)" 
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                View
              </button>
              <button 
                @click="editInvoice(invoice)" 
                class="text-green-600 hover:text-green-900 mr-3"
              >
                Edit
              </button>
              <button 
                @click="deleteInvoice(invoice)" 
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const router = useRouter()
const auth = useAuthStore()

const filters = ref({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

const invoices = ref([])

// Fetch invoices
const fetchInvoices = async () => {
  try {
    const response = await axios.get('/api/invoices', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    invoices.value = response.data
  } catch (error) {
    console.error('Error fetching invoices:', error)
  }
}

// Computed filtered invoices
const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(filters.value.search.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesStatus = !filters.value.status || invoice.status === filters.value.status
    const matchesDateRange = (!filters.value.dateFrom || invoice.date >= filters.value.dateFrom) &&
                           (!filters.value.dateTo || invoice.date <= filters.value.dateTo)
    return matchesSearch && matchesStatus && matchesDateRange
  })
})

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

// Get status class for styling
const getStatusClass = (status: string) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  }
  return classes[status] || classes.draft
}

// Actions
const viewInvoice = (invoice: any) => {
  router.push(`/invoices/${invoice.id}`)
}

const editInvoice = (invoice: any) => {
  router.push(`/invoices/${invoice.id}/edit`)
}

const deleteInvoice = async (invoice: any) => {
  if (!confirm('Are you sure you want to delete this invoice?')) return

  try {
    await axios.delete(`/api/invoices/${invoice.id}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    await fetchInvoices()
  } catch (error) {
    console.error('Error deleting invoice:', error)
  }
}

// Fetch invoices on mount
fetchInvoices()
</script>
