<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit Invoice' : 'New Invoice' }}</h1>
      <div class="flex space-x-4">
        <button 
          @click="saveAsDraft" 
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Save as Draft
        </button>
        <button 
          @click="saveAndSend" 
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Save and Send
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="handleSubmit">
        <!-- Customer Information -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select 
              v-model="invoice.customerId"
              required
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date
            </label>
            <input 
              type="date" 
              v-model="invoice.date"
              required
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>

        <!-- Invoice Items -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Items</h3>
            <button 
              type="button"
              @click="addItem"
              class="text-blue-500 hover:text-blue-700"
            >
              Add Item
            </button>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(item, index) in invoice.items" 
              :key="index"
              class="grid grid-cols-12 gap-4 items-center"
            >
              <div class="col-span-4">
                <input 
                  type="text"
                  v-model="item.description"
                  placeholder="Item description"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div class="col-span-2">
                <input 
                  type="number"
                  v-model="item.quantity"
                  placeholder="Quantity"
                  required
                  min="1"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div class="col-span-2">
                <input 
                  type="number"
                  v-model="item.price"
                  placeholder="Price"
                  required
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div class="col-span-3">
                <select 
                  v-model="item.taxRate"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">No Tax</option>
                  <option value="0.1">10% Tax</option>
                  <option value="0.2">20% Tax</option>
                </select>
              </div>
              <div class="col-span-1">
                <button 
                  type="button"
                  @click="removeItem(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="border-t pt-6">
          <div class="flex justify-end">
            <div class="w-64 space-y-2">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Tax</span>
                <span>{{ formatCurrency(taxAmount) }}</span>
              </div>
              <div class="flex justify-between font-semibold">
                <span>Total</span>
                <span>{{ formatCurrency(total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isEditing = computed(() => route.params.id !== undefined)

const invoice = ref({
  customerId: '',
  date: new Date().toISOString().split('T')[0],
  items: [],
  status: 'draft'
})

const customers = ref([])

// Computed properties
const subtotal = computed(() => {
  return invoice.value.items.reduce((total, item) => {
    return total + (item.quantity * item.price)
  }, 0)
})

const taxAmount = computed(() => {
  return invoice.value.items.reduce((total, item) => {
    return total + (item.quantity * item.price * parseFloat(item.taxRate))
  }, 0)
})

const total = computed(() => subtotal.value + taxAmount.value)

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const addItem = () => {
  invoice.value.items.push({
    description: '',
    quantity: 1,
    price: 0,
    taxRate: '0'
  })
}

const removeItem = (index: number) => {
  invoice.value.items.splice(index, 1)
}

const saveInvoice = async (status: string) => {
  try {
    const data = {
      ...invoice.value,
      status,
      subtotal: subtotal.value,
      tax: taxAmount.value,
      total: total.value
    }

    if (isEditing.value) {
      await axios.put(`/api/invoices/${route.params.id}`, data, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
    } else {
      await axios.post('/api/invoices', data, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
    }

    router.push('/invoices')
  } catch (error) {
    console.error('Error saving invoice:', error)
  }
}

const saveAsDraft = () => saveInvoice('draft')
const saveAndSend = () => saveInvoice('sent')

// Fetch customers
const fetchCustomers = async () => {
  try {
    const response = await axios.get('/api/customers', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    customers.value = response.data
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
}

// Fetch invoice if editing
const fetchInvoice = async () => {
  if (!isEditing.value) return

  try {
    const response = await axios.get(`/api/invoices/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    invoice.value = response.data
  } catch (error) {
    console.error('Error fetching invoice:', error)
  }
}

onMounted(() => {
  fetchCustomers()
  fetchInvoice()
})
</script>
